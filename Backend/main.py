import os
import sys
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

load_dotenv()

# ── Wire in the Processor model package ───────────────────────────────────────
# predict.py lives in ../Processor and imports its sibling modules (config, utils)
# by bare name, so the Processor dir must be on sys.path. CHECKPOINT_DIR is set to
# an absolute path so the model loads regardless of the backend's working dir.
HERE = os.path.dirname(os.path.abspath(__file__))
PROCESSOR_DIR = os.path.abspath(os.path.join(HERE, "..", "Processor"))
os.environ.setdefault(
    "SCROLLSENSE_CHECKPOINT_DIR",
    os.path.join(PROCESSOR_DIR, "checkpoints", "best_model"),
)
sys.path.insert(0, PROCESSOR_DIR)

from predict import predict  # noqa: E402  (import after sys.path tweak)

import auth  # noqa: E402
import db  # noqa: E402
import stats  # noqa: E402

app = FastAPI(title="ScrollSense API")

# CORS — defaults to "*" for local dev; set SCROLLSENSE_ALLOWED_ORIGINS
# (comma-separated) in production to lock it to the deployed frontend.
_origins = os.getenv("SCROLLSENSE_ALLOWED_ORIGINS", "*")
allow_origins = ["*"] if _origins.strip() == "*" else [o.strip() for o in _origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    db.init_db()


# ── Schemas ───────────────────────────────────────────────────────────────────

class PostData(BaseModel):
    id: str
    text: str


class SignupData(BaseModel):
    email: str
    password: str
    name: str | None = None


class LoginData(BaseModel):
    email: str
    password: str


class ProfileUpdate(BaseModel):
    name: str
    email: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class CollectionToggle(BaseModel):
    enabled: bool


def _user_public(user) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "collection_enabled": bool(user["collection_enabled"]),
        "created_at": user["created_at"],
    }


@app.get("/", response_class=HTMLResponse)
async def root():
    return "<html><body><h1>ScrollSense API Online (SQLite + custom auth)</h1></body></html>"


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/auth/signup")
async def signup(data: SignupData):
    token = auth.register(data.email, data.password, data.name)
    return {"access_token": token}


@app.post("/auth/login")
async def login(data: LoginData):
    token = auth.login(data.email, data.password)
    return {"access_token": token}


@app.get("/auth/me")
async def me(user=Depends(auth.get_current_user)):
    return _user_public(user)


@app.patch("/auth/me")
async def update_me(data: ProfileUpdate, user=Depends(auth.get_current_user)):
    existing = db.get_user_by_email(data.email)
    if existing and existing["id"] != user["id"]:
        raise HTTPException(status_code=409, detail="Email already in use")
    db.update_user_profile(user["id"], data.name, data.email)
    return _user_public(db.get_user_by_id(user["id"]))


@app.post("/auth/change-password")
async def change_password(data: PasswordChange, user=Depends(auth.get_current_user)):
    auth.change_password(user["id"], data.current_password, data.new_password)
    return {"status": "success"}


# ── Settings: data-collection flag (shared by web app + extension) ────────────

@app.get("/settings/collection")
async def get_collection(user=Depends(auth.get_current_user)):
    return {"enabled": bool(user["collection_enabled"])}


@app.put("/settings/collection")
async def set_collection(data: CollectionToggle, user=Depends(auth.get_current_user)):
    db.set_collection_enabled(user["id"], data.enabled)
    return {"enabled": data.enabled}


# ── Ingestion (predicts sentiment, then stores) ───────────────────────────────

@app.post("/ingest")
async def ingest(post: PostData, user=Depends(auth.get_current_user)):
    # Respect the user's server-side collection switch.
    if not user["collection_enabled"]:
        return {"status": "skipped", "reason": "collection disabled"}

    result = predict([post.text])[0]
    label_int = 1 if result["label"] == "positive" else 0
    confidence = result["confidence"]

    try:
        db.upsert_post(
            post_id=post.id,
            user_id=user["id"],
            text=post.text,
            label=label_int,
            confidence_score=confidence,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage error: {e}")

    return {"status": "success", "label": result["label"], "confidence": confidence}


# ── Dashboard analytics (all user-scoped) ─────────────────────────────────────

@app.get("/stats/overview")
async def stats_overview(days: int = Query(7, ge=1, le=365), user=Depends(auth.get_current_user)):
    return stats.overview(user["id"], days)


@app.get("/stats/timeline")
async def stats_timeline(days: int = Query(7, ge=1, le=365), user=Depends(auth.get_current_user)):
    return stats.timeline(user["id"], days)


@app.get("/stats/keywords")
async def stats_keywords(days: int = Query(7, ge=1, le=365), user=Depends(auth.get_current_user)):
    return stats.keywords(user["id"], days)


@app.get("/stats/heatmap")
async def stats_heatmap(days: int = Query(30, ge=1, le=365), user=Depends(auth.get_current_user)):
    return stats.heatmap(user["id"], days)


@app.get("/posts")
async def get_posts(limit: int = Query(10, ge=1, le=100), user=Depends(auth.get_current_user)):
    return stats.recent_posts(user["id"], limit)


# ── Reports ───────────────────────────────────────────────────────────────────

def _parse_date(s: str, end: bool = False) -> datetime:
    try:
        d = datetime.fromisoformat(s).date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid date: {s}")
    t = datetime.max.time() if end else datetime.min.time()
    return datetime.combine(d, t, tzinfo=timezone.utc)


@app.get("/reports/summary")
async def reports_summary(
    start: str,
    end: str,
    user=Depends(auth.get_current_user),
):
    return stats.report_summary(user["id"], _parse_date(start), _parse_date(end, end=True))


@app.get("/reports/history")
async def reports_history(user=Depends(auth.get_current_user)):
    return stats.report_history(user["id"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
