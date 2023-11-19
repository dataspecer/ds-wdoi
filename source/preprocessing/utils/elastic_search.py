from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from es_config import *

CLASSES_ELASTIC_INDEX_NAME = "classes"
PROPERTIES_ELASTIC_INDEX_NAME = "properties"
CHUNK_SIZE = 10_000
ANALYZER_LANGUAGE_MAP = {
    "arabic": ["ar"],
    "armenian": ["hy"],
    "basque": ["eu"],
    "bengali": ["bn"],
    "brazilian": ["pt-br", "br"],
    "bulgarian": ["bg"],
    "catalan": ["ca"],
    "cjk": ["zh", "ja", "ko", "vi"],
    "czech": ["cs"],
    "danish": ["da"],
    "dutch": ["nl"],
    "english": ["en"],
    "estonian": ["et"],
    "finnish": ["fi"],
    "french": ["fr"],
    "galician": ["gl"],
    "german": ["de"],
    "greek": ["el"],
    "hindi": ["hi"],
    "hungarian": ["hu"],
    "indonesian": ["id"],
    "irish": ["ga"],
    "italian": ["it"],
    "latvian": ["lv"],
    "lithuanian": ["lt"],
    "norwegian": ["no"],
    "persian": ["fa"],
    "portuguese": ["pt"],
    "romanian": ["ro"],
    "russian": ["ru"],
    "sorani": ["ckb"],
    "spanish": ["es"],
    "swedish": ["sv"],
    "turkish": ["tr"],
    "thai": ["th"],
}

client = Elasticsearch("https://localhost:9200", ca_certs=ES_CERT_PATH, basic_auth=('elastic', ES_PASSWD))
