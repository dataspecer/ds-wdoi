import wikidata.json_extractors.wd_fields as wd_fields
from wikidata.model.properties import Properties

def __statement_entityids_value_extractor(statement):
    if "mainsnak" in statement:
        mainsnak = statement["mainsnak"]
        if "datavalue" in mainsnak:
            datavalue = mainsnak["datavalue"]
            if "value" in datavalue:
                value = datavalue["value"]
                if "id" in value:
                    return value["id"]
    return None

def __statement_string_value_extractor(statement):
    if "mainsnak" in statement:
        mainsnak = statement["mainsnak"]
        if "datavalue" in mainsnak:
            datavalue = mainsnak["datavalue"]
            if "value" in datavalue:
                return datavalue["value"]
    return None        

def __statements_extractor_from_field(wd_object_json, field: str, property: str):
    statements_json = wd_fields.extract_from_wd_json(wd_object_json, field)
    if statements_json != None:
        if property in statements_json:
            return statements_json[property]
    return []

def __extract_wd_statements_values(statements, value_extraction_func):
    values = []
    for stmt in statements:
        stmt_value = value_extraction_func(stmt)
        if stmt_value != None:
            values.append(stmt_value)
    return values

def __extract_wd_statement_values_for_property(wd_entity_json, field: str, property: str, value_extractor_func):
    statements = __statements_extractor_from_field(wd_entity_json, field, property)
    return __extract_wd_statements_values(statements, value_extractor_func)

def extract_wd_instance_of_values(wd_entity_json):
    return __extract_wd_statement_values_for_property(wd_entity_json, field="claims", property=Properties.INSTANCE_OF, value_extractor_func=__statement_entityids_value_extractor)

def extract_wd_subclass_of_values(wd_entity_json):
    return __extract_wd_statement_values_for_property(wd_entity_json, field="claims", property=Properties.SUBCLASS_OF, value_extractor_func=__statement_entityids_value_extractor)

def extract_wd_properties_for_this_type(wd_entity_json):
    return __extract_wd_statement_values_for_property(wd_entity_json, field="claims", property=Properties.PROPERTIES_FOR_THIS_TYPE, value_extractor_func=__statement_entityids_value_extractor)
    
def extract_wd_equivalent_class(wd_entity_json):
    return __extract_wd_statement_values_for_property(wd_entity_json, field="claims", property=Properties.EQUIVALENT_CLASS, value_extractor_func=__statement_string_value_extractor)
 
def extract_wd_subproperty_of_values(wd_entity_json):
    return __extract_wd_statement_values_for_property(wd_entity_json, field="claims", property=Properties.SUBPROPERTY_OF, value_extractor_func=__statement_entityids_value_extractor)
 
def extract_wd_related_property(wd_entity_json):
    return __extract_wd_statement_values_for_property(wd_entity_json, field="claims", property=Properties.RELATED_PROPERTY, value_extractor_func=__statement_entityids_value_extractor)

def extract_wd_equivalent_property(wd_entity_json):
    return __extract_wd_statement_values_for_property(wd_entity_json, field="claims", property=Properties.EQUIVALENT_PROPERTY, value_extractor_func=__statement_string_value_extractor)
 
def contains_wd_subclass_of_statement(wd_entity_json) -> bool:
    claims = wd_fields.extract_wd_claims(wd_entity_json)
    if claims != None and Properties.SUBCLASS_OF in claims:
        return True
    else:
        return False
    