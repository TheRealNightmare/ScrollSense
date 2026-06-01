# ScrollSense

ScrollSense reads the sentiment of your social feed. A browser extension scrapes the posts you
scroll past on Facebook, a fine-tuned transformer model scores each one as **positive** or
**negative**, everything is stored per-user in a local database, and a web dashboard turns it all
into live charts — positivity over time, busiest hours, keyword clouds, negativity heatmaps, and
shareable reports.

The whole system uses **one account**: the same email/password (and the same JWT) works in both the
web app and the browser extension.

---

## Architecture — which part is which

| Folder | What it is | Tech | Talks to |
|--------|-----------|------|----------|
| **`Processor/`** | The sentiment **model**. Fine-tunes `xlm-roberta-base` (handles Bengali-English code-mixed text) to classify posts positive/negative. Produces `checkpoints/best_model/`. | Python · PyTorch · Transformers | Imported by the Backend (`predict.py`) |
| **`Backend/`** | The **API + database**. FastAPI server with custom JWT auth and a SQLite store. On ingest it runs the model and saves the post + label per user; it also serves all the analytics the web app shows. | Python · FastAPI · SQLite | Used by the Frontend **and** the Scrapper |
| **`Frontend/scrollsense/`** | The **web app**. Login/signup, dashboard, reports, settings. Reads live analytics from the Backend. | React · Vite | Backend (`http://localhost:8000`) |
| **`Scrapper/`** | The **browser extension** (Chrome, Manifest V3). Scrapes Facebook feed posts and sends them to the Backend to be scored. Has its own login popup + a collection on/off toggle. | Vanilla JS · Chrome Extension | Backend (`/auth`, `/ingest`, `/settings/collection`) |

### Data flow

```
                    ┌──────────────────────────────────────────────┐
                    │                  Backend (:8000)             │
  Facebook feed     │                                              │
        │           │   /auth/*  ──►  users      (SQLite)          │
        ▼           │   /ingest  ──►  model.predict() ──► posts    │
 ┌─────────────┐    │                                              │
 │  Scrapper   │ ── POST /ingest (JWT) ──►  predict + store        │
 │ (extension) │    │                                              │
 └─────────────┘    │   /stats/*, /posts, /reports/*  ◄────────┐   │
                    └──────────────────────────────────────────┼──┘
                                                                │
                                       GET analytics (JWT)      │
                                 ┌──────────────────────────────┘
                                 │
                          ┌──────────────┐
                          │   Frontend   │   dashboard · reports · settings
                          │  (web app)   │
                          └──────────────┘

   Same account / same JWT is used by both the Scrapper and the Frontend.
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** (for the web app)
- **Google Chrome** (or any Chromium browser, for the extension)
- A **trained model checkpoint** at `Processor/checkpoints/best_model/` — already included in this
  repo. You only need to train if it's missing (see Step 1).

---

## Setup & run

Run the parts **in this order**. The Backend needs the model checkpoint to exist, and the Frontend
and Scrapper both need the Backend running to log in.

### 1. Processor (model) — *usually skippable*

The checkpoint is already in `Processor/checkpoints/best_model/`, so you can skip this. Only train
if that folder is missing or you want to retrain.

```bash
cd Processor
python3 -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train.py                     # writes checkpoints/best_model/
```

See [`Processor/README.md`](Processor/README.md) for data format, evaluation, and config.

### 2. Backend (API + database)

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# open .env and set JWT_SECRET to a long random string (required — start.py exits without it)

python start.py
```

This starts two services:

- **FastAPI** → `http://127.0.0.1:8000` — the API the web app and extension use.
- **Streamlit labeler** → `http://localhost:8501` — an optional UI for manually reviewing/correcting
  stored posts.

Stop both with `Ctrl+C`. More detail (full API reference, labeler) in
[`Backend/README.md`](Backend/README.md).

### 3. Frontend (web app)

In a new terminal:

