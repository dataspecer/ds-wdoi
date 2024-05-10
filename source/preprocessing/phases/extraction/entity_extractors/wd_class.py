import core.json_extractors.wd_fields as wd_json_fields_ex
import core.json_extractors.wd_statements as wd_json_stmts_ex
import phases.extraction.entity_extractors.wd_fields as wd_fields_tran
import phases.extraction.entity_extractors.wd_languages as wd_languages_tran 
from core.model_simplified.iri import construct_wd_iri
from core.model_wikidata.properties import Properties
from core.model_simplified.classes import ClassFields

def __str_to_num_ids(str_ids_arr):
    return wd_fields_tran.transform_wd_str_ids_to_num_ids(str_ids_arr)

def extract_wd_class(str_class_id, wd_class, languages):
    num_id = wd_json_fields_ex.extract_wd_numeric_id_part(str_class_id)
    
    # Descriptions
    aliases = wd_languages_tran.extract_wd_language_array_map(wd_json_fields_ex.extract_wd_aliases(wd_class), languages)
    labels = wd_languages_tran.extract_wd_language_map(wd_json_fields_ex.extract_wd_labels(wd_class), languages)
    descriptions = wd_languages_tran.extract_wd_language_map(wd_json_fields_ex.extract_wd_descriptions(wd_class), languages)
    
    # Statements
    instance_of_str_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.INSTANCE_OF)
    subclass_of_str_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.SUBCLASS_OF)
    properties_for_this_type_str_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.PROPERTIES_FOR_THIS_TYPE)
    equivalent_class_urls = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.EQUIVALENT_CLASS)
    
    # Description extensions for loading phase
    has_cause_str_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.HAS_CAUSE)
    has_effect_str_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.HAS_EFFECT)
    has_characteristics_str_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.HAS_CHARACTERISTICS)
    has_parts_str_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.HAS_PARTS)
    part_of_str_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_class, Properties.PART_OF)
    
    return {
        ClassFields.ID.value: num_id,
        ClassFields.IRI.value: construct_wd_iri(str_class_id),
        ClassFields.ALIASES.value: aliases,
        ClassFields.LABELS.value: labels,
        ClassFields.DESCRIPTIONS.value: descriptions,
        ClassFields.INSTANCE_OF.value: __str_to_num_ids(instance_of_str_ids),
        ClassFields.SUBCLASS_OF.value: __str_to_num_ids(subclass_of_str_ids),
        ClassFields.PROPERTIES_FOR_THIS_TYPE.value: __str_to_num_ids(properties_for_this_type_str_ids),
        ClassFields.EQUIVALENT_CLASS.value: equivalent_class_urls,
        ClassFields.HAS_CAUSE.value: __str_to_num_ids(has_cause_str_ids),
        ClassFields.HAS_EFFECT.value: __str_to_num_ids(has_effect_str_ids),
        ClassFields.HAS_CHARACTERISTICS.value: __str_to_num_ids(has_characteristics_str_ids),
        ClassFields.HAS_PARTS.value: __str_to_num_ids(has_parts_str_ids),
        ClassFields.PART_OF.value: __str_to_num_ids(part_of_str_ids),
    }