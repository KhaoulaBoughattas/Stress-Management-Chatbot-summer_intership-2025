# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn

# import your agent
from agents.multi_retrieval_agents import MRetrievalAgent

app = FastAPI()
agent = MRetrievalAgent()  # load once (models, qdrant, etc.)

class HistTurn(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistTurn]] = None
    params: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    answer: str
    citations: Optional[List[Dict[str, Any]]] = None
    debug: Optional[Dict[str, Any]] = None

@app.get("/health")
def health():
    return {"ok": True}
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    # your agent currently ignores history; that's fine
    answer, chunks = agent.predict(req.message)

    # Normalize chunks to lightweight citations for UI/DB
    citations = []
    for ch in (chunks or []):
        citations.append({
            "score": float(ch.get("score", 0.0)),
            "snippet": (ch.get("page_content") or "")[:300],
            # include metadata if you have it
            **({"metadata": ch.get("metadata")} if isinstance(ch, dict) and ch.get("metadata") else {})
        })

    return ChatResponse(answer=answer, citations=citations, debug=None)

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=False)