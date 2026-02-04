from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from typing import List


class VectorRetriever:
    def __init__(self, collection="psybot-embedding", top_k=10):
        self.client = QdrantClient(host="localhost", port=6333, timeout=600.0)
        self.model = SentenceTransformer("intfloat/multilingual-e5-base")
        self.collection = collection
        self.top_k = top_k

    def retrieve(self, query: str) -> List[str]:
        embedding = self.model.encode([query], normalize_embeddings=True)[0]
        res = self.client.query_points(
            collection_name=self.collection,
            query=embedding.tolist(),
            limit=self.top_k,
            with_payload=True
        )
        return [point.payload['page_content'] for point in res.points]
