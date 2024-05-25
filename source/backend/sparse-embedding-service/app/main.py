from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import orjson
import os
import torch 
from transformers import AutoModelForMaskedLM, AutoTokenizer
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')

torch.set_num_threads(int(os.getenv('NUM_THREADS')))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SparseEmbeddingModel:
    def __init__(self):
        model_id = "naver/splade-v3"
        self.tokenizer = AutoTokenizer.from_pretrained(model_id, token=ACCESS_TOKEN)
        self.model = AutoModelForMaskedLM.from_pretrained(model_id, token=ACCESS_TOKEN)
    
    def embed_sparse(self, sentence: str):
        """
        Computes a vector from logits and attention mask using ReLU, log, and max operations.
        """
        tokens = self.tokenizer(sentence, truncation=True, return_tensors="pt")
        output = self.model(**tokens)
        logits, attention_mask = output.logits, tokens.attention_mask
        relu_log = torch.log(1 + torch.relu(logits))
        weighted_log = relu_log * attention_mask.unsqueeze(-1)
        max_val, _ = torch.max(weighted_log, dim=1)
        vector = max_val.squeeze()

        indices = vector.nonzero().numpy().flatten()
        values = vector.detach().numpy()[indices]

        return indices, values
    
embedding_model = SparseEmbeddingModel()

class QueryBody(BaseModel):
    sentence: str

class EmbeddingORJSONResponse(Response):
    media_type = "application/json"
    def render(self, content) -> bytes:
        return orjson.dumps(content, option=orjson.OPT_SERIALIZE_NUMPY)

@app.post("/embed", response_class=EmbeddingORJSONResponse)
async def embed(body: QueryBody):
    indices, values = embedding_model.embed_sparse(body.sentence) 
    return EmbeddingORJSONResponse(
        {
            "results": {
                "indices": indices,
                "values": values 
            }
        }
    )