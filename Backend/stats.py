"""Analytics computed from the per-user `posts` table.

Every widget the frontend renders with *real* data is backed by a function here.
The model is binary (1 = positive, 0 = negative), so there is no neutral class:
all percentages are share-of-positive.

Times are stored as ISO-8601 UTC strings; aggregation is done in Python after a
single per-user fetch, which keeps the SQL trivial and the date math correct.
"""
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

import db

# Small English/codemix stopword set for the keyword cloud.
_STOPWORDS = {
    "the", "and", "for", "are", "but", "not", "you", "your", "with", "this",
    "that", "have", "has", "had", "was", "were", "will", "would", "they", "them",
    "from", "what", "when", "which", "who", "into", "out", "about", "just", "like",
    "all", "any", "can", "get", "got", "now", "one", "our", "his", "her", "she",
    "him", "its", "their", "there", "here", "been", "than", "then", "too", "very",
    "more", "most", "some", "such", "only", "also", "did", "does", "doing", "how",
    "why", "off", "over", "under", "again", "once", "because", "while", "after",
    "before", "should", "could", "would", "i'm", "it's", "don't", "we", "us", "am",
    "is", "in", "on", "at", "to", "of", "a", "an", "as", "be", "by", "or", "if",
    "so", "do", "no", "up", "my", "me", "he", "it", "we",
}

_WORD_RE = re.compile(r"[A-Za-zঀ-৿]{3,}")  # latin + Bengali, len>=3


