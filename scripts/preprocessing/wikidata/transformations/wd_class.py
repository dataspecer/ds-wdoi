import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.json_extractors.wd_statements as wd_statements_ex
import wikidata.transformations.wd_fields as wd_fields_tran
import wikidata.transformations.wd_languages as wd_languages_tran 

def __num_ids(str_ids_arr):
    return wd_fields_tran.transform_wd_str_ids_to_num_ids(str_ids_arr)

def transform_wd_class(str_class_id, wd_class):
    num_id = wd_fields_ex.extract_wd_numeric_id_part(str_class_id)
    instance_of_num_ids = __num_ids(wd_statements_ex.extract_wd_instance_of_values(wd_class)) 
    subclass_of_num_ids = __num_ids(wd_statements_ex.extract_wd_subclass_of_values(wd_class))
    properties_for_this_type_num_ids = __num_ids(wd_statements_ex.extract_wd_properties_for_this_type_values(wd_class))
    equivalent_class_urls = wd_statements_ex.extract_wd_equivalent_class_values(wd_class)
    labels = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_labels(wd_class))
    descriptions = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_descriptions(wd_class))
    
    return {
        "id": num_id,
        "instanceOf": instance_of_num_ids,
        "subclassOf": subclass_of_num_ids,
        "propertiesForThisType": properties_for_this_type_num_ids,
        "equivalentClass": equivalent_class_urls, 
        "labels": labels,
        "descriptions": descriptions
    }