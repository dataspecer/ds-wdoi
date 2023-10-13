import wikidata.model.entity_types as wd_entity_types

def extract_from_json(wd_entity_json, field: str):
    if field in wd_entity_json:
        return wd_entity_json[field]
    else:
        return None
    
def extract_id(wd_entity_json):
    return extract_from_json(wd_entity_json, "id")

def extract_claims(wd_entity_json):
    return extract_from_json(wd_entity_json, "claims")

def extract_entity_type(wd_entity_json) -> wd_entity_types.EntityTypes:
    id = extract_id(wd_entity_json)
    if id != None:
        if wd_entity_types.is_item(id):
            return wd_entity_types.EntityTypes.ITEM
        if wd_entity_types.is_property(id):
            return wd_entity_types.EntityTypes.PROPERTY
    return wd_entity_types.EntityTypes.UNKNOWN

def contains_subclass_of_statement(wd_entity_json):
    claims = extract_claims(wd_entity_json)
    if claims != None and "P279" in claims:
        return True
    else:
        return False

def extract_languages(wd_language_object, languages_array):
    languages = {}
    for lang in languages_array:
        if lang in wd_language_object:
            languages[lang] = wd_language_object[lang]
    return languages

def extract_selected_languages_from_field(wd_entity_json, field: str, languages_array):
    if field in wd_entity_json:
        return extract_languages(wd_entity_json[field], languages_array)
    else:
        return {}
    
def extract_entityid_from_statement(statement):
    if "mainsnak" in statement:
        mainsnak = statement["mainsnak"]
        if "datavalue" in mainsnak:
            datavalue = mainsnak["datavalue"]
            if "value" in datavalue:
                value = datavalue["value"]
                if "id" in value:
                    return value["id"]
    return None        

def extract_statement_values_entityids_from_entity(wd_entity_json, property: str):
    claims = extract_claims(wd_entity_json)
    if claims != None:
        if property in claims:
            ids = []
            for statement in claims[property]:
                val = extract_entityid_from_statement(statement)
                if val != None:
                    ids.append(val)
            return ids
    return []

def extract_instance_of_ids(wd_entity_json):
    return extract_statement_values_entityids_from_entity(wd_entity_json, "P31")
        
def extract_subclass_of_ids(wd_entity_json):
    return extract_statement_values_entityids_from_entity(wd_entity_json, "P279")
 