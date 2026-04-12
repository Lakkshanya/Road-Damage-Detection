import os
import shutil

# Target directory
MANHOLE_DIR = 'ml_model/processed_data/train/Manhole'
OVERSAMPLE_FACTOR = 5 # Repeat samples 5x

def oversample():
    if not os.path.exists(MANHOLE_DIR):
        print(f"Directory {MANHOLE_DIR} not found.")
        return
    
    files = [f for f in os.listdir(MANHOLE_DIR) if f.endswith('.jpg') and not f.startswith('copy_')]
    print(f"Original manhole count: {len(files)}")
    
    for filename in files:
        src_path = os.path.join(MANHOLE_DIR, filename)
        name, ext = os.path.splitext(filename)
        
        for i in range(1, OVERSAMPLE_FACTOR):
            dst_name = f"copy_{i}_{filename}"
            dst_path = os.path.join(MANHOLE_DIR, dst_name)
            shutil.copy(src_path, dst_path)
            
    new_count = len([f for f in os.listdir(MANHOLE_DIR) if f.endswith('.jpg')])
    print(f"Oversampled manhole count: {new_count}")

if __name__ == "__main__":
    oversample()
