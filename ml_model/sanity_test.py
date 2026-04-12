import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image

# 1. SETUP
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.h5')
JSON_PATH = os.path.join(BASE_DIR, 'class_indices.json')

def run_test():
    if not os.path.exists(MODEL_PATH):
        print("Model file not found!")
        return

    # 2. LOAD RESOURCES
    print("Loading Model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    with open(JSON_PATH, 'r') as f:
        indices = json.load(f)
        LABELS = {v: k for k, v in indices.items()}
    print(f"Loaded Labels: {LABELS}")

    # 3. TEST ON KNOWN FOLDERS
    for idx, name in LABELS.items():
        folder = os.path.join(BASE_DIR, 'processed_data/train', name)
        if not os.path.exists(folder):
            continue
            
        print(f"\n--- Testing {name} folder ---")
        files = [f for f in os.listdir(folder) if f.endswith('.jpg')][:3]
        
        for f in files:
            img = Image.open(os.path.join(folder, f)).convert('RGB').resize((300, 300))
            arr = np.array(img)
            # Use EfficientNet Preprocessing
            arr = tf.keras.applications.efficientnet.preprocess_input(arr)
            arr = np.expand_dims(arr, axis=0)
            
            preds = model.predict(arr, verbose=0)[0]
            top_idx = np.argmax(preds)
            print(f"Result for {f}: {LABELS[top_idx]} ({preds[top_idx]*100:.2f}%)")

if __name__ == "__main__":
    run_test()
