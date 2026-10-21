import tensorflow as tf
import numpy as np
import json
from sklearn.utils.class_weight import compute_class_weight

# ============================================================
# CONFIGURATION
# ============================================================

DATA_DIR = "data/Maize Nutrient Deficiency Dataset/Maize Nutrient Deficiency Dataset"

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
SEED = 123

# ============================================================
# LOAD DATASET
# ============================================================

print("Loading dataset...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="training",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset="validation",
    seed=SEED,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
)

# ============================================================
# CLASS NAMES
# ============================================================

class_names = train_ds.class_names

print("\nClasses detected:")

for index, name in enumerate(class_names):
    print(f"{index}: {name}")

# Create model directory
import os
os.makedirs("model", exist_ok=True)

# Save class mapping
with open("model/class_names.json", "w") as f:
    json.dump(class_names, f, indent=2)

# ============================================================
# CLASS WEIGHTS
# ============================================================

print("\nCalculating class weights...")

all_labels = np.concatenate([
    y.numpy()
    for _, y in train_ds
])

weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(all_labels),
    y=all_labels
)

class_weight_dict = dict(
    enumerate(weights)
)

print("\nClass weights:")

for name, weight in zip(class_names, weights):
    print(f"{name}: {weight:.4f}")

# ============================================================
# DATA AUGMENTATION
# ============================================================

data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.15),
    tf.keras.layers.RandomZoom(0.15),
    tf.keras.layers.RandomBrightness(0.15),
    tf.keras.layers.RandomContrast(0.15),
])

# ============================================================
# DATA PIPELINE PERFORMANCE
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(
    buffer_size=AUTOTUNE
)

val_ds = val_ds.prefetch(
    buffer_size=AUTOTUNE
)

# ============================================================
# MOBILE NET V2
# ============================================================

print("\nLoading MobileNetV2...")

base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet"
)

# Freeze pretrained model
base_model.trainable = False

# ============================================================
# BUILD MODEL
# ============================================================

model = tf.keras.Sequential([
    tf.keras.layers.Input(
        shape=IMG_SIZE + (3,)
    ),

    data_augmentation,

    tf.keras.layers.Rescaling(
        1.0 / 255
    ),

    base_model,

    tf.keras.layers.GlobalAveragePooling2D(),

    tf.keras.layers.Dense(
        64,
        activation="relu"
    ),

    tf.keras.layers.Dropout(
        0.4
    ),

    tf.keras.layers.Dense(
        len(class_names),
        activation="softmax"
    ),
])

# ============================================================
# COMPILE
# ============================================================

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# ============================================================
# MODEL SUMMARY
# ============================================================

model.summary()

# ============================================================
# EARLY STOPPING
# ============================================================

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy",
    patience=5,
    restore_best_weights=True
)

# ============================================================
# TRAIN
# ============================================================

print("\n========================================")
print("Starting model training...")
print("========================================\n")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=30,
    class_weight=class_weight_dict,
    callbacks=[early_stop]
)

# ============================================================
# BEST VALIDATION ACCURACY
# ============================================================

best_val_accuracy = max(
    history.history["val_accuracy"]
)

print("\n========================================")
print("Training completed")
print("========================================")

print(
    f"Best validation accuracy: "
    f"{best_val_accuracy * 100:.2f}%"
)

# ============================================================
# SAVE MODEL
# ============================================================

model.save(
    "model/leaf_model.keras"
)

print("\nModel saved to:")
print("model/leaf_model.keras")

print("\nClass mapping saved to:")
print("model/class_names.json")

print("\nClasses:")
print(class_names)