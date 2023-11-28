import os
import requests
import json
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
REC_URL = os.getenv('REC_URL')
LOCAL_PROPS = ['P31']

"""
This expects the property field contains property id as integer.
"""
def create_map_from_recs(recs) -> dict:
    recs_map = dict()
    for rec_hit in recs:
        prop_num_id = rec_hit["property"]
        recs_map[prop_num_id] = rec_hit["probability"] 
    return recs_map

def new_empty_hit(prop_id: int):
    return {
        "property": prop_id,
        "probability": 0,
    }
    
def __transform_to_num_ids(recs):
    for rec_hit in recs:
        rec_hit["property"] = int(rec_hit["property"][1:])
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
    return __transform_to_num_ids(results['recommendations'])

"""
Gets local recommendations for a given class(empty input lists).
Returns array of objects { property: "str", probability: real_num }.
Note that the array is already sorted in descending order.
"""
def get_local_recs(cls_num_id: int):
    requestData = { 'properties': LOCAL_PROPS, 'types': ["Q" + str(cls_num_id)] }
    response = requests.get(REC_URL, data=json.dumps(requestData))
    results = response.json()
    return __transform_to_num_ids(results['recommendations'])
    