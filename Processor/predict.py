import torch

from config import CHECKPOINT_DIR, ID2LABEL, MAX_SEQ_LEN
from utils import clean_tweet, get_device

_model = None
_tokenizer = None
_device = None


def _load():
    global _model, _tokenizer, _device
    if _model is None:
        from model import load_checkpoint
        _model, _tokenizer = load_checkpoint(CHECKPOINT_DIR)
        _device = get_device()
        _model.to(_device)


def predict(posts: list[str], batch_size: int = 64) -> list[dict]:
    """
    Args:
        posts: Raw social media post strings.
        batch_size: Posts processed per forward pass.

    Returns list of dicts:
        {"text", "label", "label_id", "confidence", "scores"}
    """
    _load()
    cleaned = [clean_tweet(p) for p in posts]
    results = []

    for i in range(0, len(cleaned), batch_size):
        chunk = cleaned[i : i + batch_size]
        original = posts[i : i + batch_size]
        enc = _tokenizer(
            chunk,
            truncation=True,
            max_length=MAX_SEQ_LEN,
            padding=True,
            return_tensors="pt",
        )
        enc = {k: v.to(_device) for k, v in enc.items()}
        with torch.no_grad():
            logits = _model(**enc).logits
        probs = torch.softmax(logits, dim=-1).cpu().tolist()

        for text, prob in zip(original, probs):
            label_id = prob.index(max(prob))
            results.append({
                "text": text,
                "label": ID2LABEL[label_id],
                "label_id": label_id,
                "confidence": round(max(prob), 4),
                "scores": {ID2LABEL[j]: round(p, 4) for j, p in enumerate(prob)},
            })

    return results
