import tensorflow as tf
import numpy as np
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing import image
import os

print("🚀 Flask app starting...")

app = Flask(__name__)

# ✅ Get correct path automatically
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "skin_model.h5")

print("📂 Loading model from:", MODEL_PATH)

# Load model
model = tf.keras.models.load_model(MODEL_PATH)

# Class names (your 22 classes)
class_names = [
    'Acne','Actinic_Keratosis','Benign_tumors','Bullous','Candidiasis',
    'DrugEruption','Eczema','Infestations_Bites','Lichen','Lupus',
    'Moles','Psoriasis','Rosacea','Seborrh_Keratoses','SkinCancer',
    'Sun_Sunlight_Damage','Tinea','Unknown_Normal','Vascular_Tumors',
    'Vasculitis','Vitiligo','Warts'
]

@app.route('/')
def home():
    return "Skin Disease Prediction API Running 🚀"

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"})

    file = request.files['image']

    img = image.load_img(file, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array)
    class_index = np.argmax(prediction)
    result = class_names[class_index]

    return jsonify({
        "prediction": result
    })

if __name__ == '__main__':
    app.run(debug=True)