import wikidata.model.entity_types as wd_entity_types

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