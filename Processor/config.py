import os

BASE_MODEL = "xlm-roberta-base"
NUM_LABELS = 2
ID2LABEL = {0: "negative", 1: "positive"}
LABEL2ID = {"negative": 0, "positive": 1}

# Maps raw CSV label values → 0-indexed class for PyTorch
LABEL_MAP = {
    "positive": 1, 1: 1, "1": 1,
    "negative": 0, 0: 0, "0": 0, -1: 0, "-1": 0,
}

# Training hyperparameters
BATCH_SIZE = 32
EVAL_BATCH_SIZE = 64
NUM_EPOCHS = 5
LEARNING_RATE = 2e-5
WEIGHT_DECAY = 0.01
WARMUP_RATIO = 0.1
MAX_SEQ_LEN = 128
GRADIENT_CLIP = 1.0
SEED = 42

# CSV columns — change LABEL_COL if your column is named differently (e.g. "sentiment")
DATA_CSV = os.getenv("SCROLLSENSE_DATA_CSV", "../EnBn_CodeMixed_TwoClass_Sentiment_Balanced_100k.csv")
TEXT_COL = "Code-Mixed-Text"
LABEL_COL = "Sentiment"

# Paths — CHECKPOINT_DIR is overridable so the Backend can point at it by absolute path
CHECKPOINT_DIR = os.getenv("SCROLLSENSE_CHECKPOINT_DIR", "checkpoints/best_model")
OUTPUTS_DIR = "outputs"
LOG_FILE = "outputs/training_log.jsonl"
