from wikidata.model.properties import Properties
from wikidata.model.properties import Datatypes
from wikidata.model.entity_json_fields import RootFields
from wikidata.model.properties import is_allowed_property_datatype
import wikidata.json_extractors.wd_fields as wd_json_fields_ex
import wikidata.json_extractors.wd_statements as wd_json_stmts_ex
import wikidata.model.entity_types as wd_entity_types

"""
The class serves as a statistics computation on property usage.
It is used in the first and second phase of the identification and separation phase.
It first needs to construct a map for all entities and mark the instance of values - this is done in the identification phase.
In the second phase, it marks all the property usage to classes and properties identified in the first phase.
"""
class PropertyUsageStatistics:
    
    def __init__(self, logger) -> None:
        self.logger = logger.getChild("property-usage-statistics")
        self.classes_ids_set = set()
        self.properties_ids_to_datatype_dict = dict()
        self.entity_to_instance_of_dict = dict()
        self.class_property_usage_dict = dict()
        self.is_first_pass_finished = False
        
    
    def _create_new_class_property_usage_records(self):
        for class_id in self.classes_ids_set:
            self.class_property_usage_dict[class_id] = {
                "counter": 0,
                "properties": dict()
            }
    
    def _create_new_range_usage_record(self, count_init: int):
        return {
            "range": dict(),
            "counter": count_init
        }
    
    def first_pass_finished(self, classes_ids_set: set, properties_ids_to_datatype_dict: dict) -> None:
        self.classes_ids_set = classes_ids_set
        self.properties_ids_to_datatype_dict = properties_ids_to_datatype_dict
        self.is_first_pass_finished = True
        self._create_new_class_property_usage_records()
    
    def _store_entity_instance_of_values(self, wd_entity, str_entity_id):
        instance_of_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_entity, Properties.INSTANCE_OF)
        self.entity_to_instance_of_dict[str_entity_id] = instance_of_ids

    def _is_instance_with_statements(self, str_entity_id, claims):
        if len(self.entity_to_instance_of_dict[str_entity_id]) != 0 and claims != None:
            return True
        else:
            return False

    def _assign_literal_property_usage_to_classes(self, class_ids, property_id, count):
        for class_id in class_ids:
            property_usage_record = self.class_property_usage_dict[class_id]
            property_usage_record["counter"] += count
            if property_id not in property_usage_record['properties']:
                property_usage_record['properties'][property_id] = self._create_new_range_usage_record(count)
            else:
                property_usage_record['properties'][property_id]["counter"] += count 
    

    def _process_item_property(self, wd_entity, str_entity_id, property_id):
        pass


    def _process_literal_property(self, wd_entity, str_entity_id, property_id):
        property_statements_count = len(wd_json_stmts_ex._extract_wd_statements_from_field(wd_entity, RootFields.CLAIMS, property_id))
        self._assign_literal_property_usage_to_classes(self.entity_to_instance_of_dict[str_entity_id], property_id, property_statements_count)

    def _process_property(self, wd_entity, str_entity_id, property_id):
        if property_id in self.properties_ids_to_datatype_dict:
            property_datatype = self.properties_ids_to_datatype_dict[property_id]
            if property_datatype == Datatypes.ITEM:
                self._process_item_property(wd_entity, str_entity_id, property_id)
            else:
                self._process_literal_property(wd_entity, str_entity_id, property_id)

    def _process_entity_statements(self, wd_entity, str_entity_id):
        claims = wd_json_fields_ex.extract_wd_claims(wd_entity) 
        if self._is_instance_with_statements(str_entity_id, claims):
            for property_id in claims.keys():
                self._process_property(wd_entity, str_entity_id, property_id)        
    
    def process_entity(self, wd_entity):
        str_entity_id = wd_json_fields_ex.extract_wd_id(wd_entity)
        if wd_entity_types.is_wd_entity_item(str_entity_id):
            if self.is_first_pass_finished:
                self._process_entity_statements(wd_entity, str_entity_id)
            else:
                self._store_entity_instance_of_values(wd_entity, str_entity_id)