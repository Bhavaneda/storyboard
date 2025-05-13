# rag_run.py (Updated for TF-IDF)
import json
import faiss
import numpy as np
import pickle

# -------- STEP 1: Load Saved Files --------
print("📥 Loading index, vectorizer, and texts...")
index = faiss.read_index("image_index.faiss")

with open("embedding_texts.json") as f:
    texts = json.load(f)

with open("image_metadata_numbered.json") as f:
    metadata = json.load(f)

with open("tfidf_vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# -------- STEP 2: RAG Functions --------
def retrieve(query, k=3):
    query_vec = vectorizer.transform([query]).toarray().astype('float32')
    _, indices = index.search(query_vec, k)
    docs = [texts[i] for i in indices[0]]
    filenames = [metadata[i]['filename'] for i in indices[0]]
    return docs, filenames

def answer_with_rag(query, k=5):
    docs, files = retrieve(query, k)
    context = "\n".join(docs)
    return f"📘 Context retrieved:\n{context}\n\n(This is a keyword match using TF-IDF)", files

# -------- STEP 3: CLI Interface --------
if __name__ == "__main__":
    print("\n🎬 RAG Image Assistant (TF-IDF + FAISS) Ready!\n")
    while True:
        q = input("Ask a question (or type 'exit'): ")
        if q.strip().lower() == "exit":
            break
        answer, filenames = answer_with_rag(q)
        print("\n📦 Relevant Images:", filenames)
        print("💬 Answer:\n", answer)
