from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
from phases.experimental_search_engine_loading.elastic.input_generation.source_generation.common_source_generation import add_language_value_from_field

def __generate_property_source(wd_data_property):
    source = {}
    add_language_value_from_field(source, wd_data_property, DataPropertyFields.LABELS.value, "")
    add_language_value_from_field(source, wd_data_property, DataPropertyFields.DESCRIPTIONS.value, "")
    add_language_value_from_field(source, wd_data_property, DataPropertyFields.ALIASES.value, [])
    return source
    
def generate_property_elastic_input(wd_data_property, elastic_index_name):
    property_input =  {
        "_op_type": "index",
        "_index": elastic_index_name,
        "_id": wd_data_property[DataPropertyFields.ID.value],
        "_source": __generate_property_source(wd_data_property)
    }
    return property_input