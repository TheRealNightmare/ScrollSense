import json
import os

import torch
from torch import nn
from torch.optim import AdamW
from tqdm import tqdm
from transformers import get_linear_schedule_with_warmup

from config import (
    GRADIENT_CLIP, LEARNING_RATE, LOG_FILE, NUM_LABELS,
    NUM_EPOCHS, OUTPUTS_DIR, WARMUP_RATIO, WEIGHT_DECAY,
)
from dataset import get_dataloaders
from model import build_model, save_checkpoint
from utils import compute_metrics, get_device, set_seed


def compute_class_weights(labels, device):
    """Balanced inverse-frequency weights: n_samples / (n_classes * class_count).

    The training data is imbalanced (~4:1 positive:negative), so an unweighted loss
    biases the model toward the majority class. These weights up-weight the rare class.
    """
    counts = torch.bincount(torch.tensor(labels), minlength=NUM_LABELS).float()
    counts = counts.clamp(min=1.0)  # guard against a class missing from the split
    weights = counts.sum() / (NUM_LABELS * counts)
    return weights.to(device)


def train_epoch(model, loader, optimizer, scheduler, scaler, criterion, device):
    model.train()
    total_loss = 0.0
    for batch in tqdm(loader, desc="  Train", leave=False):
        batch = {k: v.to(device) for k, v in batch.items()}
        labels = batch.pop("labels")
        optimizer.zero_grad()
        with torch.amp.autocast(device_type=device.type, enabled=scaler is not None):
            logits = model(**batch).logits
            loss = criterion(logits, labels)
        if scaler:
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), GRADIENT_CLIP)
            scaler.step(optimizer)
            scaler.update()
        else:
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), GRADIENT_CLIP)
            optimizer.step()
        scheduler.step()
        total_loss += loss.item()
    return total_loss / len(loader)


@torch.no_grad()
def run_eval(model, loader, criterion, device):
    model.eval()
    all_preds, all_labels, total_loss = [], [], 0.0
    for batch in tqdm(loader, desc="  Eval ", leave=False):
        batch = {k: v.to(device) for k, v in batch.items()}
        labels = batch.pop("labels")
        logits = model(**batch).logits
        total_loss += criterion(logits, labels).item()
        all_preds.extend(logits.argmax(dim=-1).cpu().tolist())
        all_labels.extend(labels.cpu().tolist())
    metrics = compute_metrics(all_preds, all_labels)
    metrics["loss"] = total_loss / len(loader)
    return metrics


def main():
    set_seed()
    os.makedirs(OUTPUTS_DIR, exist_ok=True)
    device = get_device()

    model, tokenizer = build_model()
    model.to(device)

    train_loader, val_loader, _ = get_dataloaders(tokenizer)

    class_weights = compute_class_weights(train_loader.dataset.labels, device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    print(f"Class weights (balanced): {class_weights.cpu().tolist()}")

    total_steps = len(train_loader) * NUM_EPOCHS
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(total_steps * WARMUP_RATIO),
        num_training_steps=total_steps,
    )
    scaler = torch.amp.GradScaler("cuda") if device.type == "cuda" else None

    best_f1, log = 0.0, []

    for epoch in range(1, NUM_EPOCHS + 1):
        print(f"\nEpoch {epoch}/{NUM_EPOCHS}")
        train_loss = train_epoch(model, train_loader, optimizer, scheduler, scaler, criterion, device)
        val = run_eval(model, val_loader, criterion, device)

        record = {
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "val_loss": round(val["loss"], 4),
            "val_accuracy": round(val["accuracy"], 4),
            "val_macro_f1": round(val["macro_f1"], 4),
        }
        log.append(record)
        print(f"  {record}")

        if val["macro_f1"] > best_f1:
            best_f1 = val["macro_f1"]
            save_checkpoint(model, tokenizer)
            print(f"  ✓ New best macro F1: {best_f1:.4f}")

    with open(LOG_FILE, "w") as f:
        for r in log:
            f.write(json.dumps(r) + "\n")

    print(f"\nDone. Best val macro F1: {best_f1:.4f} — logs → {LOG_FILE}")


if __name__ == "__main__":
    main()
