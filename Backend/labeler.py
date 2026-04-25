import os
import streamlit as st
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    st.error("Missing Supabase credentials. Add SUPABASE_URL and SUPABASE_KEY to your .env file.")
    st.stop()

@st.cache_resource
def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

supabase = get_supabase()


def load_posts(show_all: bool) -> list[dict]:
    query = supabase.table("posts").select("id, text, label").order("id")
    if not show_all:
        query = query.is_("label", "null")
    return query.execute().data


def save_label(post_id: str, label: int):
    supabase.table("posts").update({"label": label}).eq("id", post_id).execute()


def init_state(posts: list[dict]):
    if "index" not in st.session_state:
        st.session_state.index = 0
    if "posts" not in st.session_state:
        st.session_state.posts = posts
    if "total_labeled" not in st.session_state:
        st.session_state.total_labeled = 0


# ── Page config ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="ScrollSense Labeler",
    page_icon="🏷️",
    layout="centered",
)

st.markdown("""
<style>
    .post-box {
        background: #1e1e2e;
        border: 1px solid #3a3a5c;
        border-radius: 12px;
        padding: 24px 28px;
        font-size: 1.05rem;
        line-height: 1.7;
        color: #cdd6f4;
        min-height: 180px;
        margin-bottom: 8px;
    }
    .meta {
        color: #6c7086;
        font-size: 0.78rem;
        margin-bottom: 20px;
    }
    .label-badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .badge-pos  { background:#1a3d2b; color:#4ade80; }
    .badge-neu  { background:#2d2d1f; color:#fde047; }
    .badge-neg  { background:#3d1a1a; color:#f87171; }
</style>
""", unsafe_allow_html=True)

# ── Sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.title("🏷️ ScrollSense Labeler")
    st.markdown("---")

    show_all = st.toggle("Show already-labeled posts", value=False)

    if st.button("🔄 Reload posts", use_container_width=True):
        st.cache_resource.clear()
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

    st.markdown("---")
    st.markdown("**Keyboard shortcuts**")
    st.markdown("Use the buttons below — click the one you want or Tab → Enter.")
    st.markdown("---")
    st.markdown("**Labels**")
    st.markdown("🟢 **Positive** → `1`")
    st.markdown("🟡 **Neutral** → `0`")
    st.markdown("🔴 **Negative** → `-1`")

# ── Load data ────────────────────────────────────────────────────────────────
if "posts" not in st.session_state or show_all != st.session_state.get("_show_all"):
    posts = load_posts(show_all)
    st.session_state.posts = posts
    st.session_state.index = 0
    st.session_state._show_all = show_all
    st.session_state.total_labeled = 0

posts = st.session_state.posts

if not posts:
    st.success("🎉 All posts have been labeled! Use 'Show already-labeled posts' to review them.")
    st.stop()

idx: int = st.session_state.index

if idx >= len(posts):
    st.success(f"🎉 Session complete! You labeled {st.session_state.total_labeled} posts this session.")
    if st.button("Start over / reload"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()
    st.stop()

post = posts[idx]

# ── Progress ─────────────────────────────────────────────────────────────────
total = len(posts)
progress = idx / total
st.progress(progress, text=f"Post {idx + 1} of {total}  •  {st.session_state.total_labeled} labeled this session")

# ── Post display ─────────────────────────────────────────────────────────────
current_label = post.get("label")
if current_label is not None:
    badge_map = {1: ("badge-pos", "Positive"), 0: ("badge-neu", "Neutral"), -1: ("badge-neg", "Negative")}
    cls, name = badge_map.get(current_label, ("badge-neu", str(current_label)))
    badge_html = f'<span class="label-badge {cls}">Already labeled: {name} ({current_label})</span>'
else:
    badge_html = ""

st.markdown(
    f'<div class="meta">ID: {post["id"]}  {badge_html}</div>'
    f'<div class="post-box">{post["text"]}</div>',
    unsafe_allow_html=True,
)

st.markdown("")

# ── Label buttons ─────────────────────────────────────────────────────────────
col1, col2, col3, col_skip = st.columns([2, 2, 2, 1])

def apply_label(label: int):
    save_label(post["id"], label)
    st.session_state.posts[idx]["label"] = label
    st.session_state.index += 1
    st.session_state.total_labeled += 1

with col1:
    if st.button("🟢 Positive", use_container_width=True, type="primary"):
        apply_label(1)
        st.rerun()

with col2:
    if st.button("🟡 Neutral", use_container_width=True):
        apply_label(0)
        st.rerun()

with col3:
    if st.button("🔴 Negative", use_container_width=True):
        apply_label(-1)
        st.rerun()

with col_skip:
    if st.button("⏭ Skip", use_container_width=True):
        st.session_state.index += 1
        st.rerun()

# ── Navigation ────────────────────────────────────────────────────────────────
st.markdown("")
nav_col1, _, nav_col2 = st.columns([1, 4, 1])
with nav_col1:
    if idx > 0 and st.button("← Back"):
        st.session_state.index -= 1
        st.rerun()
with nav_col2:
    if idx < total - 1 and st.button("Next →"):
        st.session_state.index += 1
        st.rerun()

# ── Stats expander ────────────────────────────────────────────────────────────
with st.expander("📊 Label distribution (all posts in DB)"):
    all_posts = supabase.table("posts").select("label").execute().data
    counts = {1: 0, 0: 0, -1: 0, None: 0}
    for p in all_posts:
        lbl = p.get("label")
        counts[lbl if lbl in counts else None] += 1
    total_db = len(all_posts)
    st.markdown(f"**Total posts:** {total_db}")
    st.markdown(f"🟢 Positive: **{counts[1]}**  |  🟡 Neutral: **{counts[0]}**  |  🔴 Negative: **{counts[-1]}**  |  ⬜ Unlabeled: **{counts[None]}**")
    if total_db > 0:
        labeled_pct = round(100 * (total_db - counts[None]) / total_db, 1)
        st.progress((total_db - counts[None]) / total_db, text=f"{labeled_pct}% labeled")
