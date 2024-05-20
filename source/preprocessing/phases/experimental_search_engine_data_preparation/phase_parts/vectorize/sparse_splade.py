from phases.experimental_search_engine_data_preparation.main_logger import main_logger
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from transformers import AutoModelForMaskedLM, AutoTokenizer
import torch
import core.utils.logging as ul
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

logger = main_logger.getChild("dense")

ACCESS_TOKEN = os.getenv('HUGGIN_FACE_TOKEN')

def __compute_vector(text: str, tokenizer, model):
    """
    Computes a vector from logits and attention mask using ReLU, log, and max operations.
    """
    tokens = tokenizer(text, truncation=True, return_tensors="pt")
    output = model(**tokens)
    logits, attention_mask = output.logits, tokens.attention_mask
    relu_log = torch.log(1 + torch.relu(logits))
    weighted_log = relu_log * attention_mask.unsqueeze(-1)
    max_val, _ = torch.max(weighted_log, dim=1)
    vector = max_val.squeeze()

    return vector, tokens

@timed(logger)
def vectorize_sparse(entities_dict: dict, lex_field: str, sparse_vector_field: str):
    model_id = "naver/splade-v3"
    tokenizer = AutoTokenizer.from_pretrained(model_id, token=ACCESS_TOKEN)
    model = AutoModelForMaskedLM.from_pretrained(model_id, token=ACCESS_TOKEN)
    
    for i, wd_data_entity in enumerate(entities_dict.values()):
        text = wd_data_entity[lex_field]
        
        vector, tokens = __compute_vector(text, tokenizer, model)
        
        indices = vector.nonzero().numpy().flatten()
        values = vector.detach().numpy()[indices]
        
        wd_data_entity[sparse_vector_field] = {
            "indices": indices,
            "values": values
        }
        ul.try_log_progress(logger, i, ul.TEN_K_PROGRESS_STEP)
            
        

    
    
    