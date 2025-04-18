# rag_build_model.py

import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# -------- STEP 1: Load Metadata --------
with open("image_metadata_numbered.json") as f:
    metadata = json.load(f)

texts = [
    f"{entry['description']} {' '.join(entry['tags'])}"
    for entry in metadata
]
print(f"Loaded {len(texts)} images.")

# -------- STEP 2: Generate Embeddings --------
print("🔁 Embedding with MiniLM...")
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(texts, convert_to_numpy=True)

# -------- STEP 3: Build FAISS Index --------
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

# -------- STEP 4: Save Everything --------
faiss.write_index(index, "image_index.faiss")
with open("embedding_texts.json", "w") as f:
    json.dump(texts, f)
print("✅ Saved: video_index.faiss & embedding_texts.json")
