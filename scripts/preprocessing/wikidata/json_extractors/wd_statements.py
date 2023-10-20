import wikidata.json_extractors.wd_fields as wd_fields
from wikidata.model.properties import Properties

def contains_wd_subclass_of_statement(wd_entity_json) -> bool:
    claims = wd_fields.extract_wd_claims(wd_entity_json)
    if claims != None and Properties.SUBCLASS_OF in claims:
        return True
    else:
        return False

def __extract_wd_statement_value_entityids(statement):
    if "mainsnak" in statement:
        mainsnak = statement["mainsnak"]
        if "datavalue" in mainsnak:
            datavalue = mainsnak["datavalue"]
            if "value" in datavalue:
                value = datavalue["value"]
                if "id" in value:
                    return value["id"]
    return None        

def __extract_wd_statement_values(wd_entity_json, property: str):
    claims = wd_fields.extract_wd_claims(wd_entity_json)
    if claims != None:
        if property in claims:
            ids = []
            for statement in claims[property]:
                val = __extract_wd_statement_value_entityids(statement)
                if val != None:
                    ids.append(val)
            return ids
    return []

def extract_wd_instance_of_values(wd_entity_json):
    return __extract_wd_statement_values(wd_entity_json, Properties.INSTANCE_OF)
        
def extract_wd_subclass_of_values(wd_entity_json):
    return __extract_wd_statement_values(wd_entity_json, Properties.SUBCLASS_OF)
 