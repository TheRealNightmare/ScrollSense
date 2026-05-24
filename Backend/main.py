import os
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class PostData(BaseModel):
    id: str
    text: str

@app.get("/", response_class=HTMLResponse)
async def root():
    return "<html><body><h1>ScrollSense API Online (With User Login enabled)</h1></body></html>"

@app.post("/ingest")
async def ingest(post: PostData, authorization: str = Header(None)):
    print("\n" + "="*50)
    print(f"RECEIVED ID: {post.id}...")
    
    # 1. Verify Extension Token
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing user token")

    try:
        token = authorization.split(" ")[1] 
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

    print("Saving post directly to database (AI processing bypassed)...")
    
    # 2. Upsert to Database (Explicitly leaving label and confidence_score as None/NULL)
    try:
        response = supabase.table("posts").upsert({
            "id": post.id,
            "user_id": user_id,
            "text": post.text,
            "label": None,
            "confidence_score": None
        }).execute()
        print(f"Successfully Upserted to Supabase for user: {user_id}")
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return {"status": "error", "message": str(e)}

    print("="*50)
    return {"status": "success", "message": "Post saved directly to database"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)