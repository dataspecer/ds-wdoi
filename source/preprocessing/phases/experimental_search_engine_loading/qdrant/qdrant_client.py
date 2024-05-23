from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

CLASSES_COLLECTION_NAME = "classes"
PROPERTIES_COLLECTION_NAME = "properties"
INDEX_THRESHOLD = 20_000
DENSE_VECTOR_NAME = "dense"
SPARSE_VECTOR_NAME = "sparse"

qdrant_client = QdrantClient(url=os.getenv("QDRANT_NODE"))
