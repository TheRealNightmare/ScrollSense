"""SQLite datastore for ScrollSense (replaces Supabase).

A single file-based database holds users and scraped/labeled posts.
All access goes through the small helper functions below so the rest of the
backend never touches raw SQL.
"""
import os
import sqlite3
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.getenv("SCROLLSENSE_DB_PATH", os.path.join(HERE, "scrollsense.db"))


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _column_names(conn, table: str) -> set[str]:
    return {row["name"] for row in conn.execute(f"PRAGMA table_info({table})")}


def init_db() -> None:
    """Create tables if they don't exist and run lightweight migrations.

    Safe to call on every startup.
    """
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id                 TEXT PRIMARY KEY,
                email              TEXT UNIQUE NOT NULL,
                password_hash      TEXT NOT NULL,
                name               TEXT,
                collection_enabled INTEGER NOT NULL DEFAULT 1,
                created_at         TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS posts (
                id               TEXT PRIMARY KEY,
                user_id          TEXT,
                text             TEXT NOT NULL,
                label            INTEGER,
                confidence_score REAL,
                created_at       TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            """
        )

        # ── Migrations for databases created before these columns existed ──────
        user_cols = _column_names(conn, "users")
        if "name" not in user_cols:
            conn.execute("ALTER TABLE users ADD COLUMN name TEXT")
        if "collection_enabled" not in user_cols:
            conn.execute(
                "ALTER TABLE users ADD COLUMN collection_enabled INTEGER NOT NULL DEFAULT 1"
            )

        conn.execute("CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, created_at)")


# ── Users ────────────────────────────────────────────────────────────────────

def create_user(user_id: str, email: str, password_hash: str, name: str | None = None) -> None:
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO users (id, email, password_hash, name, collection_enabled, created_at) "
            "VALUES (?, ?, ?, ?, 1, ?)",
            (user_id, email, password_hash, name, _now()),
        )


def get_user_by_email(email: str) -> sqlite3.Row | None:
    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM users WHERE email = ?", (email,))
        return cur.fetchone()


def get_user_by_id(user_id: str) -> sqlite3.Row | None:
    with get_connection() as conn:
        cur = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        return cur.fetchone()


def update_user_profile(user_id: str, name: str, email: str) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            (name, email, user_id),
        )


def update_user_password(user_id: str, password_hash: str) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (password_hash, user_id),
        )


def set_collection_enabled(user_id: str, enabled: bool) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE users SET collection_enabled = ? WHERE id = ?",
            (1 if enabled else 0, user_id),
        )


# ── Posts ────────────────────────────────────────────────────────────────────

def upsert_post(post_id: str, user_id: str, text: str,
                label: int | None, confidence_score: float | None) -> None:
    """Insert a post or update its text/label if the id already exists."""
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO posts (id, user_id, text, label, confidence_score, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                text             = excluded.text,
                label            = excluded.label,
                confidence_score = excluded.confidence_score
            """,
            (post_id, user_id, text, label, confidence_score, _now()),
        )


def list_posts(only_unlabeled: bool = False) -> list[dict]:
    query = "SELECT id, text, label FROM posts"
    if only_unlabeled:
        query += " WHERE label IS NULL"
    query += " ORDER BY created_at"
    with get_connection() as conn:
        return [dict(row) for row in conn.execute(query).fetchall()]


def update_label(post_id: str, label: int) -> None:
    with get_connection() as conn:
        conn.execute("UPDATE posts SET label = ? WHERE id = ?", (label, post_id))


def label_distribution() -> list[dict]:
    """Returns every post's label (for the labeler stats panel)."""
    with get_connection() as conn:
        return [dict(row) for row in conn.execute("SELECT label FROM posts").fetchall()]
