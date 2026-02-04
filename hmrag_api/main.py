from agents.multi_retrieval_agents import MRetrievalAgent

if __name__ == "__main__":
    agent = MRetrievalAgent()
    query = input("❓ Entrez votre question : ").strip()
    answer, chunks = agent.predict(query)

    print("\n🤖 Réponse :")
    print(answer)

    print("\n📚 Chunks utilisés :")
    for i, doc in enumerate(chunks, 1):
        print(f"[{i}] Score: {doc['score']:.4f}")
        print(f"Texte: {doc['page_content']}")
