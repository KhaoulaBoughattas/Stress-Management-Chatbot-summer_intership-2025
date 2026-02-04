# decompose_agent.py
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_ollama import OllamaLLM  # Remplace l'ancien Ollama

class DecomposeAgent:
    def __init__(self, model="gemma3:1b"):
        # Utilisation de la nouvelle classe OllamaLLM
        self.llm = OllamaLLM(model=model, temperature=0.35)

    def count_intents(self, query):
        prompt = PromptTemplate.from_template(
            "Please calculate how many independent intents are contained in the following query. Return only an integer:\n{query}\nNumber of intents: "
        )
        chain = LLMChain(llm=self.llm, prompt=prompt)
        try:
            # Remplacer run() par invoke()
            return int(chain.invoke({"query": query}).strip())
        except Exception:
            return 1

    def decompose(self, query):
        if self.count_intents(query) > 1:
            return self._split_query(query)
        return [query]

    def _split_query(self, query):
        prompt = PromptTemplate.from_template(
            "Split the following query into multiple independent sub-queries, separated by '||', without additional explanations:\n{query}\nList of sub-queries: "
        )
        chain = LLMChain(llm=self.llm, prompt=prompt)
        response = chain.invoke({"query": query})
        return [q.strip() for q in response.split("||") if q.strip()]