```bash
cd Frontend/scrollsense
npm install

# optional — only if your backend is not on http://localhost:8000
cp .env.example .env                 # then edit VITE_API_URL

npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). Create an account or log in.

### 4. Scrapper (browser extension)

```bash
cd Scrapper
cp config.example.js config.js       # edit BACKEND_URL if your backend isn't on :8000
```

Then load it into Chrome:

1. Go to `chrome://extensions`
2. Turn on **Developer mode** (top-right)
3. Click **Load unpacked** and select the `Scrapper/` folder
4. Pin the ScrollSense icon, open the popup, and **sign in with the same account** you use on the web app

---

## Using it end-to-end

1. **Start the Backend** (Step 2), then the **Frontend** (Step 3), and **load the extension** (Step 4).
2. **Sign up once** — in either the web app or the extension popup. The account is shared, so you can
   then log into the other with the same credentials.
3. In the extension popup, make sure the **collection toggle is ON**. (You can also control this from
   the web app under **Settings → Data collection** — the switch is synced between the two.)
4. **Browse Facebook.** As you scroll, the extension captures fully-expanded posts and sends them to
   the Backend, which scores and stores them.
5. **Open the web app dashboard** — positivity gauge, sentiment-over-time, volume, keyword cloud,
   negativity heatmap, and your recent scored posts populate from real data.
6. **Reports** lets you pick a date range and generate a summary (total posts, average sentiment,
   top keyword, bright/heavy days); past fortnightly windows appear in the history table.

> **Heads-up:** until the extension has scraped some posts, the dashboard shows a clean empty state —
> there's no seeded demo data. Scroll a feed for a minute and refresh.

---

## Configuration reference

| File | Key | Purpose | Default |
|------|-----|---------|---------|
| `Backend/.env` | `JWT_SECRET` | Signs auth tokens (**required**) | — |
| `Backend/.env` | `SCROLLSENSE_DB_PATH` | SQLite file location | `Backend/scrollsense.db` |
| `Backend/.env` | `SCROLLSENSE_CHECKPOINT_DIR` | Model checkpoint path | `../Processor/checkpoints/best_model` |
| `Backend/.env` | `SCROLLSENSE_ALLOWED_ORIGINS` | CORS allow-list (comma-separated) for production | `*` (any origin) |
| `Frontend/scrollsense/.env` | `VITE_API_URL` | Backend base URL the web app calls | `http://localhost:8000` |
| `Scrapper/config.js` | `BACKEND_URL` | Backend base URL the extension calls | `http://localhost:8000` |

---

## Key API endpoints

All data endpoints require an `Authorization: Bearer <jwt>` header.

- **Auth:** `POST /auth/signup`, `POST /auth/login`, `GET/PATCH /auth/me`, `POST /auth/change-password`
- **Ingestion:** `POST /ingest` — predict + store one post (used by the extension)
- **Analytics:** `GET /stats/overview`, `/stats/timeline`, `/stats/keywords`, `/stats/heatmap`, `GET /posts`
- **Reports:** `GET /reports/summary?start=&end=`, `GET /reports/history`
- **Settings:** `GET/PUT /settings/collection` — shared collection toggle

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `start.py` exits with "missing JWT_SECRET" | Set `JWT_SECRET` in `Backend/.env`. |
| Dashboard is empty | Expected until the extension scrapes posts. Log into the extension, enable collection, and scroll a feed. |
| `401 Unauthorized` / bounced to login | Token expired or `JWT_SECRET` changed — log in again. |
| Web app can't reach the API / CORS error | Confirm the Backend is on `:8000`, that `VITE_API_URL` / `Scrapper/config.js` point to it, and (in prod) that the origin is in `SCROLLSENSE_ALLOWED_ORIGINS`. |
| Backend fails to load the model | Ensure `Processor/checkpoints/best_model/` exists (train via Step 1) and Backend deps installed. |
| `Port 8000/8501 already in use` | Stop the other process, or free the port before running `start.py`. |
| Extension does nothing on Facebook | Reload it from `chrome://extensions`, confirm you're signed in, and that the collection toggle is on. |

---

## Component docs

- [`Backend/README.md`](Backend/README.md) — full API reference and the Streamlit labeler
- [`Processor/README.md`](Processor/README.md) — model training, evaluation, and configuration
