import wikidata.json_extractors.wd_fields as wd_json_fields_ex
import wikidata.json_extractors.wd_statements as wd_json_stmts_ex
import wikidata.extraction.wd_fields as wd_fields_tran
import wikidata.extraction.wd_languages as wd_languages_tran 
from wikidata.iri import construct_wd_iri
from wikidata.model.properties import Properties

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
    
    return {
        "id": num_id,
        "iri": construct_wd_iri(str_class_id),
        "aliases": aliases,
        "labels": labels,
        "descriptions": descriptions,
        "instanceOf": __str_to_num_ids(instance_of_str_ids),
        "subclassOf": __str_to_num_ids(subclass_of_str_ids),
        "propertiesForThisType": __str_to_num_ids(properties_for_this_type_str_ids),
        "equivalentClass": equivalent_class_urls, 
    }