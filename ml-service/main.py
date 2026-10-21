from fastapi import FastAPI, File, UploadFile
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json


# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------

MODEL_PATH = "model/leaf_model_finetuned.keras"
CLASS_NAMES_PATH = "model/class_names.json"

IMG_SIZE = (224, 224)

# MVP confidence threshold
CONFIDENCE_THRESHOLD = 0.60


# ---------------------------------------------------------
# LOAD MODEL
# ---------------------------------------------------------

print("Loading ML model...")

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={
        "preprocess_input":
        tf.keras.applications.mobilenet_v2.preprocess_input
    }
)

print("Model loaded successfully.")


# ---------------------------------------------------------
# LOAD CLASS NAMES
# ---------------------------------------------------------

with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)

print("Classes:", class_names)


# ---------------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------------

app = FastAPI(
    title="AGRISTOCK ML Service",
    description="Maize nutrient deficiency prediction service",
    version="1.0.0"
)


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "AGRISTOCK ML Service",
        "status": "running"
    }


# ---------------------------------------------------------
# PREDICTION ENDPOINT
# ---------------------------------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Check that a file was actually uploaded
    if not file:
        return {
            "message": "Image file is required"
        }

    try:

        # -------------------------------------------------
        # READ IMAGE
        # -------------------------------------------------

        contents = await file.read()

        image = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")

        # Resize to model input size
        image = image.resize(IMG_SIZE)

        # Convert to numpy array
        image_array = np.array(
            image,
            dtype=np.float32
        )

        # Add batch dimension
        image_array = np.expand_dims(
            image_array,
            axis=0
        )

        # -------------------------------------------------
        # MODEL PREDICTION
        # -------------------------------------------------

        predictions = model.predict(
            image_array,
            verbose=0
        )[0]

        predicted_index = int(
            np.argmax(predictions)
        )

        label = class_names[predicted_index]

        confidence = float(
            predictions[predicted_index]
        )

        # -------------------------------------------------
        # APPLY CONFIDENCE THRESHOLD
        # -------------------------------------------------

        accepted = (
            confidence >= CONFIDENCE_THRESHOLD
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return {
            "label": label,
            "confidence": confidence,
            "accepted": accepted,
            "threshold": CONFIDENCE_THRESHOLD
        }

    except Exception as error:

        print("Prediction error:", error)

        return {
            "message": "Failed to process image",
            "error": str(error)
        }