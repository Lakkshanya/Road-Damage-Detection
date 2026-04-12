import os
import tensorflow as tf
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import numpy as np
import json
from sklearn.utils.class_weight import compute_class_weight

# Configuration
IS_COLAB = os.path.exists('/content')
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) if not IS_COLAB else '/content'
DATA_DIR = os.path.join(BASE_DIR, 'processed_data')

IMG_SIZE = (224, 224) # Reduced for CPU speed (MobileNetV2 default)
BATCH_SIZE = 16       # Increased for better CPU throughput
EPOCHS = 10
NUM_CLASSES = 4

def build_model():
    print("Building Deep MobileNetV2 with Fine-Tuning enabled...")
    base_model = tf.keras.applications.MobileNetV2(
        weights='imagenet', 
        include_top=False, 
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
    )
    
    # Enable fine-tuning by unfreezing the top layers
    # This allows the model to learn specific road texture features
    base_model.trainable = True
    
    # Freeze all layers except the last 20
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    
    # Powerful Head with Regularization to prevent overfitting to specific blobs
    x = tf.keras.layers.GaussianNoise(0.1)(x) # Robustness against background noise
    
    x = Dense(256, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.01))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    
    x = Dense(128, activation='relu', kernel_regularizer=tf.keras.regularizers.l2(0.01))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.2)(x)
    
    predictions = Dense(NUM_CLASSES, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    return model

def load_and_preprocess_image(path, label):
    image = tf.io.read_file(path)
    image = tf.image.decode_jpeg(image, channels=3)
    image = tf.image.resize(image, IMG_SIZE)
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    return image, label

def augment(image, label):
    # Light augmentation for CPU stability
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_brightness(image, max_delta=0.1)
    return image, label

def get_dataset(subset):
    subset_dir = os.path.join(DATA_DIR, subset)
    class_names = sorted(os.listdir(subset_dir))
    
    file_paths = []
    labels = []
    
    for i, class_name in enumerate(class_names):
        class_dir = os.path.join(subset_dir, class_name)
        for fname in os.listdir(class_dir):
            if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                file_paths.append(os.path.join(class_dir, fname))
                labels.append(i)
                
    # Create dataset
    ds = tf.data.Dataset.from_tensor_slices((file_paths, labels))
    ds = ds.shuffle(len(file_paths)) if subset == 'train' else ds
    
    # Map loading and basic preprocessing
    ds = ds.map(load_and_preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    if subset == 'train':
        ds = ds.map(augment, num_parallel_calls=tf.data.AUTOTUNE)
        
    ds = ds.batch(BATCH_SIZE)
    ds = ds.prefetch(buffer_size=tf.data.AUTOTUNE)
    
    # One-hot encode labels
    ds = ds.map(lambda x, y: (x, tf.one_hot(y, depth=NUM_CLASSES)))
    
    return ds, len(file_paths), class_names

def train():
    print(f"Loading datasets from {DATA_DIR}...")
    train_ds, train_count, class_names = get_dataset('train')
    val_ds, val_count, _ = get_dataset('val')
    
    # Save class indices
    class_indices = {name: i for i, name in enumerate(class_names)}
    with open(os.path.join(BASE_DIR, 'class_indices.json'), 'w') as f:
        json.dump(class_indices, f)
    print(f"Class Indices: {class_indices}")
    
    # Calculate Class Weights
    # Extract labels from the list we used for dataset creation
    subset_dir = os.path.join(DATA_DIR, 'train')
    all_train_labels = []
    for i, class_name in enumerate(class_names):
        count = len([f for f in os.listdir(os.path.join(subset_dir, class_name)) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        all_train_labels.extend([i] * count)
    
    unique_classes = np.unique(all_train_labels)
    weights = compute_class_weight(class_weight='balanced', classes=unique_classes, y=all_train_labels)
    class_weight_dict = dict(zip(unique_classes, weights))
    print(f"Calculated Class Weights: {class_weight_dict}")
    
    model = build_model()
    # Adding Label Smoothing to prevent model from over-committing to skewed data
    model.compile(
        optimizer=Adam(learning_rate=0.0001), 
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1), 
        metrics=['accuracy']
    )
    
    # Callbacks
    model_save_path = os.path.join(BASE_DIR, 'model.h5')
    checkpoint = ModelCheckpoint(model_save_path, monitor='val_accuracy', save_best_only=True, mode='max')
    early_stop = EarlyStopping(monitor='val_loss', patience=7, restore_best_weights=True)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=0.00001)
    
    print(f"Starting optimized training (CPU Mode)...")
    history = model.fit(
        train_ds,
        epochs=EPOCHS,
        validation_data=val_ds,
        class_weight=class_weight_dict,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )
    
    print(f"Training complete! Model saved to {model_save_path}")
    return history

if __name__ == "__main__":
    train()
