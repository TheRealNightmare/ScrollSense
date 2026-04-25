import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from fastapi.responses import HTMLResponse
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


@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>ScrollSense API</title>
            <style>
                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
                .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
                h1 { color: #1877f2; }
                p { color: #65676b; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Welcome to ScrollSense</h1>
                <p>The bridge between your feed and your data.</p>
                <p style="font-size: 0.8rem;">Status: <span style="color: green;">Online</span></p>
            </div>
        </body>
    </html>
    """

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