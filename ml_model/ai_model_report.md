# Road Damage Detection - AI Model Technical Report

## 1. Overview
This report details the development and architecture of the road damage detection model, designed for real-time identification of potholes and cracks from vehicle-mounted camera images.

## 2. Dataset Analysis
We utilized a combined dataset of over 15,000 images sourced from:
*   **Localized Dataset**: 2,000+ images with high-resolution pothole, crack, and manhole labels.
*   **RDD Combined**: 13,000+ images from international road damage datasets (D00-D40 classes).

### Class Distribution
| Category | Source Classes | Count |
| :--- | :--- | :--- |
| **Pothole** | data(0), RDD(D40) | ~12,000 |
| **Crack** | data(1), RDD(D00, D10, D20) | ~18,000 |
| **Manhole** | data(2) | ~1,000 |
| **Normal** | RDD (Empty Labels) | ~1,000 |

## 3. Model Architecture
We employed **Transfer Learning** using the **MobileNetV2** architecture, which is optimized for mobile and edge device performance.

*   **Base Model**: MobileNetV2 (Pre-trained on ImageNet).
*   **Custom Head**:
    *   Global Average Pooling 2D
    *   Fully Connected Layer (256 units, ReLU activation)
    *   Dropout (50% for regularization)
    *   Softmax Output Layer (4 classes)

## 4. Training Process
*   **Preprocessing**: Images resized to 224x224 and normalized.
*   **Augmentation**: Horizontal flips, rotation (20°), and zoom were applied to increase model robustness.
*   **Optimizer**: Adam (lr=0.001) with categorical crossentropy loss.
*   **Callbacks**: 
    *   `EarlyStopping` to prevent overfitting.
    *   `ReduceLROnPlateau` to fine-tune the learning rate near convergence.

## 5. Handling Data Imbalance
We identified a significant clinical imbalance in the training set:
*   **Pothole/Crack**: ~11,000 samples.
*   **Manhole**: ~400 samples.

To prevent the model from becoming biased towards Potholes, we implemented **Automated Class Weighting**. During training, the model assigns ~10x more weight to `Manhole` samples, ensuring that errors on these samples are penalized more heavily, leading to better feature learning for small classes.

## 6. Performance Metrics (Simulated/Baseline)
*   **Training Accuracy**: >85% (Projected after full training)
*   **Validation Accuracy**: >80% (Projected after full training)
*   **Inference Speed**: ~200ms per image on CPU.

## 6. Severity Logic
The system implements a heuristic-based severity calculation:
*   **High Severity**: Confidence > 85% (Indicates distinct, large damage patterns).
*   **Medium Severity**: Confidence 65% - 85%.
*   **Low Severity**: Confidence < 65%.

## 7. Integration Guide
The AI model is served via a **Flask API**.
*   **Endpoint**: `POST /predict`
*   **Payload**: Image file (multipart/form-data)
*   **Response**: 
    ```json
    {
      "damage": "Pothole",
      "confidence": "94.20%",
      "severity": "High"
    }
    ```
