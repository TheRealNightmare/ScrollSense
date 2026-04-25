import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SUPABASE CONFIGURATION ---
# Fetching the credentials securely from the .env file
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Safety check so you don't run the server without your keys
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file!")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class PostData(BaseModel):
    id: str
    text: str

@app.post("/ingest")
async def ingest(post: PostData):
    print("\n" + "="*50)
    print(f"RECEIVED ID: {post.id}...")
    
    try:
        response = supabase.table("posts").upsert({
            "id": post.id,
            "text": post.text
        }).execute()
        
        print("Successfully Upserted to Supabase!")
        print(f"TEXT: {post.text[:100]}...")
        
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return {"status": "error", "message": str(e)}

    print("="*50)
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)