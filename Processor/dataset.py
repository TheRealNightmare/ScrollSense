import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset
from transformers import DataCollatorWithPadding

from config import (
    BATCH_SIZE, DATA_CSV, EVAL_BATCH_SIZE, LABEL_COL,
    LABEL_MAP, MAX_SEQ_LEN, SEED, TEXT_COL,
)
from utils import clean_tweet


class SentimentDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item


def load_csv(path: str = DATA_CSV) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df[[TEXT_COL, LABEL_COL]].dropna()
    df[TEXT_COL] = df[TEXT_COL].astype(str).apply(clean_tweet)

    def map_label(x):
        # try the raw value, then its string form, then int form
        for key in (x, str(x).strip().lower(), int(x) if str(x).lstrip("-").isdigit() else None):
            if key in LABEL_MAP:
                return LABEL_MAP[key]
        return None

    df["mapped_label"] = df[LABEL_COL].apply(map_label)
    unmapped = df["mapped_label"].isna().sum()
    if unmapped:
        print(f"Warning: {unmapped} rows had unrecognised labels and were dropped.")
    df = df.dropna(subset=["mapped_label"])
    df["mapped_label"] = df["mapped_label"].astype(int)
    return df.reset_index(drop=True)


def split_dataset(df: pd.DataFrame):
    train_df, temp_df = train_test_split(
        df, test_size=0.2, stratify=df["mapped_label"], random_state=SEED
    )
    val_df, test_df = train_test_split(
        temp_df, test_size=0.5, stratify=temp_df["mapped_label"], random_state=SEED
    )
    return (
        train_df.reset_index(drop=True),
        val_df.reset_index(drop=True),
        test_df.reset_index(drop=True),
    )


def get_dataloaders(tokenizer, csv_path: str = DATA_CSV):
    df = load_csv(csv_path)
    train_df, val_df, test_df = split_dataset(df)

    def encode(subset: pd.DataFrame):
        return tokenizer(
            subset[TEXT_COL].tolist(),
            truncation=True,
            max_length=MAX_SEQ_LEN,
            padding=False,
        )

    train_ds = SentimentDataset(encode(train_df), train_df["mapped_label"].tolist())
    val_ds = SentimentDataset(encode(val_df), val_df["mapped_label"].tolist())
    test_ds = SentimentDataset(encode(test_df), test_df["mapped_label"].tolist())

    collator = DataCollatorWithPadding(tokenizer=tokenizer)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collator)
    val_loader = DataLoader(val_ds, batch_size=EVAL_BATCH_SIZE, shuffle=False, collate_fn=collator)
    test_loader = DataLoader(test_ds, batch_size=EVAL_BATCH_SIZE, shuffle=False, collate_fn=collator)

    print(f"Dataset splits — Train: {len(train_ds)} | Val: {len(val_ds)} | Test: {len(test_ds)}")
    return train_loader, val_loader, test_loader
