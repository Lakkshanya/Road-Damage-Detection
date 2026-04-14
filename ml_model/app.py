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
CORS(app)

# Path to the trained model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.h5')
LABEL_PATH = os.path.join(BASE_DIR, 'class_indices.json')
model = None
LABELS = {}

def load_ml_resources():
    global model, LABELS
    if os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"Successfully loaded model from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
    
    if os.path.exists(LABEL_PATH):
        try:
            with open(LABEL_PATH, 'r') as f:
                indices = json.load(f)
                LABELS = {v: k for k, v in indices.items()}
        except Exception as e:
            print(f"Error loading labels: {e}")
            LABELS = {0: 'Crack', 1: 'Manhole', 2: 'Normal', 3: 'Pothole'}
    else:
        LABELS = {0: 'Crack', 1: 'Manhole', 2: 'Normal', 3: 'Pothole'}

load_ml_resources()

def preprocess_image(image):
    image = image.convert('RGB')
    image = image.resize((224, 224))
    img_array = np.array(image).astype('float32')
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def calculate_severity(label, confidence):
    if label == 'Normal' or label == 'No Damage': return 'None'
    if confidence >= 0.75: return 'High'
    if confidence >= 0.40: return 'Medium'
    return 'Low'

def detect_circles(image_bytes):
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.medianBlur(gray, 5)
        circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1.2, minDist=100, param1=50, param2=70, minRadius=50, maxRadius=400)
        valid_circles = 0
        if circles is not None:
            for circle in circles[0]:
                if circle[1] > (height * 0.4) and (width * 0.25 < circle[0] < width * 0.75):
                    valid_circles += 1
        return (0 < valid_circles <= 3), valid_circles
    except: return False, 0

def detect_lines(image_bytes):
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, 100, minLineLength=100, maxLineGap=10)
        valid_lines = 0
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                if (y1 > height * 0.4 and y2 > height * 0.4) and (width * 0.25 < x1 < width * 0.75):
                    if np.sqrt((x2-x1)**2 + (y2-y1)**2) > 120: valid_lines += 1
        return (0 < valid_lines <= 10), valid_lines
    except: return False, 0

def get_detections(img_array):
    # Use block_13_expand_relu for high-resolution semantic context
    last_conv_layer_name = 'block_13_expand_relu' 
    
    try:
        grad_model = tf.keras.models.Model([model.inputs], [model.get_layer(last_conv_layer_name).output, model.output])
    except:
        last_conv_layer_name = 'Conv_1'
        grad_model = tf.keras.models.Model([model.inputs], [model.get_layer(last_conv_layer_name).output, model.output])

    with tf.GradientTape() as tape:
        conv_output, preds = grad_model(img_array)
        top_idx = np.argmax(preds[0])
        class_channel = preds[:, top_idx]

    grads = tape.gradient(class_channel, conv_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_output = conv_output[0]
    heatmap = conv_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-10)
    heatmap = heatmap.numpy()

    # --- ADVANCED BLOB FUSION (PHYSICS-BASED FILTERING) ---
    raw_img = ((img_array[0] + 1) * 127.5).astype(np.uint8)
    gray = cv2.cvtColor(raw_img, cv2.COLOR_RGB2GRAY)
    
    darkness_map = (255 - gray).astype(float) / 255.0
    darkness_map = cv2.resize(darkness_map, (heatmap.shape[1], heatmap.shape[0]))
    
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    texture_map = np.abs(laplacian)
    texture_map = cv2.GaussianBlur(texture_map, (15, 15), 0)
    texture_map = cv2.resize(texture_map, (heatmap.shape[1], heatmap.shape[0]))
    texture_weight = 1.0 - (texture_map / (np.max(texture_map) + 1e-10))
    
    h, w = heatmap.shape
    road_mask = np.zeros((h, w))
    for i in range(h):
        for j in range(w):
            road_mask[i, j] = np.exp(-(i/h - 0.75)**2 / 0.1) * np.exp(-(j/w - 0.5)**2 / 0.25)

    heatmap = heatmap * (0.2 + 0.8 * darkness_map) * (0.5 + 0.5 * texture_weight) * (0.2 + 0.8 * road_mask)
    heatmap = (heatmap - np.min(heatmap)) / (np.max(heatmap) - np.min(heatmap) + 1e-10)

    heatmap = cv2.resize(heatmap, (224, 224))
    heatmap = cv2.GaussianBlur(heatmap, (15, 15), 0)
    heatmap = (heatmap * 255).astype("uint8")
    
    _, thresh = cv2.threshold(heatmap, 145, 255, cv2.THRESH_BINARY)
    kernel = np.ones((7, 7), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    thresh = cv2.dilate(thresh, kernel, iterations=2)
    
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    for cnt in contours:
        x, y, w, h_box = cv2.boundingRect(cnt)
        if w < 25 or h_box < 25: continue
        if y < 224 * 0.35: continue
        detections.append({'x': (x/224)*100, 'y': (y/224)*100, 'w': (w/224)*100, 'h': (h_box/224)*100})
    
    detections.sort(key=lambda d: ((d['x']-50)**2 + (d['y']-75)**2))
    return detections[:2]

@app.route('/predict', methods=['POST'])
def predict():
    start_time = time.time()
    if model is None: return jsonify({'error': 'Model not loaded'}), 500
    if 'image' not in request.files: return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    img_bytes = file.read()
    image = Image.open(io.BytesIO(img_bytes))
    processed_img = preprocess_image(image)
    predictions = model.predict(processed_img, verbose=0)[0]
    
    best_idx = np.argmax(predictions)
    best_label, best_conf = LABELS[best_idx], float(predictions[best_idx])
    
    has_circle, _ = detect_circles(img_bytes)
    has_lines, _ = detect_lines(img_bytes)
    
    final_label, final_conf = best_label, best_conf
    if has_lines and best_label == 'Pothole': final_label = 'Crack'
    if has_circle and best_conf < 0.90: final_label = 'Manhole'
    
    display_label =  'No Damage' if final_label == 'Normal' else final_label
    severity = calculate_severity(display_label, final_conf)
    
    detections = []
    if display_label != 'No Damage':
        detections = get_detections(processed_img)

    # TERMINAL TELEMETRY (Backend Performance Metrics)
    total_ms = (time.time() - start_time) * 1000
    print("\n" + "="*50)
    print("🚦 ROAD DAMAGE ANALYSIS TELEMETRY")
    print("="*50)
    print(f"📦 Overall Decision: {display_label}")
    print(f"📊 Final Confidence: {final_conf*100:.2f}%")
    print(f"⚠️ Severity Level:   {severity}")
    print(f"⏱️ Total Latency:    {total_ms:.2f}ms")
    print("-"*50)
    print("🧠 Individual AI Class Scores:")
    for idx, conf in enumerate(predictions):
        label = LABELS[idx]
        is_winner = "⭐️" if label == final_label else "  "
        print(f"  {is_winner} {label.ljust(10)}: {conf*100:6.2f}%")
    print("-"*50)
    print(f"⚙️ Geometric Checks: Circles={has_circle}, Lines={has_lines}")
    print("="*50 + "\n")

    return jsonify({
        'damage': display_label,
        'confidence': f"{final_conf * 100:.2f}%",
        'severity': severity,
        'detections': detections
    })

@app.route('/status', methods=['GET'])
def status():
    return jsonify({'status': 'online', 'model_loaded': model is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
