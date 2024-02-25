from wikidata.model.properties import Properties
from wikidata.model.properties import Datatypes
from wikidata.model.properties import UnderlyingTypes
from wikidata.model.entity_json_fields import RootFields
import utils.decoding as decoding
import utils.logging as ul
import wikidata.json_extractors.wd_fields as wd_json_fields_ex
import wikidata.json_extractors.wd_statements as wd_json_stmts_ex
import wikidata.model.entity_types as wd_entity_types

CLASSES_STATS_OUTPUT_FILE = "classes-property-usage.json"
PROPERTIES_STATS_OUTPUT_FILE = "properties-domain-range-usage.json"

"""
The class serves as a statistics computation on property usage.
It is used in the first and second phase of the identification and separation phase.
It first needs to construct a map for all entities and mark the instance of values - this is done in the identification phase.
In the second phase, it marks all the property usage to classes and properties identified in the first phase.
"""
class PropertyUsageStatistics:
    
    def __init__(self, logger) -> None:
        self.logger = logger.getChild("property-usage-statistics")
        self.classes_ids_set = None
        self.properties_ids_to_datatype_dict = None
        self.entity_to_instance_of_dict = dict()
        self.class_property_usage_dict = dict()
        self.is_first_pass_finished = False
    
    def _create_new_class_property_usage_records(self):
        for class_id in self.classes_ids_set:
            self.class_property_usage_dict[class_id] = {
                "properties": dict(),
                "counter": 0
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
        if str_entity_id in self.entity_to_instance_of_dict and len(self.entity_to_instance_of_dict[str_entity_id]) != 0 and claims != None:
            return True
        else:
            return False

    def _assign_domain_usage(self, property_usage_record, property_id, count):
        property_usage_record["counter"] += count
        if property_id not in property_usage_record["properties"]:
            property_usage_record["properties"][property_id] = self._create_new_range_usage_record(count)
        else:
            property_usage_record["properties"][property_id]["counter"] += count
        
    def _assign_range_usage(self, range_prop_usage_record, object_class_id, count):
        if object_class_id not in range_prop_usage_record["range"]:
            range_prop_usage_record["range"][object_class_id] = count
        else:
            range_prop_usage_record["range"][object_class_id] += count

    def _assign_property_usage_to_classes(self, subject_classes_ids, property_id, *, count, object_class_id: str | None):
        for subject_class_id in subject_classes_ids:
            if subject_class_id in self.class_property_usage_dict:
                if object_class_id != None and object_class_id not in self.classes_ids_set:
                    return
                else:
                    property_usage_record = self.class_property_usage_dict[subject_class_id]
                    self._assign_domain_usage(property_usage_record, property_id, count)
                    if object_class_id != None:
                        self._assign_range_usage(property_usage_record["properties"][property_id], object_class_id, count)

    def _process_item_property(self, subject_wd_entity, subject_str_entity_id, property_id):
        property_statement_values = wd_json_stmts_ex._extract_wd_statement_values_dynamic_prop(subject_wd_entity, property_id, UnderlyingTypes.ENTITY)
        for object_str_entity_id in property_statement_values:
            if object_str_entity_id in self.entity_to_instance_of_dict and len(self.entity_to_instance_of_dict[object_str_entity_id]) != 0:
                for object_str_entity_class_id in self.entity_to_instance_of_dict[object_str_entity_id]:
                    self._assign_property_usage_to_classes(self.entity_to_instance_of_dict[subject_str_entity_id], property_id, count=1, object_class_id=object_str_entity_class_id)
        
    def _process_literal_property(self, subject_wd_entity, subject_str_entity_id, property_id):
        property_statements_count = len(wd_json_stmts_ex._extract_wd_statements_from_field(subject_wd_entity, RootFields.CLAIMS, property_id))
        self._assign_property_usage_to_classes(self.entity_to_instance_of_dict[subject_str_entity_id], property_id, count=property_statements_count, object_class_id=None)

    def _process_property(self, subject_wd_entity, subject_str_entity_id, property_id):
        if property_id in self.properties_ids_to_datatype_dict:
            property_datatype = self.properties_ids_to_datatype_dict[property_id]
            if property_datatype == Datatypes.ITEM:
                self._process_item_property(subject_wd_entity, subject_str_entity_id, property_id)
            else:
                self._process_literal_property(subject_wd_entity, subject_str_entity_id, property_id)

    def _process_entity_statements(self, subject_wd_entity, subject_str_entity_id):
        claims = wd_json_fields_ex.extract_wd_claims(subject_wd_entity) 
        if self._is_instance_with_statements(subject_str_entity_id, claims):
            for property_id in claims.keys():
                self._process_property(subject_wd_entity, subject_str_entity_id, property_id)        
    
    def process_entity(self, wd_entity):
        str_entity_id = wd_json_fields_ex.extract_wd_id(wd_entity)
        if wd_entity_types.is_wd_entity_item(str_entity_id):
            if self.is_first_pass_finished:
                self._process_entity_statements(wd_entity, str_entity_id)
            else:
                self._store_entity_instance_of_values(wd_entity, str_entity_id)
             
             
###################################  
                
    def _init_classes_statistics_dict(self):
        classes_statistics_dict = dict()
        for class_id in self.class_property_usage_dict.keys():
            classes_statistics_dict[class_id] = {
                "id": wd_json_fields_ex.extract_wd_numeric_id_part(class_id),
                "subjectOfStatsProbs": [],
                "valueOfStatsProbs": []
            }
        return classes_statistics_dict
                
    def _init_properties_statistics_dict(self):
        properties_statistics_dict = dict()
        for property_id in self.properties_ids_to_datatype_dict.keys():
            properties_statistics_dict[property_id] = {
                "id": wd_json_fields_ex.extract_wd_numeric_id_part(property_id),
                "subjectTypeStats": dict(),
                "valueTypeStats": dict()
            }
        return properties_statistics_dict
    
    def _compute_class_subject_of_statistics(self, class_property_usage_record):
        subjectOfStatsProbs = []
        total_count = class_property_usage_record["counter"]
        for property_id, range_record in class_property_usage_record["properties"].items():
            subjectOfStatsProbs.append({
                "property": wd_json_fields_ex.extract_wd_numeric_id_part(property_id),
                "probability": float(float(range_record["counter"]) / float(total_count))
            })    
        subjectOfStatsProbs.sort(reverse=True, key=lambda s: s["probability"])
        return subjectOfStatsProbs
    
    def _add_to_domain_of_property(self, prop_stats, class_id, count):
        if class_id not in prop_stats["subjectTypeStats"]:
            prop_stats["subjectTypeStats"][class_id] = count
        else:
            prop_stats["subjectTypeStats"][class_id] += count
    
    def _add_to_range_of_property(self, prop_stats, range_record):
        for object_class_id, count in range_record["range"].items():
            if object_class_id not in prop_stats["valueTypeStats"]:
                prop_stats["valueTypeStats"][object_class_id] = count
            else:
                prop_stats["valueTypeStats"][object_class_id] += count
    
    def _add_to_domain_and_range_of_property(self, properties_statistics_dict, class_id, class_property_usage_record):
        for property_id, range_record in class_property_usage_record["properties"].items():
            prop_stats = properties_statistics_dict[property_id]
            self._add_to_domain_of_property(prop_stats, class_id, range_record["counter"])
            self._add_to_range_of_property(prop_stats, range_record)
    
    def _add_to_classes_value_of(self, property_id, range_summary, classes_statistics_dict):
        for record in range_summary:
            class_id = record["class"]
            classes_statistics_dict[class_id]["valueOfStatsProbs"].append({
                "property": wd_json_fields_ex.extract_wd_numeric_id_part(property_id),
                "probability": record["probability"]
            })
    
    def _summarize_domain_range_dict(self, property_id, usage_dict: dict, *, add_to_value_of: bool = False, classes_statistics_dict = None):
        total_count = sum([value for value in usage_dict.values()])
        summary = []
        for class_id, count in usage_dict.items():
            summary.append({
                "class": class_id,
                "probability": float(float(count) / float(total_count))
            })
        summary.sort(reverse=True, key=lambda x: x["probability"])
        if add_to_value_of:
            self._add_to_classes_value_of(property_id, summary, classes_statistics_dict)
        return list(map(lambda s: wd_json_fields_ex.extract_wd_numeric_id_part(s["class"]), summary))
    
    def _summarize_domain_and_range(self, classes_statistics_dict: dict, properties_statistics_dict: dict):
        for property_id, stats_record in properties_statistics_dict.items():
            stats_record["subjectTypeStats"] = self._summarize_domain_range_dict(property_id, stats_record["subjectTypeStats"], add_to_value_of=False, classes_statistics_dict=None)
            stats_record["valueTypeStats"] = self._summarize_domain_range_dict(property_id, stats_record["valueTypeStats"], add_to_value_of=True, classes_statistics_dict=classes_statistics_dict)
    
    def _sort_value_of_in_classes(self, classes_statistics_dict: dict):
        def change_id_func(record):
            record["property"] = wd_json_fields_ex.extract_wd_numeric_id_part(record["property"])
            return record
        
        for record in classes_statistics_dict.values():
            record["valueOfStatsProbs"].sort(reverse=True, key=lambda x: x["probability"])
            record["valueOfStatsProbs"] = list(map(change_id_func, record["valueOfStatsProbs"]))
        
    def _compute_statistics(self, classes_statistics_dict, properties_statistics_dict):
        i = 1
        for class_id, property_usage_record in self.class_property_usage_dict.items():
            classes_statistics_dict[class_id]["subjectOfStatsProbs"] = self._compute_class_subject_of_statistics(property_usage_record)
            self._add_to_domain_and_range_of_property(properties_statistics_dict, class_id, property_usage_record)
            i += 1
            ul.try_log_progress(self.logger, i, ul.CLASSES_PROGRESS_STEP)
        self.logger.info("Summarizing domain and range")
        self._summarize_domain_and_range(classes_statistics_dict, properties_statistics_dict)
        self.logger.info("Sorting value of in classes")
        self._sort_value_of_in_classes(classes_statistics_dict)
        self._save_to_files(classes_statistics_dict, properties_statistics_dict)
    
    def _save_to_files(self, classes_statistics_dict, properties_statistics_dict):
        self.logger.info("Writing classes to a file.")
        decoding.write_mapped_entities_to_file(classes_statistics_dict, CLASSES_STATS_OUTPUT_FILE)
        self.logger.info("Writing properties to a file.")
        decoding.write_mapped_entities_to_file(properties_statistics_dict, PROPERTIES_STATS_OUTPUT_FILE)
    
    def finalize_statistics(self):
        classes_statistics_dict = self._init_classes_statistics_dict()
        properties_statistics_dict = self._init_properties_statistics_dict()
        self.logger.info("Finilizing statistics")
        self._compute_statistics(classes_statistics_dict, properties_statistics_dict)
        
    