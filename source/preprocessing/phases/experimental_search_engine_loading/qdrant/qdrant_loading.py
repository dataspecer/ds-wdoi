import pprint
import core.utils.logging as ul
from core.utils.timer import timed
from qdrant_client import models
from phases.experimental_search_engine_loading.qdrant.qdrant_client import qdrant_client as qc, INDEX_THRESHOLD ,CLASSES_COLLECTION_NAME, SPARSE_VECTOR_NAME, DENSE_VECTOR_NAME
from phases.experimental_search_engine_data_preparation.phase_parts.vectorize.dense import MODEL_DIMENSIONS
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_loading.main_logger import main_logger, ul
from pathlib import Path
import core.utils.decoding as decoding

logger = main_logger.getChild("qdrant")
pp = pprint.PrettyPrinter(indent=2)

BATCH_SIZE = 1_000

def __recreate_collection(collection_name: str):
    """
    Create the collection but set the indexing threashold to 0.
    Meaning the indexing would not be done during upload.
    Afterwards, there is the need to set it manually.
    """
    
    logger.info(f"Creating collection {collection_name}")
    qc.recreate_collection(
        collection_name=collection_name,
        vectors_config={
            DENSE_VECTOR_NAME: models.VectorParams(size=MODEL_DIMENSIONS, distance=models.Distance.COSINE)
        },
        sparse_vectors_config={
            SPARSE_VECTOR_NAME: models.SparseVectorParams()
        },
        optimizers_config=models.OptimizersConfigDiff(indexing_threshold=0)
    )
    logger.info(f"Created successfuly collection {collection_name}")

def delete_collection(collection_name: str):
    logger.info(f"Deleting collection {collection_name}")
    qc.delete_collection(collection_name=collection_name)
    logger.info(f"Deleted {collection_name} successfully")
    
def collection_info(collection_name: str):
    logger.info(f"Getting collection {collection_name} info")
    info = qc.get_collection(collection_name=collection_name)
    pp.pprint(info)
    logger.info(f"Got collection {collection_name} info successfuly")
    
def __set_default_collection_index_threshold(collection_name: str):
    logger.info(f"Updating collection {collection_name} index threashold to {INDEX_THRESHOLD}")
    qc.update_collection(
        collection_name=collection_name,
        optimizers_config=models.OptimizersConfigDiff(indexing_threshold=INDEX_THRESHOLD)
    )
    logger.info(f"Updated collection {collection_name} index threashold to {INDEX_THRESHOLD} successfuly")
    
def __create_classes_payload_index():
    logger.info(f"Creating payload index for {CLASSES_COLLECTION_NAME}")
    qc.create_payload_index(
        collection_name=CLASSES_COLLECTION_NAME,
        field_name=DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value,
        field_schema=models.IntegerIndexParams(
            type=models.IntegerIndexType.INTEGER,
            lookup=True,
            range=False
        )
    )
    logger.info(f"Created payload index for {CLASSES_COLLECTION_NAME} successfuly")

def __qdrant_points_gen(classes_json_file):
    for wd_data_class in decoding.entities_from_file(classes_json_file, logger, ul.TEN_K_PROGRESS_STEP):
        yield models.PointStruct(
            id=wd_data_class[DataClassFields.ID.value],
            payload={
                DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value: wd_data_class[DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value]
            },
            vector={
                DENSE_VECTOR_NAME: wd_data_class[DataClassFields.DENSE_VECTOR.value],
                SPARSE_VECTOR_NAME: wd_data_class[DataClassFields.SPARSE_VECTOR.value]
            }
        )

def __qdrant_batch_gen(classes_json_file):
    batch = []
    for point in __qdrant_points_gen(classes_json_file):
        batch.append(point)
        if len(batch) % BATCH_SIZE == 0:
            yield batch
            batch = []
    yield batch
    
def __upload_classes_data(classes_json_file):
    for batch in __qdrant_batch_gen(classes_json_file):
        if len(batch) != 0:
            res = qc.upsert(
                collection_name=CLASSES_COLLECTION_NAME,
                points=batch,
                
            )
            
def __load_classes(classes_json_file_path: Path):
    with open(classes_json_file_path, "rb") as classes_json_file:
        __recreate_collection(CLASSES_COLLECTION_NAME)
        __create_classes_payload_index()
        __upload_classes_data(classes_json_file)
        __set_default_collection_index_threshold(CLASSES_COLLECTION_NAME)
        collection_info(CLASSES_COLLECTION_NAME)
    
@timed(logger)
def load_to_qdrant(classes_json_file_path: Path, properties_json_file_path: Path):
    __load_classes(classes_json_file_path)
    