import subprocess

class OllamaLLM:
    def __init__(self, model="qwen2.5:1.5b"):
        self.model = model

    def generate(self, prompt: str) -> str:
        result = subprocess.run(
    ["ollama", "run", self.model],
    input=prompt,
    capture_output=True,
    text=True,
    encoding="utf-8",  # ✅ Ajout important
    errors="ignore"    # ✅ Ignore les caractères non valides
)

        return result.stdout.strip()
