from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers.cross_encoder import CrossEncoder
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

class RerankerModel:
    def __init__(self):
        self.model = CrossEncoder("mixedbread-ai/mxbai-rerank-base-v1")
    
    def score_sentences(self, query: str, sentences: list[str], ids: list[int]):
        query_sentence_pairs = [[query, sentence] for sentence in sentences]
        scores = self.model.predict(query_sentence_pairs, show_progress_bar=False)
        return [{ "id": ids[i], "score": score} for i, score in enumerate(scores)]

    def rerank_sentences(self, query: str, sentences: list[str], ids: list[int]):
        results = self.score_sentences(query, sentences, ids)
        results.sort(reverse=True, key=lambda x: x["score"])
        return results

reranker_model = RerankerModel()

class QueryBody(BaseModel):
    query: str
    sentences: list[str]
    ids: list[int]

class EmbeddingORJSONResponse(Response):
    media_type = "application/json"
    def render(self, content) -> bytes:
        return orjson.dumps(content, option=orjson.OPT_SERIALIZE_NUMPY)

@app.post("/rerank", response_class=EmbeddingORJSONResponse)
async def embed(body: QueryBody):
    results = reranker_model.rerank_sentences(body.query, body.sentences, body.ids) 
    return EmbeddingORJSONResponse(
        {
            "results": results 
        }
    )