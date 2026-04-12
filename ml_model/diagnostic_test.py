import os
import numpy as np
import tensorflow as tf
from PIL import Image

# Setup Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.h5')
# Order should be: Crack, Manhole, Normal, Pothole
LABELS = ['Crack', 'Manhole', 'Normal', 'Pothole']

def run_diagnostic():
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found at {MODEL_PATH}")
        return

    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    # Test on known training classes to check for a "Label Flip"
    for label in LABELS:
        test_dir = os.path.join(BASE_DIR, 'processed_data', 'train', label)
        if not os.path.exists(test_dir):
            print(f"Skipping {label} (folder not found)")
            continue
            
        print(f"\nTesting {label} folder...")
        files = [f for f in os.listdir(test_dir) if f.endswith('.jpg')][:5]
        
        correct = 0
        for f in files:
            img_path = os.path.join(test_dir, f)
            img = Image.open(img_path).convert('RGB').resize((224, 224))
            
            # Match app.py preprocessing for MobileNetV2
            arr = np.array(img).astype('float32')
            arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
            arr = np.expand_dims(arr, axis=0)
            
            preds = model.predict(arr, verbose=0)
            idx = np.argmax(preds[0])
            pred_label = LABELS[idx]
            conf = preds[0][idx] * 100
            
            print(f"   Image {f}: Predicted {pred_label} ({conf:.2f}%)")
            if pred_label == label:
                correct += 1
        
        print(f"   Accuracy for {label}: {correct}/5")

if __name__ == "__main__":
    run_diagnostic()
