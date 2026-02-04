from retrieval.vector_retrieval import VectorRetriever
from retrieval.reranker import Reranker
from agents.summary_agent import SummaryAgent
from agents.decompose_agent import DecomposeAgent

class MRetrievalAgent:
    def __init__(self):
        self.vector_retrieval = VectorRetriever()
        self.reranker = Reranker()
        self.sum_agent = SummaryAgent()  # Ollama (Gemma ou autre)
        self.dec_agent = DecomposeAgent()  # Ollama (Gemma ou autre)

    def predict(self, query):
        # 1️⃣ Décomposer la question
        sub_questions = self.dec_agent.decompose(query)
        if isinstance(sub_questions, str):
            sub_questions = [sub_questions]

        all_chunks = []
        for sub_q in sub_questions:
            docs = self.vector_retrieval.retrieve(sub_q)
            if docs:
                reranked_docs = self.reranker.rerank(sub_q, docs)
                all_chunks.extend(reranked_docs)

        if not all_chunks:
            return "⚠ Aucun document trouvé", []

        # 3️⃣ Synthèse finale
        final_answer = self.sum_agent.summarize(query, all_chunks[:5])
        return final_answer, all_chunks[:5]
