from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import orjson
import torch
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

torch.set_num_threads(int(os.getenv("NUM_THREADS")))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmbeddingModel:
    def __init__(self):
        self.model = SentenceTransformer("mixedbread-ai/mxbai-embed-large-v1")
        self.prompt = 'Represent this sentence for searching relevant passages: '
    
    def embed(self, sentence):
        return self.model.encode(self.prompt + sentence, show_progress_bar=False)

embedding_model = EmbeddingModel()

class QueryBody(BaseModel):
    sentence: str

class EmbeddingORJSONResponse(Response):
    media_type = "application/json"
    def render(self, content) -> bytes:
        return orjson.dumps(content, option=orjson.OPT_SERIALIZE_NUMPY)

@app.post("/embed", response_class=EmbeddingORJSONResponse)
async def embed(body: QueryBody):
    embedding = embedding_model.embed(body.sentence) 
    return EmbeddingORJSONResponse(
        {
            "results": embedding 
        }
    )