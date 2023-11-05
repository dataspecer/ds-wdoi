from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

CLASSES_ELASTIC_INDEX_NAME = "classes"
PROPERTIES_ELASTIC_INDEX_NAME = "properties"
CHUNK_SIZE = 10_000

client = Elasticsearch("http://localhost:9200")
