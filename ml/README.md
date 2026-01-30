# CEDTP Malware Detection Module

## Overview
Static malware detection using Random Forest classifier.

## Features Extracted
- File size
- Byte entropy
- Printable character ratio
- Null byte ratio

## Setup
```bash
pip install -r requirements.txt
```

## Usage
```bash
python scan.py <file_path>
```

Output:
- `CLEAN` - File is safe
- `MALICIOUS` - File contains malware

## Model
Place trained model at: `model/rf_model.pkl`

If no model exists, scanner defaults to CLEAN (fail-safe mode).

## Training
Train your own model using labeled malware datasets and save as `rf_model.pkl`.
