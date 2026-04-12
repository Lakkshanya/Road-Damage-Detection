import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import cv2
import json
import time

app = Flask(__name__)

import json

# Path to the trained model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.h5')
LABEL_PATH = os.path.join(BASE_DIR, 'class_indices.json')
model = None
LABELS = {}

def load_ml_resources():
    global model, LABELS
    # 1. Load Model
    if os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"Successfully loaded model from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print(f"Model file not found at {MODEL_PATH}")

    # 2. Dynamic Label Mapping
    if os.path.exists(LABEL_PATH):
        try:
            with open(LABEL_PATH, 'r') as f:
                indices = json.load(f)
                # Reverse the dict so we can look up by index
                LABELS = {v: k for k, v in indices.items()}
                print(f"Loaded label mapping: {LABELS}")
        except Exception as e:
            print(f"Error loading labels: {e}")
            LABELS = {0: 'Crack', 1: 'Manhole', 2: 'Normal', 3: 'Pothole'}
    else:
        print(f"Label file not found at {LABEL_PATH}, using defaults.")
        LABELS = {0: 'Crack', 1: 'Manhole', 2: 'Normal', 3: 'Pothole'}

# Load resources immediately on startup
load_ml_resources()

def preprocess_image(image):
    image = image.convert('RGB')
    image = image.resize((224, 224)) # Optimized resolution for MobileNetV2
    img_array = np.array(image).astype('float32')
    # Use the official preprocess_input for MobileNetV2 consistency
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def calculate_severity(label, confidence):
    """
    Pseudo-logic for severity calculation.
    In a real-world scenario, this would be based on the area of the damage.
    """
    if label == 'Normal':
        return 'N/A'
    
    if confidence > 0.85:
        return 'High'
    elif confidence > 0.65:
        return 'Medium'
    else:
        return 'Low'

def detect_circles(image_bytes):
    """
    Uses traditional CV (Hough Circle Transform) to detect rigid circular shapes 
    like manhole covers. Tuning: param2=70 (EXTRA high strictness).
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.medianBlur(gray, 5)
        
        # Hough Circle Detection (Increased param2 for higher strictness)
        circles = cv2.HoughCircles(
            gray, cv2.HOUGH_GRADIENT, dp=1.2, minDist=100,
            param1=50, param2=70, minRadius=50, maxRadius=400
        )
        
        valid_circles = 0
        if circles is not None:
            for circle in circles[0]:
                center_x = circle[0]
                center_y = circle[1]
                # ZONING: Ignore circles in the top 40% (sky/mountain) AND left/right 25% (trees/foliage)
                if center_y > (height * 0.4) and (width * 0.25 < center_x < width * 0.75):
                    valid_circles += 1
                    
        # A real manhole will generate 1 to 3 concentric circles.
        # If we detect 16 circles, the CV algorithm is picking up gravel/noisy pavement.
        return (0 < valid_circles <= 3), valid_circles
    except Exception as e:
        print(f"Circle detection error: {e}")
        return False, 0

def detect_lines(image_bytes):
    """
    Detects long linear patterns using Hough Line Transform.
    Used to distinguish Cracks from Potholes.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        
        # Detect long lines (threshold=100, minLineLength=100)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=100, maxLineGap=10)
        
        valid_lines = 0
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                # ZONING: Ignore lines in the top 40% (sky/background) AND left/right 25% (trees/foliage)
                if (y1 > height * 0.4 and y2 > height * 0.4) and \
                   (width * 0.25 < x1 < width * 0.75) and \
                   (width * 0.25 < x2 < width * 0.75):
                    # Check length
                    length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
                    if length > 120:
                        valid_lines += 1
                        
        # A real crack should have a distinct, dominant line. 
        # If there are dozens of lines, it's busy texture (like brick or aggregate).
        return (0 < valid_lines <= 10), valid_lines
    except Exception as e:
        print(f"Line detection error: {e}")
        return False, 0

@app.route('/predict', methods=['POST'])
def predict():
    start_time = time.time() # Start the timer
    
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    img_bytes = file.read()
    image = Image.open(io.BytesIO(img_bytes))
    
    # 1. AI PREDICTION
    processed_img = preprocess_image(image)
    predictions = model.predict(processed_img, verbose=0)[0]
    
    # Get top results
    top_indices = predictions.argsort()[-2:][::-1]
    best_idx = top_indices[0]
    second_idx = top_indices[1]
    
    best_label = LABELS[best_idx]
    best_conf = float(predictions[best_idx])
    
    second_label = LABELS[second_idx]
    second_conf = float(predictions[second_idx])
    
    # 2. GEOMETRIC VERIFICATION (Hybrid Logic 2.0)
    has_geometric_circle, circle_count = detect_circles(img_bytes)
    has_geometric_lines, line_count = detect_lines(img_bytes)
    
    final_label = best_label
    final_conf = best_conf
    logic_applied = "Standard AI"
    
    # --- HYBRID INTELLIGENCE 2.0 ---
    
    # RULE 1: Boost CRACK confidence if long linear features exist
    if has_geometric_lines:
        if best_label == 'Pothole' and 'Crack' in [best_label, second_label]:
            # AI misidentified linear crack as pothole
            final_label = 'Crack'
            final_conf = max(best_conf, 0.82)
            logic_applied = "Linear Refinement (Crack Detected via Lines)"
        elif best_label == 'Crack':
            final_conf = min(best_conf + 0.15, 0.99)
            logic_applied = "Structural Confirmation (Crack Verified)"

    # RULE 2: Correct Pothole/Crack to MANHOLE if rock-solid circles exist
    if has_geometric_circle and best_conf < 0.90:
        if best_label in ['Crack', 'Pothole']:
            final_label = 'Manhole'
            final_conf = max(best_conf, 0.85) 
            logic_applied = "Geometric Override (Circular Manhole Pattern)"
    
    severity = calculate_severity(final_label, final_conf)
    
    # Log total time to terminal
    total_time = (time.time() - start_time) * 1000
    print(f"Total Inference Time: {total_time:.2f}ms")
    
    return jsonify({
        'damage': final_label,
        'confidence': f"{final_conf * 100:.2f}%",
        'severity': severity,
        'debug_info': {
            'method': logic_applied,
            'circles': circle_count,
            'lines': line_count,
            'ai_top_1': f"{best_label} ({best_conf*100:.2f}%)",
            'ai_top_2': f"{second_label} ({second_conf*100:.2f}%)"
        }
    })

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
