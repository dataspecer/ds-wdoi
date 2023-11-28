import os
import requests
import json
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
REC_URL = os.getenv('REC_URL')
LOCAL_PROPS = ['P31']

"""
Gets global recommendations (empty input lists).
Returns array of objects { property: "str", probability: real_num }
Note that the array is already sorted in descending order.
"""
def get_global_recs():
    requestData = { 'properties': [], 'types': [] }
    response = requests.get(REC_URL, data=json.dumps(requestData))
    results = response.json()
    return results['recommendations']

"""
Gets local recommendations for a given class(empty input lists).
Returns array of objects { property: "str", probability: real_num }.
Note that the array is already sorted in descending order.
"""
def get_local_recs(cls_id: str):
    requestData = { 'properties': LOCAL_PROPS, 'types': [cls_id] }
    response = requests.get(REC_URL, data=json.dumps(requestData))
    results = response.json()
    return results['recommendations']
    