import tensorflow as tf
import numpy as np
import json
from sklearn.utils.class_weight import compute_class_weight

DATA_DIR = "data/Maize Nutrient Deficiency Dataset/Maize Nutrient Deficiency Dataset"

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
SEED = 123

print("Loading dataset...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="training",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="validation",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

class_names = train_ds.class_names

print("\nClasses:")
for i, name in enumerate(class_names):
    print(f"{i}: {name}")

with open("model/class_names.json", "w") as f:
    json.dump(class_names, f)

# ---------------------------------------------------------
# CLASS WEIGHTS
# ---------------------------------------------------------

print("\nCalculating class weights...")

all_labels = np.concatenate([
    y.numpy() for _, y in train_ds
])

weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(all_labels),
    y=all_labels
)

class_weight_dict = dict(enumerate(weights))

print("Class weights:")
for name, weight in zip(class_names, weights):
    print(f"{name}: {weight:.4f}")

# ---------------------------------------------------------
# DATA AUGMENTATION
# ---------------------------------------------------------

data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.15),
    tf.keras.layers.RandomZoom(0.15),
    tf.keras.layers.RandomBrightness(0.15),
    tf.keras.layers.RandomContrast(0.15),
])

# ---------------------------------------------------------
# MOBILENETV2
# ---------------------------------------------------------

print("\nLoading MobileNetV2...")

base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet"
)

# Start with the whole base frozen
base_model.trainable = False

model = tf.keras.Sequential([
    data_augmentation,

    tf.keras.layers.Lambda(
        tf.keras.applications.mobilenet_v2.preprocess_input
    ),

    base_model,

    tf.keras.layers.GlobalAveragePooling2D(),

    tf.keras.layers.Dense(
        64,
        activation="relu"
    ),

    tf.keras.layers.Dropout(0.4),

    tf.keras.layers.Dense(
        len(class_names),
        activation="softmax"
    )
])

# ---------------------------------------------------------
# STAGE 1
# ---------------------------------------------------------

print("\nStage 1: Training classifier head...")

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-3
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy",
    patience=4,
    restore_best_weights=True
)

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=10,
    class_weight=class_weight_dict,
    callbacks=[early_stop]
)

# ---------------------------------------------------------
# STAGE 2 - FINE TUNING
# ---------------------------------------------------------

print("\nStage 2: Fine-tuning MobileNetV2...")

base_model.trainable = True

# Freeze everything except the last 30 layers
for layer in base_model.layers[:-30]:
    layer.trainable = False

# Keep BatchNormalization layers frozen
for layer in base_model.layers:
    if isinstance(layer, tf.keras.layers.BatchNormalization):
        layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

fine_tune_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy",
    patience=5,
    restore_best_weights=True
)

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=15,
    class_weight=class_weight_dict,
    callbacks=[fine_tune_stop]
)

# ---------------------------------------------------------
# BEST VALIDATION ACCURACY
# ---------------------------------------------------------

best_accuracy = max(history.history["val_accuracy"])

print(
    f"\nBest fine-tuning validation accuracy: "
    f"{best_accuracy * 100:.2f}%"
)

# ---------------------------------------------------------
# SAVE NEW MODEL
# ---------------------------------------------------------

model.save("model/leaf_model_finetuned.keras")

print("\nFine-tuned model saved to:")
print("model/leaf_model_finetuned.keras")

print("\nClass mapping:")
print(class_names)