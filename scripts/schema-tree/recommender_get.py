import requests
import os
import json

RECM_URL = 'http://localhost:8080/recommender'


def construct_wikidata_get_entity_from_id(id):
    return f'https://www.wikidata.org/w/api.php?action=wbgetentities&ids={id}&languages=en&props=labels&format=json'

requestData = { 'properties': [], 'types': []}

with open('props.txt') as f:
    for line in f.readlines():
        pId = line.strip()
        requestData['properties'].append(pId)

with open('types.txt') as f:
    for line in f.readlines():
        tId = line.strip()
        requestData['types'].append(tId)

response = requests.get(RECM_URL, data=json.dumps(requestData))
recommendations = response.json()

wikidataSession = requests.Session()
for rec in  recommendations['recommendations']:
    response = wikidataSession.get(construct_wikidata_get_entity_from_id(rec['property']))
    rec['label'] = ''
    try:
        label = response.json()['entities'][rec['property']]['labels']['en']['value']
        rec['label'] = label
        print(rec)
    except Exception as e:
        print(e)
    