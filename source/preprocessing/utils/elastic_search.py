from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from utils.es_config import *

CLASSES_ELASTIC_INDEX_NAME = "classes"
PROPERTIES_ELASTIC_INDEX_NAME = "properties"
CHUNK_SIZE = 10_000

client = Elasticsearch("https://localhost:9200", ca_certs=ES_CERT_PATH, basic_auth=('elastic', ES_PASSWD))
