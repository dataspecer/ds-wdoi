import wikidata.json_extractors.wd_fields as wd_json_fields_ex
from wikidata.model.properties import Properties
from wikidata.model.properties import UnderlyingTypes
from wikidata.model.entity_json_fields import RootFields

NO_VALUE = "Q0"

def __get_unique_values(arr):
    return list(set(arr))

def __filter_non_deprecated_rank(statement):
    if "rank" in statement:
        if "deprecated" == statement['rank']:
            return False
    return True
    
def __exclude_deprecated_statements(statements):
    return list(filter(__filter_non_deprecated_rank, statements))

def __get_typed_extractor(property_id: Properties | str, underlyingType: UnderlyingTypes):
    if underlyingType == UnderlyingTypes.ENTITY:
        return _entityids_value_extractor
    elif underlyingType == UnderlyingTypes.STRING:
        return _string_value_extractor
    else:
        raise ValueError(f"Missing value extractor for property {property_id}")

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

def _stmt_value_extractor(typed_extractor, statement, is_qualifier: bool = False, include_no_value: bool = False):
    if is_qualifier:
        return typed_extractor(statement)
    elif "mainsnak" in statement:
        return typed_extractor(statement["mainsnak"])
    else:
        return None

def _extract_wd_statements_from_field(wd_json, field: str, property_id: Properties | str):
    statements_json = wd_json_fields_ex.extract_from_wd_json(wd_json, field)
    if statements_json != None:
        if property_id in statements_json:
            return __exclude_deprecated_statements(statements_json[property_id])
    return []

def _extract_wd_statements_values(statements, typed_extractor, is_qualifier: bool = False, include_no_value: bool = False):
    values = []
    for stmt in statements:
        stmt_value = _stmt_value_extractor(typed_extractor, stmt, is_qualifier, include_no_value)
        if stmt_value != None:
            values.append(stmt_value)
    return __get_unique_values(values)

"""
    Function either expects array of statements or entity which the statements are extracted from provided field (Claims as a default).
    The is_qualifier denoted whether the statements are/were extracted from withing statements.
    That means that those statements do not include main snak but only datavalue directly.
    The include_no_value serves as a helper when a property can have novalue as a value.
    In that case, the novalue is returned as a non existent identifier Q0.
"""
def extract_wd_statement_values(wd_json, property: Properties, *, field: str | None = RootFields.CLAIMS, is_qualifier: bool = False, include_no_value: bool = False):
    return __extract_wd_statement_values_dynamic_prop(wd_json, property, property.underlyingType, field=field, is_qualifier=is_qualifier, include_no_value=include_no_value)
    # statements = wd_json
    # if field != None:
    #     statements = _extract_wd_statements_from_field(wd_json, field, property)
    # typed_extractor = __get_typed_extractor(property, property.underlyingType)
    # return _extract_wd_statements_values(statements, typed_extractor, is_qualifier, include_no_value)

def __extract_wd_statement_values_dynamic_prop(wd_json, str_property_id: str, underlyingType: UnderlyingTypes, *, field: str | None = RootFields.CLAIMS, is_qualifier: bool = False, include_no_value: bool = False):
    statements = wd_json
    if field != None:
        statements = _extract_wd_statements_from_field(wd_json, field, str_property_id)
    typed_extractor = __get_typed_extractor(str_property_id, underlyingType)
    return _extract_wd_statements_values(statements, typed_extractor, is_qualifier, include_no_value)

def contains_wd_subclass_of_statement(wd_entity_json) -> bool:
    claims = wd_json_fields_ex.extract_wd_claims(wd_entity_json)
    if claims != None and Properties.SUBCLASS_OF in claims:
        return True
    else:
        return False
    