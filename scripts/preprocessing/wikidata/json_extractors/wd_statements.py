import wikidata.json_extractors.wd_fields as wd_fields
from wikidata.model.properties import Properties
from wikidata.model.entity_json_fields import RootFields

NO_VALUE = "Q0"

def __get_unique_values(arr):
    return list(set(arr))

def _entityids_value_extractor(snak, include_no_value: bool = False):
    if include_no_value and "novalue" == snak['snaktype']:
        return NO_VALUE
    
    if "datavalue" in snak:
            datavalue = snak["datavalue"]
            if "value" in datavalue:
                value = datavalue["value"]
                if "id" in value:
                    return value["id"]
    return None

def _string_value_extractor(snak, include_no_value: bool = False):
    if include_no_value and "novalue" == snak['snaktype']:
        return NO_VALUE
    
    if "datavalue" in snak:
            datavalue = snak["datavalue"]
            if "value" in datavalue:
                return datavalue["value"]
    return None

def _statement_value_extractor(typed_extractor, statement, is_qualifier: bool = False, include_no_value: bool = False):
    if is_qualifier:
        return typed_extractor(statement)
    elif "mainsnak" in statement:
        return typed_extractor(statement["mainsnak"])
    else:
        return None

def _extract_wd_statements_from_field(wd_entity_json, field: str, property: str):
    statements_json = wd_fields.extract_from_wd_json(wd_entity_json, field)
    if statements_json != None:
        if property in statements_json:
            return statements_json[property]
    return []

def _extract_wd_statements_values(statements, typed_extractor, is_qualifier: bool = False, include_no_value: bool = False):
    values = []
    for stmt in statements:
        stmt_value = _statement_value_extractor(typed_extractor, stmt, is_qualifier, include_no_value)
        if stmt_value != None:
            values.append(stmt_value)
    return __get_unique_values(values)

def _extract_wd_statement_values_for_property(wd_entity_json, field: str, property: Properties, typed_extractor, is_qualifier: bool = False, include_no_value: bool = False):
    statements = _extract_wd_statements_from_field(wd_entity_json, field, property)
    return _extract_wd_statements_values(statements, typed_extractor, is_qualifier, include_no_value)

def extract_wd_instance_of_values(wd_entity_json):
    return _extract_wd_statement_values_for_property(wd_entity_json, field=RootFields.CLAIMS, property=Properties.INSTANCE_OF, typed_extractor=_entityids_value_extractor)

def extract_wd_subclass_of_values(wd_entity_json):
    return _extract_wd_statement_values_for_property(wd_entity_json, field=RootFields.CLAIMS, property=Properties.SUBCLASS_OF, typed_extractor=_entityids_value_extractor)

def extract_wd_properties_for_this_type_values(wd_entity_json):
    return _extract_wd_statement_values_for_property(wd_entity_json, field=RootFields.CLAIMS, property=Properties.PROPERTIES_FOR_THIS_TYPE, typed_extractor=_entityids_value_extractor)
    
def extract_wd_equivalent_class_values(wd_entity_json):
    return _extract_wd_statement_values_for_property(wd_entity_json, field=RootFields.CLAIMS, property=Properties.EQUIVALENT_CLASS, typed_extractor=_string_value_extractor)
 
def extract_wd_subproperty_of_values(wd_entity_json):
    return _extract_wd_statement_values_for_property(wd_entity_json, field=RootFields.CLAIMS, property=Properties.SUBPROPERTY_OF, typed_extractor=_entityids_value_extractor)
 
def extract_wd_related_property_values(wd_entity_json):
    return _extract_wd_statement_values_for_property(wd_entity_json, field=RootFields.CLAIMS, property=Properties.RELATED_PROPERTY, typed_extractor=_entityids_value_extractor)

def extract_wd_equivalent_property_values(wd_entity_json):
    return _extract_wd_statement_values_for_property(wd_entity_json, field=RootFields.CLAIMS, property=Properties.EQUIVALENT_PROPERTY, typed_extractor=_string_value_extractor)
 
def contains_wd_subclass_of_statement(wd_entity_json) -> bool:
    claims = wd_fields.extract_wd_claims(wd_entity_json)
    if claims != None and Properties.SUBCLASS_OF in claims:
        return True
    else:
        return False
    