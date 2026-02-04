# app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os, sys
from jinja2 import Template

# --- S'assurer que le dossier courant est bien dans sys.path ---
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# HM-RAG agent
from agents.multi_retrieval_agents import MRetrievalAgent

# Ollama pour modèle fine-tuned local
from langchain_community.llms import Ollama

app = FastAPI()
agent = MRetrievalAgent()  # HM-RAG déjà existant

# --------- 1. Lire le template Jinja pour le fine-tuning ---------
# Chemin vers ton fichier Jinja
template_path = os.path.join(
    r"C:\Users\bough\pfaA-main\backend\models\qwen-finetuned-merged-bi-cpu",
    "chat_template.jinja"
)
with open(template_path, "r", encoding="utf-8") as f:
    template_text = f.read()

# --------- 2. Config modèle fine-tuned (local Ollama) ---------
finetuned_model = Ollama(
    model=r"backend\models\qwen-finetuned-merged-bi-cpu",
    temperature=0.2
)

# --------- 3. Fonction pour générer la prompt et appeler Ollama ---------
def run_finetuned(question: str, history: list = None) -> str:
    messages = history or [{"role": "user", "content": question}]
    jinja_template = Template(template_text)
    rendered_prompt = jinja_template.render(messages=messages, add_generation_prompt=True)
    return finetuned_model(rendered_prompt)

# --------- 4. Schéma FastAPI ---------
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

# --------- 5. Méthode hybride ---------
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    question = req.message

    # Préparer l'historique pour le modèle fine-tuned
    history_for_finetuned = [{"role": h.role, "content": h.content} for h in (req.history or [])]
    finetuned_response = run_finetuned(question, history_for_finetuned)

    # Si la réponse est trop courte, utiliser HM-RAG
    use_rag = len(finetuned_response.split()) < 10

    if use_rag:
        answer, chunks = agent.predict(question)
        citations = []
        for ch in (chunks or []):
            citations.append({
                "score": float(ch.get("score", 0.0)),
                "snippet": (ch.get("page_content") or "")[:300],
                **({"metadata": ch.get("metadata")} if isinstance(ch, dict) and ch.get("metadata") else {})
            })
        final_answer = answer
    else:
        final_answer = finetuned_response
        citations = None

    return ChatResponse(
        answer=final_answer,
        citations=citations,
        debug={
            "used_rag": use_rag,
            "finetuned_response": finetuned_response
        }
    )

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8001, reload=False)
