import subprocess

class SummaryAgent:
    def __init__(self, model="gemma3:1b"):
        self.model = model

    def summarize(self, query, docs):
        context = "\n".join([f"- {d['page_content']}" for d in docs])
        prompt = f"Contexte :\n{context}\n\nQuestion : {query}\nRéponse :"

        result = subprocess.run(
            ["ollama", "run", self.model],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore"
        )
        return result.stdout.strip() if result.returncode == 0 else "Erreur Ollama"
