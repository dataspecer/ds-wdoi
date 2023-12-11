import os
import requests
import json
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
REC_URL = os.getenv('REC_URL')
LOCAL_PROPS = ['P31']

"""
The function fills all missing properties from the global recommendations, since does not include properties that were not used.
In such case, the probability is zero.
"""
def fill_missing_global_recs_props(global_recs: list, global_recs_map: dict, properties: dict) -> dict:
    for key in properties.keys():
        if key not in global_recs_map:
            global_recs_map[key] = 0
            global_recs.append(__new_empty_hit(key))

"""
It flattens the map to the same structure as returned from recommender api.
The results are also sorted based on the probabilities.
Properties which are missing from the list have value of zero.
The list is sorted in descending order.
"""
def flatten_global_recs_map(recs_map: dict, properties: dict) -> list:
    flattened_recs = []
    for key in properties.keys():
        if key not in recs_map:
            flattened_recs.append(__new_empty_hit(key))
        else:
            flattened_recs.append(__new_hit(key, recs_map[key]))
    flattened_recs.sort(reverse=True, key=lambda hit: hit["probability"])
    return flattened_recs

"""
This expects the property field contains property id as integer.
"""
def create_map_from_recs(recs: list) -> dict:
    recs_map = dict()
    for rec_hit in recs:
        prop_num_id = rec_hit["property"]
        recs_map[prop_num_id] = rec_hit["probability"] 
    return recs_map

def __new_empty_hit(prop_id: int):
    return {
        "property": prop_id,
        "probability": float(0),
    }
    
def __new_hit(prop_id: int, probability):
    return {
        "property": prop_id,
        "probability": float(probability),
    }

def __transform(recs):
    for rec_hit in recs:
        rec_hit["property"] = int(rec_hit["property"][1:])
        rec_hit["probability"] = float(rec_hit["probability"])
    return recs
    
"""
Gets global recommendations (empty input lists).
Returns array of objects { property: "str", probability: real_num }
Note that the array is already sorted in descending order.
"""
def get_global_recs():
    requestData = { 'properties': [], 'types': [] }
    response = requests.get(REC_URL, data=json.dumps(requestData))
    results = response.json()
    return __transform(results['recommendations'])

"""
Gets local recommendations for a given class(empty input lists).
Returns array of objects { property: "str", probability: real_num }.
Note that the array is already sorted in descending order.
"""
def get_local_recs(cls_num_id: int):
    requestData = { 'properties': LOCAL_PROPS, 'types': ["Q" + str(cls_num_id)] }
    response = requests.get(REC_URL, data=json.dumps(requestData))
    results = response.json()
    return __transform(results['recommendations'])
    