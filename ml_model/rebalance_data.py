import os
import shutil
from PIL import Image, ImageEnhance
import random

def oversample_normal():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    normal_dir = os.path.join(base_dir, 'processed_data/train/Normal')
    
    if not os.path.exists(normal_dir):
        print(f"Directory not found: {normal_dir}")
        return

    files = [f for f in os.listdir(normal_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]
    print(f"Current Normal images: {len(files)}")
    print("Oversampling 'Normal' class by 10x...")

    for i, filename in enumerate(files):
        img_path = os.path.join(normal_dir, filename)
        try:
            with Image.open(img_array_path := img_path) as img:
                for j in range(9): # Create 9 augmented copies (+1 original = 10x)
                    # Randomly adjust brightness slightly to create "new" data
                    enhancer = ImageEnhance.Brightness(img)
                    temp_img = enhancer.enhance(random.uniform(0.8, 1.2))
                    
                    # Save with new name
                    new_name = f"aug_{j}_{filename}"
                    temp_img.save(os.path.join(normal_dir, new_name))
            
            if i % 100 == 0:
                print(f"Processed {i}/{len(files)} images...")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    new_count = len(os.listdir(normal_dir))
    print(f"Finished! New Normal image count: {new_count}")

if __name__ == "__main__":
    oversample_normal()
