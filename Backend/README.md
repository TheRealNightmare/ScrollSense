# ScrollSense Backend

Runs two services with a single command:

- **FastAPI** (`http://127.0.0.1:8000`) — auth + ingestion API used by the browser extension. On `/ingest` it
  runs the fine-tuned sentiment model (from `../Processor/checkpoints/best_model`) and stores the post plus its
  predicted label/confidence in a local **SQLite** database (`scrollsense.db`).
- **Streamlit Labeler** (`http://localhost:8501`) — interactive UI for reviewing/correcting those posts as Positive / Negative

---

## Prerequisites

- Python 3.10+
- A trained checkpoint produced by the Processor (`cd ../Processor && python train.py`)

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
# open .env and set JWT_SECRET to a long random string
```

---

## Running

```bash
python start.py
```

Both servers start immediately. Open `http://localhost:8501` in your browser to start labeling. Stop both with `Ctrl+C`.

---

## API Reference

### `POST /auth/signup` · `POST /auth/login`

```json
{ "email": "<string>", "password": "<string>" }
```
Returns `{ "access_token": "<jwt>" }`. Send it as `Authorization: Bearer <jwt>` on `/ingest`.

### `POST /ingest`

Runs the sentiment model on the post, then saves it to SQLite (used by the browser extension). Requires auth.

**Request body:**
```json
{ "id": "<string>", "text": "<string>" }
```

**Response:**
```json
{ "status": "success", "label": "positive", "confidence": 0.97 }
```

---

## Labeler UI

- Shows one post at a time, queuing only **unlabeled** posts by default
- Label buttons: 🟢 Positive (`1`) · 🔴 Negative (`0`)
- ⏭ Skip — moves to the next post without saving
- ← / → navigation to revisit posts
- Sidebar toggle to review and re-label already-labeled posts
- Stats panel showing label distribution across the full database
