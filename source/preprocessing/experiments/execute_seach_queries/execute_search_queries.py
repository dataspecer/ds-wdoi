import json
import time
import requests
import os
import copy
from pathlib import Path
import core.utils.logging as ul
from core.utils.timer import timed
from experiments.main_logger import main_logger
from dotenv import load_dotenv, find_dotenv
from experiments.execute_seach_queries.config_generators import configs_without_reranking, configs_with_boost_reranking, configs_with_cross_encoder_final_selection

load_dotenv(find_dotenv())

logger = main_logger.getChild("queries_execution")

OUTPUT_FILE_PATH_PREFIX = "experiment_queries_execution_"
SEARCH_CLASSES_ENDPOINT_URL = os.getenv("SEARCH_SERVICE_CLASS_SEARCH")

@timed(logger)
def __load_queries_from_json(queries_json_file_path: Path):
    queries = []
    with open(queries_json_file_path, "r") as input_file:
        queries = json.load(input_file)
    return queries

def __store_query_results(output_file, method_id, query, reciprocal_rank, execution_time):
    json.dump({
            "method_id": method_id,
            "user_id": query["user_id"],
            "class_id": query["class_id"],
            "query_id": query["query_id"],
            "class_category": query["class_category"],
            "rr": reciprocal_rank,
            "time": execution_time
            }, output_file)
    output_file.write(",\n")


def __result_reciprocal_rank(query_response, class_id):
    results: list = query_response["results"]
    for idx, result_class_id in enumerate(results):
        if class_id == result_class_id:
            return 1 / (idx + 1) # + 1 because the enumerate starts from 0
    return 0

def __query_payload(query, config):
    config_copy = copy.copy(config)
    config_copy["query"] = { "text": query["query"], "properties": []}
    return config_copy

def __execute_query(query, config):
    start_time = time.perf_counter()
    query_response = requests.post(SEARCH_CLASSES_ENDPOINT_URL, json=__query_payload(query, config)).json()
    end_time = time.perf_counter()
    
    reciprocal_rank = __result_reciprocal_rank(query_response, query["class_id"])
    execution_time = end_time - start_time
    
    return reciprocal_rank, execution_time

@timed(logger)
def __execute_queries(queries, output_file, config_generator):
    for config_id, config in config_generator():
        logger.info(f"Starting {config_id}")
        for idx, query in enumerate(queries):
            reciprocal_rank, execution_time = __execute_query(query, config)
            __store_query_results(output_file, config_id, query, reciprocal_rank, execution_time)    
            ul.try_log_progress(logger, idx, ul.HUNDRED_PROGRESS_STEP)

@timed(logger)
def __main_execution(queries_json_file_path: Path, output_json_file_path: Path, config_generator):
    queries = __load_queries_from_json(queries_json_file_path)
    with open(output_json_file_path, "w") as output_file:
        output_file.write("[\n")
        __execute_queries(queries, output_file, config_generator)
        output_file.write("]")
        
@timed(logger)
def main_methods_without_reranking(queries_json_file_path: Path):
    __main_execution(queries_json_file_path, OUTPUT_FILE_PATH_PREFIX + "no_rerank.json", configs_without_reranking)
    
@timed(logger)
def main_methods_with_boost_reranker(queries_json_file_path: Path):
    __main_execution(queries_json_file_path, OUTPUT_FILE_PATH_PREFIX + "boost_rerank.json", configs_with_boost_reranking)
    
@timed(logger)
def main_final_methods_with_cross_encoder(queries_json_file_path: Path):
    __main_execution(queries_json_file_path, OUTPUT_FILE_PATH_PREFIX + "final_methods.json", configs_with_cross_encoder_final_selection)