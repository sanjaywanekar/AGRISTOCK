import tensorflow as tf
import numpy as np
from pathlib import Path
from PIL import Image
from collections import defaultdict

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

print("Loading trained model...")
model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={
        "preprocess_input": tf.keras.applications.mobilenet_v2.preprocess_input
    }
)

total = 0
correct = 0

class_results = defaultdict(lambda: {
    "total": 0,
    "correct": 0
})

print("\n" + "=" * 80)
print("MANUAL TEST RESULTS")
print("=" * 80)

for actual_class in CLASS_NAMES:

    class_dir = TEST_DIR / actual_class

    if not class_dir.exists():
        print(f"Missing folder: {class_dir}")
        continue

    for image_path in sorted(class_dir.iterdir()):

        if image_path.suffix.lower() not in [
            ".jpg", ".jpeg", ".png", ".jfif"
        ]:
            continue

        try:
            image = Image.open(image_path).convert("RGB")
            image = image.resize(IMG_SIZE)

            image_array = np.array(image, dtype=np.float32)

            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)

            predictions = model.predict(
                image_array,
                verbose=0
            )[0]

            predicted_index = int(np.argmax(predictions))
            predicted_class = CLASS_NAMES[predicted_index]
            confidence = float(predictions[predicted_index])

            total += 1
            class_results[actual_class]["total"] += 1

            if predicted_class == actual_class:
                correct += 1
                class_results[actual_class]["correct"] += 1
                result = "CORRECT"
            else:
                result = "WRONG"

            print(
                f"{image_path.name:<20} "
                f"Actual: {actual_class:<12} "
                f"Predicted: {predicted_class:<12} "
                f"Confidence: {confidence:.2%} "
                f"{result}"
            )

        except Exception as error:
            print(
                f"Error processing {image_path.name}: {error}"
            )

# ============================================================
# OVERALL RESULTS
# ============================================================

print("\n" + "=" * 80)
print("OVERALL RESULTS")
print("=" * 80)

if total > 0:
    accuracy = correct / total * 100

    print(f"Total images       : {total}")
    print(f"Correct predictions: {correct}")
    print(f"Wrong predictions  : {total - correct}")
    print(f"Manual test accuracy: {accuracy:.2f}%")

# ============================================================
# CLASS-WISE RESULTS
# ============================================================

print("\n" + "=" * 80)
print("CLASS-WISE ACCURACY")
print("=" * 80)

for class_name in CLASS_NAMES:

    result = class_results[class_name]

    if result["total"] > 0:
        class_accuracy = (
            result["correct"] /
            result["total"] *
            100
        )

        print(
            f"{class_name:<12} "
            f"{result['correct']}/{result['total']} "
            f"correct "
            f"({class_accuracy:.2f}%)"
        )

print("\n" + "=" * 80)
print("Manual evaluation complete.")
print("=" * 80)