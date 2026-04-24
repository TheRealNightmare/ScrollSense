import os

from transformers import AutoModelForSequenceClassification, AutoTokenizer

from config import BASE_MODEL, CHECKPOINT_DIR, ID2LABEL, LABEL2ID, NUM_LABELS


def build_model():
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL,
        num_labels=NUM_LABELS,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )
    return model, tokenizer


def save_checkpoint(model, tokenizer, path: str = CHECKPOINT_DIR):
    os.makedirs(path, exist_ok=True)
    model.save_pretrained(path)
    tokenizer.save_pretrained(path)
    print(f"Checkpoint saved → {path}")


def load_checkpoint(path: str = CHECKPOINT_DIR):
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSequenceClassification.from_pretrained(path)
    model.eval()
    return model, tokenizer
