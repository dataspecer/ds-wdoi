from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

QDRANT_CLASSES_COLLECTION_NAME = "classes"
QDRANT_PROPERTIES_COLLECTION_NAME = "properties"
QDRANT_INDEX_THRESHOLD = 20_000
QDRANT_DENSE_VECTOR_NAME = "dense"
QDRANT_SPARSE_VECTOR_NAME = "sparse"

qdrant_client = QdrantClient(url=os.getenv("QDRANT_NODE"))
