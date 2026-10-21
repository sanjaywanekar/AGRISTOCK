import tensorflow as tf
import numpy as np
from pathlib import Path
from collections import defaultdict
from PIL import Image

MODEL_PATH = "model/leaf_model_finetuned.keras"
TEST_DIR = Path("manual_test")

IMG_SIZE = (224, 224)

CLASS_NAMES = [
    "Healthy",
    "Magnesium",
    "Nitrogen",
    "Phosphorus",
    "Potassium",
]

THRESHOLDS = [0.50, 0.60, 0.70, 0.75, 0.80, 0.85, 0.90]


print("Loading fine-tuned model...")

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={
        "preprocess_input":
        tf.keras.applications.mobilenet_v2.preprocess_input
    }
)

print("Model loaded successfully.\n")


# ---------------------------------------------------------
# COLLECT ALL PREDICTIONS
# ---------------------------------------------------------

results = []

for actual_class in CLASS_NAMES:

    class_dir = TEST_DIR / actual_class

    for image_path in sorted(class_dir.iterdir()):

        if image_path.suffix.lower() not in [
            ".jpg",
            ".jpeg",
            ".png",
            ".jfif"
        ]:
            continue

        image = Image.open(image_path).convert("RGB")
        image = image.resize(IMG_SIZE)

        image_array = np.array(
            image,
            dtype=np.float32
        )

        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        predictions = model.predict(
            image_array,
            verbose=0
        )[0]

        predicted_index = int(
            np.argmax(predictions)
        )

        predicted_class = CLASS_NAMES[
            predicted_index
        ]

        confidence = float(
            predictions[predicted_index]
        )

        results.append({
            "actual": actual_class,
            "predicted": predicted_class,
            "confidence": confidence
        })


# ---------------------------------------------------------
# TEST DIFFERENT THRESHOLDS
# ---------------------------------------------------------

print("=" * 90)
print("CONFIDENCE THRESHOLD ANALYSIS")
print("=" * 90)

print(
    f"{'Threshold':<12}"
    f"{'Accepted':<12}"
    f"{'Rejected':<12}"
    f"{'Correct':<12}"
    f"{'Wrong':<12}"
    f"{'Accuracy':<15}"
    f"{'Coverage':<12}"
)

print("-" * 90)


for threshold in THRESHOLDS:

    accepted = [
        r for r in results
        if r["confidence"] >= threshold
    ]

    rejected = [
        r for r in results
        if r["confidence"] < threshold
    ]

    correct = [
        r for r in accepted
        if r["actual"] == r["predicted"]
    ]

    wrong = [
        r for r in accepted
        if r["actual"] != r["predicted"]
    ]

    accepted_count = len(accepted)
    rejected_count = len(rejected)
    correct_count = len(correct)
    wrong_count = len(wrong)

    if accepted_count > 0:
        accuracy = (
            correct_count /
            accepted_count *
            100
        )
    else:
        accuracy = 0

    coverage = (
        accepted_count /
        len(results) *
        100
    )

    print(
        f"{threshold:.0%}"
        f"{'':<10}"
        f"{accepted_count:<12}"
        f"{rejected_count:<12}"
        f"{correct_count:<12}"
        f"{wrong_count:<12}"
        f"{accuracy:.2f}%"
        f"{'':<8}"
        f"{coverage:.2f}%"
    )


# ---------------------------------------------------------
# SHOW REJECTED IMAGES AT 70%
# ---------------------------------------------------------

threshold = 0.70

print("\n")
print("=" * 90)
print(f"PREDICTIONS REJECTED AT {threshold:.0%} THRESHOLD")
print("=" * 90)

for r in results:

    if r["confidence"] < threshold:

        print(
            f"Actual: {r['actual']:<12} "
            f"Predicted: {r['predicted']:<12} "
            f"Confidence: {r['confidence']:.2%}"
        )


print("\n")
print("=" * 90)
print("Threshold analysis complete.")
print("=" * 90)