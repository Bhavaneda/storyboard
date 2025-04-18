# rag_run.py

import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline

# -------- STEP 1: Load Saved Files --------
print("📥 Loading index and text embeddings...")
index = faiss.read_index("image_index.faiss")
with open("embedding_texts.json") as f:
    texts = json.load(f)
with open("image_metadata_numbered.json") as f:
    metadata = json.load(f)

# -------- STEP 2: Load Embedding & Generator Model --------
model = SentenceTransformer("all-MiniLM-L6-v2")
generator = pipeline("text2text-generation", model="google/flan-t5-base")

# -------- STEP 3: RAG Functions --------
def retrieve(query, k=3):
    query_vec = model.encode([query], convert_to_numpy=True)
    _, indices = index.search(query_vec, k)
    docs = [texts[i] for i in indices[0]]
    filenames = [metadata[i]['filename'] for i in indices[0]]
    return docs, filenames

def answer_with_rag(query, k=5):
    docs, files = retrieve(query, k)
    context = "\n".join(docs)
    prompt = f"Context:\n{context}\n\nQuestion: {query}\nAnswer:"
    output = generator(prompt, max_new_tokens=150, do_sample=False)[0]['generated_text']
    return output, files

# -------- STEP 4: CLI Interface --------
if __name__ == "__main__":
    print("\n🎬 RAG Image Assistant Ready!\n")
    while True:
        q = input("Ask a question (or type 'exit'): ")
        if q.strip().lower() == "exit":
            break
        answer, filenames = answer_with_rag(q)
        print("\n📦 Relevant Images:", filenames)
        print("💬 Answer:\n", answer)
