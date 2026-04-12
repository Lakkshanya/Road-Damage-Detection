import os
import shutil
import random
from tqdm import tqdm

# Configuration
SOURCE_DATA = 'ml_model/datasets/data'
SOURCE_RDD = 'ml_model/datasets/RDD_Combined'
DEST_DIR = 'ml_model/processed_data'
TRAIN_RATIO = 0.8

# Classes
CLASSES = ['Pothole', 'Crack', 'Manhole', 'Normal']

# Create folders
for split in ['train', 'val']:
    for cls in CLASSES:
        os.makedirs(os.path.join(DEST_DIR, split, cls), exist_ok=True)

def process_dataset(img_dir, lbl_dir, dataset_type):
    print(f"Processing {dataset_type}...")
    images = [f for f in os.listdir(img_dir) if f.endswith('.jpg')]
    processed_count = 0
    
    for img_name in tqdm(images):
        lbl_name = os.path.splitext(img_name)[0] + '.txt'
        lbl_path = os.path.join(lbl_dir, lbl_name)
        
        target_cls = 'Normal'
        if os.path.exists(lbl_path):
            with open(lbl_path, 'r') as f:
                lines = f.readlines()
                if lines:
                    # Pick the first class for simplicity in classification
                    # In a more advanced version, we'd pick the "dominant" one
                    parts = lines[0].strip().split()
                    if parts:
                        cls_id = int(parts[0])
                        if dataset_type == 'data':
                            if cls_id == 0: target_cls = 'Pothole'
                            elif cls_id == 1: target_cls = 'Crack'
                            elif cls_id == 2: target_cls = 'Manhole'
                        elif dataset_type == 'RDD':
                            if cls_id == 3: target_cls = 'Pothole'
                            elif cls_id in [0, 1, 2]: target_cls = 'Crack'
        
        split = 'train' if random.random() < TRAIN_RATIO else 'val'
        src_path = os.path.join(img_dir, img_name)
        dst_path = os.path.join(DEST_DIR, split, target_cls, img_name)
        
        shutil.copy(src_path, dst_path)
        processed_count += 1
    
    print(f"Processed {processed_count} images from {dataset_type}")

# Run processing
process_dataset(os.path.join(SOURCE_DATA, 'images'), os.path.join(SOURCE_DATA, 'labels-YOLO'), 'data')
process_dataset(os.path.join(SOURCE_RDD, 'images', 'train'), os.path.join(SOURCE_RDD, 'labels', 'train'), 'RDD')

print("Preprocessing complete!")
