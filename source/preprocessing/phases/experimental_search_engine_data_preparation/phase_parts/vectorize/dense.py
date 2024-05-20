from phases.experimental_search_engine_data_preparation.main_logger import main_logger
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from sentence_transformers import SentenceTransformer
import core.utils.logging as ul

logger = main_logger.getChild("dense")

POOL_SIZE = 8
DIMENSIONS = 512

@timed(logger)
def vectorize_dense(entities_dict: dict, lex_field: str, dense_vector_field: str):
    model = SentenceTransformer("mixedbread-ai/mxbai-embed-large-v1", truncate_dim=DIMENSIONS)
    
    entities_list = [wd_data_entity for wd_data_entity in entities_dict.values()]
    texts_list = [wd_data_entity[lex_field] for wd_data_entity in entities_list]
    
    logger.info(f"Starting dense embeddings processing using {POOL_SIZE} cpus")
    
    pool = model.start_multi_process_pool(["cpu" for i in range(POOL_SIZE)])
    
    embeddings = model.encode_multi_process(texts_list, pool, batch_size=64)
    
    model.stop_multi_process_pool(pool)
    
    logger.info("Finished embeddings")
    for idx, embedding in enumerate(embeddings):
        entities_list[idx][dense_vector_field] = embedding
        ul.try_log_progress(logger, idx, ul.HUNDRED_K_PROGRESS_STEP)