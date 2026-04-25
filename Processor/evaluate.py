import json
import os

import torch
from sklearn.metrics import classification_report, confusion_matrix
from tqdm import tqdm

from config import CHECKPOINT_DIR, ID2LABEL, OUTPUTS_DIR
from dataset import get_dataloaders
from model import load_checkpoint
from utils import get_device


def main():
    os.makedirs(OUTPUTS_DIR, exist_ok=True)
    device = get_device()

    model, tokenizer = load_checkpoint(CHECKPOINT_DIR)
    model.to(device)

    _, _, test_loader = get_dataloaders(tokenizer)

    all_preds, all_labels = [], []
    with torch.no_grad():
        for batch in tqdm(test_loader, desc="Test set"):
            batch = {k: v.to(device) for k, v in batch.items()}
            preds = model(**batch).logits.argmax(dim=-1).cpu().tolist()
            all_preds.extend(preds)
            all_labels.extend(batch["labels"].cpu().tolist())

    label_names = [ID2LABEL[i] for i in sorted(ID2LABEL)]
    report_dict = classification_report(
        all_labels, all_preds, target_names=label_names, output_dict=True
    )
    cm = confusion_matrix(all_labels, all_preds).tolist()

    print(classification_report(all_labels, all_preds, target_names=label_names))

    out_path = os.path.join(OUTPUTS_DIR, "evaluation_results.json")
    with open(out_path, "w") as f:
        json.dump({"classification_report": report_dict, "confusion_matrix": cm}, f, indent=2)
    print(f"Results saved → {out_path}")


if __name__ == "__main__":
    main()
