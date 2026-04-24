BASE_MODEL = "roberta-base"
NUM_LABELS = 3
ID2LABEL = {0: "negative", 1: "neutral", 2: "positive"}
LABEL2ID = {"negative": 0, "neutral": 1, "positive": 2}

# Maps raw CSV label values → 0-indexed class for PyTorch
LABEL_MAP = {
    "positive": 2, 1: 2, "1": 2,
    "neutral": 1,  0: 1, "0": 1,
    "negative": 0, -1: 0, "-1": 0,
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
DATA_CSV = "data/your_data.csv"
TEXT_COL = "text"
LABEL_COL = "label"

# Paths
CHECKPOINT_DIR = "checkpoints/best_model"
OUTPUTS_DIR = "outputs"
LOG_FILE = "outputs/training_log.jsonl"