def _parse(ts: str) -> datetime:
    dt = datetime.fromisoformat(ts)
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _fetch(user_id: str, days: int | None = None,
           start: datetime | None = None, end: datetime | None = None) -> list[dict]:
    """Return the user's posts as dicts with a parsed `dt` field, newest first."""
    with db.get_connection() as conn:
        rows = conn.execute(
            "SELECT id, text, label, confidence_score, created_at "
            "FROM posts WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()

    posts = []
    if days is not None:
        start = datetime.now(timezone.utc) - timedelta(days=days)
    for r in rows:
        dt = _parse(r["created_at"])
        if start and dt < start:
            continue
        if end and dt > end:
            continue
        posts.append({
            "id": r["id"],
            "text": r["text"],
            "label": r["label"],
            "confidence": r["confidence_score"],
            "dt": dt,
        })
    return posts


def _fmt_hour(h: int) -> str:
    end = (h + 1) % 24
    def lbl(x):
        ap = "AM" if x < 12 else "PM"
        h12 = x % 12 or 12
        return f"{h12} {ap}"
    return f"{lbl(h)} – {lbl(end)}"


def _pct_positive(posts) -> int:
    if not posts:
        return 0
    pos = sum(1 for p in posts if p["label"] == 1)
    return round(pos / len(posts) * 100)


# ── Dashboard ─────────────────────────────────────────────────────────────────

def overview(user_id: str, days: int = 7) -> dict:
    posts = _fetch(user_id, days=days)
    total = len(posts)
    positivity = _pct_positive(posts)

    # Group by calendar day for streaks / deltas.
    by_day: dict[str, list] = defaultdict(list)
    by_hour: Counter = Counter()
    for p in posts:
        by_day[p["dt"].date().isoformat()].append(p)
        by_hour[p["dt"].hour] += 1

    today = datetime.now(timezone.utc).date()
    today_posts = by_day.get(today.isoformat(), [])
    yest_posts = by_day.get((today - timedelta(days=1)).isoformat(), [])
    delta = _pct_positive(today_posts) - _pct_positive(yest_posts) if yest_posts else 0

    # Bright streak: consecutive days back from today with >= 50% positive.
    streak = 0
    cursor = today
    while True:
        day_posts = by_day.get(cursor.isoformat())
        if not day_posts or _pct_positive(day_posts) < 50:
            break
        streak += 1
        cursor -= timedelta(days=1)

    most_active_hour = by_hour.most_common(1)[0][0] if by_hour else None
    avg_conf = (
        round(sum(p["confidence"] or 0 for p in posts) / total, 3) if total else 0
    )

    return {
        "positivity_pct": positivity,
        "posts_analyzed": total,
        "negative_pct": 100 - positivity if total else 0,
        "most_active_hour": _fmt_hour(most_active_hour) if most_active_hour is not None else "—",
        "bright_streak_days": streak,
        "delta_vs_yesterday": delta,
        "avg_confidence": avg_conf,
        "today_positivity_pct": _pct_positive(today_posts),
    }


def timeline(user_id: str, days: int = 7) -> list[dict]:
    """One entry per calendar day in the window (zero-filled)."""
    posts = _fetch(user_id, days=days)
    by_day: dict[str, list] = defaultdict(list)
    for p in posts:
        by_day[p["dt"].date().isoformat()].append(p)

    out = []
    today = datetime.now(timezone.utc).date()
    for i in range(days - 1, -1, -1):
        d = (today - timedelta(days=i))
        key = d.isoformat()
        day_posts = by_day.get(key, [])
        pos = sum(1 for p in day_posts if p["label"] == 1)
        out.append({
            "date": key,
            "positive": pos,
            "negative": len(day_posts) - pos,
            "total": len(day_posts),
            "positivity_pct": _pct_positive(day_posts),
        })
    return out


def keywords(user_id: str, days: int = 7, limit: int = 16) -> list[dict]:
    posts = _fetch(user_id, days=days)
    freq: Counter = Counter()
    sentiment: dict[str, list] = defaultdict(list)
    for p in posts:
        seen = set()
        for w in _WORD_RE.findall(p["text"].lower()):
            if w in _STOPWORDS or w in seen:
                continue
            seen.add(w)
            freq[w] += 1
            sentiment[w].append(p["label"])

    out = []
    for word, count in freq.most_common(limit):
        labels = sentiment[word]
        share_pos = sum(labels) / len(labels)
        s = "pos" if share_pos >= 0.5 else "neg"
        out.append({"word": word, "count": count, "sentiment": s})
    return out


def heatmap(user_id: str, days: int = 30) -> list[list[int]]:
    """7 (Mon→Sun) x 24 grid of negativity intensity, levels 0–4."""
    posts = _fetch(user_id, days=days)
    grid = [[0] * 24 for _ in range(7)]
    for p in posts:
        if p["label"] == 0:
            grid[p["dt"].weekday()][p["dt"].hour] += 1
    peak = max((max(row) for row in grid), default=0)
    if peak == 0:
        return grid
    # Scale raw counts → 0..4 buckets.
    return [[min(4, round(cell / peak * 4)) for cell in row] for row in grid]


def recent_posts(user_id: str, limit: int = 10) -> list[dict]:
    posts = _fetch(user_id)[:limit]
    return [{
        "id": p["id"],
        "text": p["text"],
        "label": p["label"],
        "sentiment": "pos" if p["label"] == 1 else "neg",
        "confidence": p["confidence"],
        "created_at": p["dt"].isoformat(),
    } for p in posts]


# ── Reports ───────────────────────────────────────────────────────────────────

def _summarize(posts: list[dict]) -> dict:
    total = len(posts)
    by_day: dict[str, list] = defaultdict(list)
    for p in posts:
        by_day[p["dt"].date().isoformat()].append(p)
    bright = sum(1 for dp in by_day.values() if _pct_positive(dp) >= 50)
    heavy = sum(1 for dp in by_day.values() if _pct_positive(dp) < 50)

    # Top keyword inside this window.
    freq: Counter = Counter()
    for p in posts:
        for w in set(_WORD_RE.findall(p["text"].lower())):
            if w not in _STOPWORDS:
                freq[w] += 1
    top_kw = freq.most_common(1)[0][0] if freq else "—"

    avg = _pct_positive(posts)
    return {
        "total_posts": total,
        "avg_sentiment_pct": avg,
        "top_keyword": top_kw,
        "bright_days": bright,
        "heavy_days": heavy,
        "trend": "pos" if avg >= 60 else "neg" if avg < 45 else "neu",
    }


def report_summary(user_id: str, start: datetime, end: datetime) -> dict:
    posts = _fetch(user_id, start=start, end=end)
    summary = _summarize(posts)
    summary["start"] = start.date().isoformat()
    summary["end"] = end.date().isoformat()
    return summary


def report_history(user_id: str, window_days: int = 14) -> list[dict]:
    """Auto-bucket all of the user's posts into fixed windows, newest first."""
    posts = _fetch(user_id)
    if not posts:
        return []
    earliest = min(p["dt"] for p in posts).date()
    today = datetime.now(timezone.utc).date()

    reports = []
    win_end = today
    idx = 1
    while win_end >= earliest:
        win_start = win_end - timedelta(days=window_days - 1)
        start_dt = datetime.combine(win_start, datetime.min.time(), tzinfo=timezone.utc)
        end_dt = datetime.combine(win_end, datetime.max.time(), tzinfo=timezone.utc)
        bucket = [p for p in posts if start_dt <= p["dt"] <= end_dt]
        if bucket:
            s = _summarize(bucket)
            s.update({
                "id": f"rpt_{idx:04d}",
                "type": "Sentiment digest",
                "start": win_start.isoformat(),
                "end": win_end.isoformat(),
                "generated": (win_end + timedelta(days=1)).isoformat(),
            })
            reports.append(s)
            idx += 1
        win_end = win_start - timedelta(days=1)
    return reports
