import wikidata.model.entity_types as wd_entity_types
from wikidata.model.properties import Properties

def __extract_from_wd_json(wd_entity_json, field: str):
    if field in wd_entity_json:
        return wd_entity_json[field]
    else:
        return None
    
def extract_wd_id(wd_entity_json):
    return __extract_from_wd_json(wd_entity_json, "id")

def extract_wd_numeric_id_part(str_wd_entity_id):
    return int(str_wd_entity_id[1:])

def extract_wd_claims(wd_entity_json):
    return __extract_from_wd_json(wd_entity_json, "claims")

def extract_wd_labels(wd_entity_json):
    return __extract_from_wd_json(wd_entity_json, "labels")

def extract_wd_descriptions(wd_entity_json):
    return __extract_from_wd_json(wd_entity_json, "descriptions")

def extract_wd_aliases(wd_entity_json):
    return __extract_from_wd_json(wd_entity_json, "aliases")

def extract_wd_entity_type(wd_entity_json) -> wd_entity_types.EntityTypes:
    id = extract_wd_id(wd_entity_json)
    if id != None:
        if wd_entity_types.is_item(id):
            return wd_entity_types.EntityTypes.ITEM
        if wd_entity_types.is_property(id):
            return wd_entity_types.EntityTypes.PROPERTY
    return wd_entity_types.EntityTypes.UNKNOWN

def contains_wd_subclass_of_statement(wd_entity_json) -> bool:
    claims = extract_wd_claims(wd_entity_json)
    if claims != None and Properties.SUBCLASS_OF in claims:
        return True
    else:
        return False

def __extract_lang_map(wd_language_object, selected_languages):
    lang_map = {}
    for lang in selected_languages:
        if lang in wd_language_object:
            lang_map[lang] = wd_language_object[lang]
    return lang_map

def extract_languages_from_wd_language_field(wd_entity_json, field: str, selected_languages):
    if field in wd_entity_json:
        return __extract_lang_map(wd_entity_json[field], selected_languages)
    else:
        return {}
    
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
    claims = extract_wd_claims(wd_entity_json)
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
 