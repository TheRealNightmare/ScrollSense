import json
import os
from collections import Counter

from config import ID2LABEL, OUTPUTS_DIR
from utils import format_timestamp


def generate_report(predictions: list[dict], output_dir: str = OUTPUTS_DIR) -> dict:
    """
    Args:
        predictions: Output list from predict().

    Returns report dict and writes:
        outputs/report.json
        outputs/report_summary.txt
    """
    os.makedirs(output_dir, exist_ok=True)
    total = len(predictions)
    if total == 0:
        return {}

    label_counts = Counter(p["label"] for p in predictions)
    conf_by_label: dict[str, list] = {label: [] for label in ID2LABEL.values()}
    for p in predictions:
        conf_by_label[p["label"]].append(p["confidence"])

    distribution = {
        label: {
            "count": label_counts.get(label, 0),
            "percentage": round(label_counts.get(label, 0) / total * 100, 1),
        }
        for label in ID2LABEL.values()
    }

    dominant = max(distribution, key=lambda l: distribution[l]["count"])
    avg_confidence = round(sum(p["confidence"] for p in predictions) / total, 4)
    confidence_by_label = {
        label: round(sum(scores) / len(scores), 4) if scores else 0.0
        for label, scores in conf_by_label.items()
    }

    sorted_by_label = {
        label: sorted(
            [p for p in predictions if p["label"] == label],
            key=lambda x: x["confidence"],
            reverse=True,
        )
        for label in ID2LABEL.values()
    }
    low_confidence = [p for p in predictions if p["confidence"] < 0.6]

    report = {
        "metadata": {
            "total_posts": total,
            "generated_at": format_timestamp(),
            "model": "roberta-base (fine-tuned for sentiment analysis)",
        },
        "distribution": distribution,
        "dominant_sentiment": dominant,
        "average_confidence": avg_confidence,
        "confidence_by_label": confidence_by_label,
        "high_confidence_posts": {
            "most_positive": [
                {"text": p["text"], "confidence": p["confidence"]}
                for p in sorted_by_label["positive"][:3]
            ],
            "most_negative": [
                {"text": p["text"], "confidence": p["confidence"]}
                for p in sorted_by_label["negative"][:3]
            ],
        },
        "low_confidence_posts": [
            {"text": p["text"], "label": p["label"], "confidence": p["confidence"]}
            for p in low_confidence[:10]
        ],
    }

    json_path = os.path.join(output_dir, "report.json")
    with open(json_path, "w") as f:
        json.dump(report, f, indent=2)

    txt_path = os.path.join(output_dir, "report_summary.txt")
    _write_summary(report, txt_path)

    print(f"Report saved → {json_path} and {txt_path}")
    return report


def _write_summary(report: dict, path: str):
    d = report["distribution"]
    lines = [
        "ScrollSense Sentiment Report",
        f"Generated : {report['metadata']['generated_at']}",
        f"Total posts: {report['metadata']['total_posts']}",
        "",
        "Sentiment Breakdown:",
        f"  Positive : {d['positive']['count']} posts ({d['positive']['percentage']}%)",
        f"  Neutral  : {d['neutral']['count']} posts  ({d['neutral']['percentage']}%)",
        f"  Negative : {d['negative']['count']} posts ({d['negative']['percentage']}%)",
        "",
        f"Dominant sentiment   : {report['dominant_sentiment'].upper()}",
        f"Average confidence   : {report['average_confidence'] * 100:.1f}%",
        f"Low-confidence posts : {len(report['low_confidence_posts'])} (ambiguous)",
    ]
    with open(path, "w") as f:
        f.write("\n".join(lines))
