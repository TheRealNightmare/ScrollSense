# ScrollSense Processor

Transformer-based sentiment analysis engine. Fine-tunes `xlm-roberta-base` (multilingual, handles
Bengali-English code-mixed text) to classify social media posts as **positive** or **negative**.

---

## Setup

```bash
cd Processor
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Training

### 1. Prepare your data

By default `DATA_CSV` points at `../EnBn_CodeMixed_TwoClass_Sentiment_Balanced_100k.csv` (repo root), with columns:

| Column | Values |
|--------|--------|
| `Code-Mixed-Text` | Raw post text (En-Bn code-mixed) |
| `Sentiment` | `Positive` / `Negative` |

> To use a different file/columns, set `SCROLLSENSE_DATA_CSV` or edit `TEXT_COL` / `LABEL_COL` in `config.py`.

### 2. Run training

```bash
python train.py
```

Trains for 5 epochs, saves the best checkpoint (by macro F1) to `checkpoints/best_model/`. Logs per-epoch metrics to `outputs/training_log.jsonl`.

### 3. Evaluate on test set

```bash
python evaluate.py
```

Prints accuracy, macro F1, and per-class breakdown. Saves full results to `outputs/evaluation_results.json`.

---

## Inference

```python
from predict import predict
from report import generate_report

posts = [
    "This is absolutely amazing!",
    "I hate everything about this.",
    "It was fine I guess.",
]

predictions = predict(posts)
report = generate_report(predictions)
```

`predict()` returns a list of dicts:

```json
{
  "text": "This is absolutely amazing!",
  "label": "positive",
  "label_id": 1,
  "confidence": 0.9712,
  "scores": {
    "negative": 0.0288,
    "positive": 0.9712
  }
}
```

`generate_report()` writes two files:
- `outputs/report.json` — full structured report (for the Backend)
- `outputs/report_summary.txt` — plain-text summary (for the Frontend)

---

## Configuration

All settings live in `config.py`:

| Setting | Default | Description |
|---------|---------|-------------|
| `BASE_MODEL` | `xlm-roberta-base` | HuggingFace model ID (multilingual) |
| `NUM_LABELS` | `2` | positive / negative |
| `NUM_EPOCHS` | `5` | Training epochs |
| `BATCH_SIZE` | `32` | Training batch size (reduce to 16 if OOM) |
| `LEARNING_RATE` | `2e-5` | AdamW learning rate |
| `MAX_SEQ_LEN` | `128` | Max token length per post |
| `DATA_CSV` | `../EnBn_..._100k.csv` | Path to training CSV (override via `SCROLLSENSE_DATA_CSV`) |
| `CHECKPOINT_DIR` | `checkpoints/best_model` | Where the model is saved (override via `SCROLLSENSE_CHECKPOINT_DIR`) |

---

## File Overview

```
Processor/
├── config.py        — all hyperparameters and paths
├── utils.py         — shared helpers (text cleaning, metrics, device detection)
├── dataset.py       — CSV loading, label mapping, train/val/test split, DataLoaders
├── model.py         — RoBERTa model build, save, and load
├── train.py         — training loop
├── evaluate.py      — test-set evaluation
├── predict.py       — inference entrypoint (used by the Backend)
├── report.py        — report generation
├── requirements.txt — Python dependencies
├── data/            — place your CSV here (git-ignored)
├── checkpoints/     — saved model weights (git-ignored)
└── outputs/         — reports and logs (git-ignored)
```
