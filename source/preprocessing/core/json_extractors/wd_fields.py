import core.model_wikidata.entity_types as wd_entity_types
from core.model_wikidata.entity_json_fields import RootFields

def extract_from_wd_json(wd_entity_json, field: str):
    if field in wd_entity_json:
        return wd_entity_json[field]
    else:
        return None
    
def extract_wd_id(wd_entity_json):
    return extract_from_wd_json(wd_entity_json, RootFields.ID)

def extract_wd_numeric_id_part(str_wd_entity_id):
    return int(str_wd_entity_id[1:])

def extract_wd_claims(wd_entity_json):
    return extract_from_wd_json(wd_entity_json, RootFields.CLAIMS)

def extract_wd_labels(wd_entity_json):
    return extract_from_wd_json(wd_entity_json, RootFields.LABELS)

def extract_wd_descriptions(wd_entity_json):
    return extract_from_wd_json(wd_entity_json, RootFields.DESCRIPTIONS)

def extract_wd_aliases(wd_entity_json):
    return extract_from_wd_json(wd_entity_json, RootFields.ALIASES)

def extract_wd_datatype(wd_entity_json):
    return extract_from_wd_json(wd_entity_json, RootFields.DATATYPE)

def extract_site_links(wd_entity_json):
    return extract_from_wd_json(wd_entity_json, RootFields.SITELINKS)