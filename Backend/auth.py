"""Custom JWT authentication (replaces Supabase Auth).

Passwords are hashed with bcrypt; sessions are stateless JWTs signed with
JWT_SECRET. The `get_current_user` dependency decodes the Bearer token on
protected routes.
"""
import os
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Header, HTTPException

import db

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
TOKEN_TTL_DAYS = 30

if not JWT_SECRET:
    raise ValueError("Missing JWT_SECRET in .env file!")


# ── Password hashing ─────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


# ── Tokens ───────────────────────────────────────────────────────────────────

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_TTL_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(authorization: str = Header(None)) -> db.sqlite3.Row:
    """FastAPI dependency — resolves the Bearer token to a user row."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing user token")
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload["sub"]
    except (IndexError, jwt.PyJWTError, KeyError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user


# ── Registration / login helpers ─────────────────────────────────────────────

def register(email: str, password: str, name: str | None = None) -> str:
    if db.get_user_by_email(email):
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = str(uuid.uuid4())
    db.create_user(user_id, email, hash_password(password), name)
    return create_token(user_id)


def change_password(user_id: str, current_password: str, new_password: str) -> None:
    user = db.get_user_by_id(user_id)
    if user is None or not verify_password(current_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    db.update_user_password(user_id, hash_password(new_password))


def login(email: str, password: str) -> str:
    user = db.get_user_by_email(email)
    if user is None or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return create_token(user["id"])
