# ScrollSense Backend

Runs two services with a single command:

- **FastAPI** (`http://127.0.0.1:8000`) — ingestion API used by the browser extension to save scraped Facebook posts to Supabase
- **Streamlit Labeler** (`http://localhost:8501`) — interactive UI for manually labeling those posts as Positive / Neutral / Negative

---

## Prerequisites

- Python 3.10+
- A Supabase project with a `posts` table

---

## Setup

```bash
cd Backend/

# create and activate a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# configure credentials
cp .env.example .env
# open .env and fill in SUPABASE_URL and SUPABASE_KEY
```

---

## Running

```bash
python start.py
```

Both servers start immediately. Open `http://localhost:8501` in your browser to start labeling. Stop both with `Ctrl+C`.

---

## API Reference

### `POST /ingest`

Saves a scraped post to Supabase (used by the browser extension).

**Request body:**
```json
{ "id": "<string>", "text": "<string>" }
```

**Response:**
```json
{ "status": "success" }
```

---

## Labeler UI

- Shows one post at a time, queuing only **unlabeled** posts by default
- Label buttons: 🟢 Positive (`1`) · 🟡 Neutral (`0`) · 🔴 Negative (`-1`)
- ⏭ Skip — moves to the next post without saving
- ← / → navigation to revisit posts
- Sidebar toggle to review and re-label already-labeled posts
- Stats panel showing label distribution across the full database
