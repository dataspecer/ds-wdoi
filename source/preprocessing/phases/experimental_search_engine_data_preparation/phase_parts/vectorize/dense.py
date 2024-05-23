from phases.experimental_search_engine_data_preparation.main_logger import main_logger
from core.utils.timer import timed
from sentence_transformers import SentenceTransformer
import core.utils.logging as ul

logger = main_logger.getChild("dense")

MODEL_NAME = "mixedbread-ai/mxbai-embed-large-v1"
MODEL_DIMENSIONS = 1024

@timed(logger)
def vectorize_dense(entities_dict: dict, lex_field: str, dense_vector_field: str):
    model = SentenceTransformer(MODEL_NAME)
    for i, wd_data_entity in enumerate(entities_dict.values()):
        text = wd_data_entity[lex_field]
        vector = model.encode(text, show_progress_bar=False)
        wd_data_entity[dense_vector_field] = vector
        ul.try_log_progress(logger, i, ul.TEN_K_PROGRESS_STEP)