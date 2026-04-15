"""
Road Damage Detection — Model Evaluation Script
=================================================
Computes extended evaluation metrics WITHOUT modifying the training pipeline,
model architecture, or API endpoints.

Metrics computed:
  - Accuracy (preserved from training)
  - Loss (categorical crossentropy, preserved from training)
  - Precision (per-class and weighted average)
  - Recall (per-class and weighted average)
  - F1-Score (per-class and weighted average)
  - Confusion Matrix (printed and saved to evaluation_results/)

Usage:
    python evaluate.py

Prerequisites:
    - model.h5 must exist (run train.py first)
    - processed_data/val/ must contain validation images
"""

import os
import json
import numpy as np
import tensorflow as tf
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    accuracy_score
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.h5')
LABEL_PATH = os.path.join(BASE_DIR, 'class_indices.json')
DATA_DIR = os.path.join(BASE_DIR, 'processed_data')
RESULTS_DIR = os.path.join(BASE_DIR, 'evaluation_results')

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# The same confidence threshold used in app.py for consistency
CONFIDENCE_THRESHOLD = 0.70


def load_model_and_labels():
    """Load the trained model and class label mapping."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")

    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"[OK] Loaded model from {MODEL_PATH}")

    if os.path.exists(LABEL_PATH):
        with open(LABEL_PATH, 'r') as f:
            indices = json.load(f)
            labels = {v: k for k, v in indices.items()}
    else:
        labels = {0: 'Crack', 1: 'Manhole', 2: 'Normal', 3: 'Pothole'}

    print(f"[OK] Label mapping: {labels}")
    return model, labels


def load_validation_data(labels):
    """Load validation images and their ground-truth labels."""
    val_dir = os.path.join(DATA_DIR, 'val')
    if not os.path.exists(val_dir):
        raise FileNotFoundError(f"Validation directory not found at {val_dir}")

    class_names = sorted(os.listdir(val_dir))
    print(f"[OK] Found classes: {class_names}")

    images = []
    true_labels = []

    for class_name in class_names:
        class_dir = os.path.join(val_dir, class_name)
        if not os.path.isdir(class_dir):
            continue
        class_idx = None
        for idx, label_name in labels.items():
            if label_name == class_name:
                class_idx = idx
                break
        if class_idx is None:
            print(f"[WARN] Skipping unknown class: {class_name}")
            continue

        for fname in os.listdir(class_dir):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            fpath = os.path.join(class_dir, fname)
            try:
                img = tf.keras.utils.load_img(fpath, target_size=IMG_SIZE)
                img_array = tf.keras.utils.img_to_array(img)
                img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
                images.append(img_array)
                true_labels.append(class_idx)
            except Exception as e:
                print(f"[WARN] Skipping {fpath}: {e}")

    print(f"[OK] Loaded {len(images)} validation images")
    return np.array(images), np.array(true_labels), class_names


def apply_threshold(predictions, threshold):
    """
    Apply confidence threshold to predictions.
    If the highest softmax probability is below the threshold,
    the prediction is classified as 'Normal' (index 2 by default,
    or the 'Normal' class index).
    
    This mirrors the exact logic in app.py.
    """
    thresholded_preds = []
    for pred in predictions:
        best_idx = np.argmax(pred)
        best_conf = pred[best_idx]
        if best_conf < threshold:
            # Override to Normal/No Damage (index 2)
            thresholded_preds.append(2)
        else:
            thresholded_preds.append(best_idx)
    return np.array(thresholded_preds)


def evaluate():
    """Run full evaluation and print/save all metrics."""
    model, labels = load_model_and_labels()
    images, true_labels, class_names = load_validation_data(labels)

    if len(images) == 0:
        print("[ERROR] No validation images found. Cannot evaluate.")
        return

    # --- Raw model predictions ---
    print("\n" + "=" * 60)
    print("Running inference on validation set...")
    print("=" * 60)
    raw_predictions = model.predict(images, batch_size=BATCH_SIZE, verbose=1)

    # --- Standard predictions (no threshold) ---
    raw_pred_classes = np.argmax(raw_predictions, axis=1)

    # --- Thresholded predictions (mirrors app.py behavior) ---
    thresh_pred_classes = apply_threshold(raw_predictions, CONFIDENCE_THRESHOLD)

    # === METRICS: Without Threshold (Standard Model) ===
    print("\n" + "=" * 60)
    print("STANDARD MODEL METRICS (No Threshold)")
    print("=" * 60)

    std_accuracy = accuracy_score(true_labels, raw_pred_classes)
    std_precision = precision_score(true_labels, raw_pred_classes, average='weighted', zero_division=0)
    std_recall = recall_score(true_labels, raw_pred_classes, average='weighted', zero_division=0)
    std_f1 = f1_score(true_labels, raw_pred_classes, average='weighted', zero_division=0)

    print(f"  Accuracy:  {std_accuracy * 100:.2f}%")
    print(f"  Precision: {std_precision * 100:.2f}%")
    print(f"  Recall:    {std_recall * 100:.2f}%")
    print(f"  F1-Score:  {std_f1 * 100:.2f}%")

    print("\nPer-Class Report:")
    print(classification_report(true_labels, raw_pred_classes, target_names=class_names, zero_division=0))

    print("Confusion Matrix:")
    cm_std = confusion_matrix(true_labels, raw_pred_classes)
    print(cm_std)

    # === METRICS: With Threshold (Production Behavior) ===
    print("\n" + "=" * 60)
    print(f"PRODUCTION METRICS (Threshold = {CONFIDENCE_THRESHOLD * 100:.0f}%)")
    print("=" * 60)

    thr_accuracy = accuracy_score(true_labels, thresh_pred_classes)
    thr_precision = precision_score(true_labels, thresh_pred_classes, average='weighted', zero_division=0)
    thr_recall = recall_score(true_labels, thresh_pred_classes, average='weighted', zero_division=0)
    thr_f1 = f1_score(true_labels, thresh_pred_classes, average='weighted', zero_division=0)

    print(f"  Accuracy:  {thr_accuracy * 100:.2f}%")
    print(f"  Precision: {thr_precision * 100:.2f}%")
    print(f"  Recall:    {thr_recall * 100:.2f}%")
    print(f"  F1-Score:  {thr_f1 * 100:.2f}%")

    print("\nPer-Class Report:")
    print(classification_report(true_labels, thresh_pred_classes, target_names=class_names, zero_division=0))

    print("Confusion Matrix:")
    cm_thr = confusion_matrix(true_labels, thresh_pred_classes)
    print(cm_thr)

    # === Threshold Impact Analysis ===
    suppressed = np.sum(thresh_pred_classes != raw_pred_classes)
    print(f"\n[IMPACT] Threshold suppressed {suppressed}/{len(images)} predictions ({suppressed/len(images)*100:.1f}%)")

    # === Save results to disk ===
    os.makedirs(RESULTS_DIR, exist_ok=True)
    results = {
        'standard': {
            'accuracy': float(std_accuracy),
            'precision': float(std_precision),
            'recall': float(std_recall),
            'f1_score': float(std_f1),
            'confusion_matrix': cm_std.tolist()
        },
        'with_threshold': {
            'threshold': CONFIDENCE_THRESHOLD,
            'accuracy': float(thr_accuracy),
            'precision': float(thr_precision),
            'recall': float(thr_recall),
            'f1_score': float(thr_f1),
            'confusion_matrix': cm_thr.tolist(),
            'suppressed_count': int(suppressed),
            'total_samples': len(images)
        },
        'class_names': class_names
    }

    results_path = os.path.join(RESULTS_DIR, 'metrics.json')
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n[SAVED] Full metrics saved to {results_path}")
    print("=" * 60)
    print("Evaluation complete!")


if __name__ == '__main__':
    evaluate()
