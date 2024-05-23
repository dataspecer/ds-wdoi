from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

ELASTIC_CLASSES_INDEX_NAME = "classes"
ELASTIC_PROPERTIES_INDEX_NAME = "properties"
ELASTIC_CHUNK_SIZE = 10_000

ELASTIC_ENGLISH_ANALYZER = "english"
ELASTIC_ENGLISH_SUFFIX = "en"

ELASTIC_ANALYZER_LANGUAGE_MAP = {
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


# If using the certificate from docker image, you need to disable certificate verification.
elastic_client = Elasticsearch(
    hosts=[os.getenv('ES_NODE')],
    verify_certs=False,
    request_timeout=30,
    max_retries=5
)
