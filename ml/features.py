import os
import math
from collections import Counter

def calculate_entropy(data):
    if not data:
        return 0
    
    entropy = 0
    counter = Counter(data)
    length = len(data)
    
    for count in counter.values():
        probability = count / length
        entropy -= probability * math.log2(probability)
    
    return entropy

def extract_features(file_path):
    file_size = os.path.getsize(file_path)
    
    with open(file_path, 'rb') as f:
        data = f.read()
    
    entropy = calculate_entropy(data)
    
    printable_count = sum(1 for byte in data if 32 <= byte <= 126)
    printable_ratio = printable_count / len(data) if len(data) > 0 else 0
    
    null_count = data.count(0)
    null_ratio = null_count / len(data) if len(data) > 0 else 0
    
    return [file_size, entropy, printable_ratio, null_ratio]
