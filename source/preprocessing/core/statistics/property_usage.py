from core.model_wikidata.properties import Properties
from core.model_wikidata.properties import Datatypes
from core.model_wikidata.properties import UnderlyingTypes
from core.model_wikidata.entity_json_fields import RootFields
from core.model_simplified.scores import ScoresFields
import core.utils.decoding as decoding
import core.utils.logging as ul
import core.json_extractors.wd_fields as wd_json_fields_ex
import core.json_extractors.wd_statements as wd_json_stmts_ex
import core.model_wikidata.entity_types as wd_entity_types
from core.model_simplified.classes import ClassFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields
from core.model_simplified.properties import PropertyFields
from pathlib import Path

CLASSES_STATS_OUTPUT_FILE_PATH = Path(".") / "classes-property-usage.json"
PROPERTIES_STATS_OUTPUT_FILE_PATH = Path(".") / "properties-domain-range-usage.json"

"""
The class serves as a statistics computation on property usage.
It is used in the first and second phase of the identification and separation phase.
It first needs to construct a map for all entities and mark the instance of values - this is done in the identification phase.
That is done in order to access ranges of properties in constant time.
In the second phase, it marks all the property usage to classes and properties identified in the first phase.
"""
class PropertyUsageStatistics:
    
    def __init__(self, logger) -> None:
        self.logger = logger.getChild("property_usage_statistics")
        self.classes_ids_set = None
        # Contains allowed properties with their datatype.
        self.properties_ids_to_datatype_dict = None
        self.entity_to_instance_of_dict = dict()
        self.is_first_pass_finished = False
        self.class_property_usage_dict = dict()
    
    def _create_new_class_property_usage_records(self):
        for class_id in self.classes_ids_set:
            self.class_property_usage_dict[class_id] = {
                "instanceCount": 0,
                "statementCount": 0,
                "inlinksCount": 0,
                "subjectOf": self._create_new_property_usage_record(),
                "valueOf": self._create_new_property_usage_record()   
            } 
    def _create_new_property_usage_record(self):
        return {
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
        if len(instance_of_ids) != 0:
            self.entity_to_instance_of_dict[str_entity_id] = instance_of_ids
                    
    def _mark_instance_to_class(self, instance_of_ids):
        for str_class_id in instance_of_ids:
            if str_class_id in self.classes_ids_set:
                self.class_property_usage_dict[str_class_id]["instanceCount"] += 1

    def _is_instance_with_claims(self, str_entity_id, claims):
        if str_entity_id in self.entity_to_instance_of_dict and claims != None:
            return True
        else:
            return False

    def _assign_domain_usage(self, property_usage_record, property_id, count):
        property_usage_record["counter"] += count
        if property_id not in property_usage_record["properties"]:
            property_usage_record["properties"][property_id] = self._create_new_range_usage_record(count)
        else:
            property_usage_record["properties"][property_id]["counter"] += count
        
    def _assign_range_usage(self, range_record, object_class_id, count):
        if object_class_id not in range_record["range"]:
            range_record["range"][object_class_id] = count
        else:
            range_record["range"][object_class_id] += count

    def _assign_property_usage_to_classes(self, subject_classes_ids, property_id, *, statement_count, object_class_id: str | None):
        if (statement_count != 0):
            for subject_class_id in subject_classes_ids:
                if subject_class_id in self.class_property_usage_dict:
                    if object_class_id != None and object_class_id not in self.classes_ids_set:
                        return
                    subject_property_usage_record = self.class_property_usage_dict[subject_class_id]["subjectOf"]
                    self._assign_domain_usage(subject_property_usage_record, property_id, statement_count)
                    if object_class_id != None:
                        self._assign_range_usage(subject_property_usage_record["properties"][property_id], object_class_id, statement_count)
                        # Assign reverse property usage to the object class as value of 
                        object_property_usage_record = self.class_property_usage_dict[object_class_id]["valueOf"]
                        self._assign_domain_usage(object_property_usage_record, property_id, statement_count)
                        self._assign_range_usage(object_property_usage_record["properties"][property_id], subject_class_id, statement_count)

    def _process_item_property(self, subject_wd_entity, subject_str_entity_id, property_id):
        property_statement_values = wd_json_stmts_ex._extract_wd_statement_values_dynamic_prop(subject_wd_entity, property_id, UnderlyingTypes.ENTITY)
        for object_str_entity_id in property_statement_values:
            if object_str_entity_id in self.entity_to_instance_of_dict and object_str_entity_id != wd_json_stmts_ex.NO_VALUE:
                for object_str_entity_class_id in self.entity_to_instance_of_dict[object_str_entity_id]:
                    self._assign_property_usage_to_classes(self.entity_to_instance_of_dict[subject_str_entity_id], property_id, statement_count=1, object_class_id=object_str_entity_class_id)
        
    def _process_literal_property(self, subject_wd_entity, subject_str_entity_id, property_id):
        property_statements_count = len(wd_json_stmts_ex._extract_wd_statements_from_field(subject_wd_entity, RootFields.CLAIMS, property_id))
        self._assign_property_usage_to_classes(self.entity_to_instance_of_dict[subject_str_entity_id], property_id, statement_count=property_statements_count, object_class_id=None)

    def _process_property(self, subject_wd_entity, subject_str_entity_id, property_id):
        if property_id in self.properties_ids_to_datatype_dict:
            property_datatype = self.properties_ids_to_datatype_dict[property_id]
            if property_datatype == Datatypes.ITEM:
                self._process_item_property(subject_wd_entity, subject_str_entity_id, property_id)
            else:
                self._process_literal_property(subject_wd_entity, subject_str_entity_id, property_id)

    # Will count all in and out properties to classes from entities including the not allowed ones.
    def _count_in_out_properties_to_class(self, subject_wd_entity, subject_str_entity_id, claims):
        subject_is_class = True if subject_str_entity_id in self.classes_ids_set else False
        for property_id in claims.keys():
            # If the property is not allowed, assign it item datatype -> results might be invalid but it can hit into inwards properties.
            property_datatype = self.properties_ids_to_datatype_dict[property_id] if property_id in self.properties_ids_to_datatype_dict else Datatypes.ITEM
            # Count outward properties for a class
            if subject_is_class:
                self.class_property_usage_dict[subject_str_entity_id]["statementCount"] += len(wd_json_stmts_ex._extract_wd_statements_from_field(subject_wd_entity, RootFields.CLAIMS, property_id))
            # Mark inward direct links to classes.
            if property_datatype == Datatypes.ITEM:
                object_str_entity_ids = wd_json_stmts_ex._extract_wd_statement_values_dynamic_prop(subject_wd_entity, property_id, UnderlyingTypes.ENTITY)
                for object_str_entity_id in object_str_entity_ids:
                    if object_str_entity_id in self.classes_ids_set:
                        self.class_property_usage_dict[object_str_entity_id]["inlinksCount"] += 1
                
    def _process_entity_statements(self, subject_wd_entity, subject_str_entity_id):
        claims = wd_json_fields_ex.extract_wd_claims(subject_wd_entity) 
        self._count_in_out_properties_to_class(subject_wd_entity, subject_str_entity_id, claims)
        if self._is_instance_with_claims(subject_str_entity_id, claims):
            self._mark_instance_to_class(self.entity_to_instance_of_dict(subject_str_entity_id))
            for property_id in claims.keys():
                self._process_property(subject_wd_entity, subject_str_entity_id, property_id)        
    
    def process_entity(self, wd_entity):
        str_entity_id = wd_json_fields_ex.extract_wd_id(wd_entity)
        if wd_entity_types.is_wd_entity_item(str_entity_id):
            try:
                if self.is_first_pass_finished:
                    self._process_entity_statements(wd_entity, str_entity_id)
                else:
                    self._store_entity_instance_of_values(wd_entity, str_entity_id)
            except:
                self.logger.exception("There was an error during statistics computation.") 

# Inititialization of final statistics fields
              
    def _init_classes_statistics_dict(self):
        classes_statistics_dict = dict()
        for class_id, class_property_usage_record in self.class_property_usage_dict.items():
            classes_statistics_dict[class_id] = {
                ClassFields.ID.value: wd_json_fields_ex.extract_wd_numeric_id_part(class_id),
                ClassFields.INSTANCE_COUNT.value: class_property_usage_record["instanceCount"],
                ClassFields.INLINKS_COUNT.value: class_property_usage_record["inlinksCount"],
                ClassFields.STATEMENT_COUNT.value: class_property_usage_record["statementCount"],
                ClassFields.INSTANCE_INLINKS_COUNT.value: 0,
                ClassFields.INSTANCE_STATEMENT_COUNT.value: 0,
                ClassFields.SUBJECT_OF_STATS_SCORES.value: [],
                ClassFields.VALUE_OF_STATS_SCORES.value: [],
            }
        return classes_statistics_dict
                
    def _init_properties_statistics_dict(self):
        properties_statistics_dict = dict()
        for property_id in self.properties_ids_to_datatype_dict.keys():
            properties_statistics_dict[property_id] = {
                PropertyFields.ID.value: wd_json_fields_ex.extract_wd_numeric_id_part(property_id),
                PropertyFields.INSTANCE_USAGE_COUNT.value: 0,
                GenConstFields.SUBJECT_TYPE_STATS.value: dict(),
                ItemConstFields.VALUE_TYPE_STATS.value: dict()
            }
        return properties_statistics_dict

## Class subject of or value of statistics

    def _compute_class_property_range_stats_scores(self, range_record):
        rangeStatsScores = []
        for class_id, count in range_record["range"].items():
            rangeStatsScores.append({
                ScoresFields.CLASS.value: wd_json_fields_ex.extract_wd_numeric_id_part(class_id),
                ScoresFields.SCORE.value: float(float(count) / float(range_record["counter"]))
            })
        rangeStatsScores.sort(reverse=True, key=lambda s: s[ScoresFields.SCORE.value])
        return rangeStatsScores
    
    def _compute_class_properties_usage_statistics(self, class_property_usage_record):
        statsScores = []
        for property_id, range_record in class_property_usage_record["properties"].items():
            statsScores.append({
                ScoresFields.PROPERTY.value: wd_json_fields_ex.extract_wd_numeric_id_part(property_id),
                ScoresFields.SCORE.value: float(float(range_record["counter"]) / float(class_property_usage_record["counter"])),
                ScoresFields.RANGE_SCORES.value: self._compute_class_property_range_stats_scores(range_record)
            })    
        statsScores.sort(reverse=True, key=lambda s: s[ScoresFields.SCORE.value])
        return statsScores

## Property statistics
 
    def _add_to_domain_of_property(self, prop_stats, subject_class_id, count):
        if subject_class_id not in prop_stats[GenConstFields.SUBJECT_TYPE_STATS.value]:
            prop_stats[GenConstFields.SUBJECT_TYPE_STATS.value][subject_class_id] = count
        else:
            prop_stats[GenConstFields.SUBJECT_TYPE_STATS.value][subject_class_id] += count
    
    def _add_to_range_of_property(self, prop_stats, range_record):
        for object_class_id, count in range_record["range"].items():
            if object_class_id not in prop_stats[ItemConstFields.VALUE_TYPE_STATS.value]:
                prop_stats[ItemConstFields.VALUE_TYPE_STATS.value][object_class_id] = count
            else:
                prop_stats[ItemConstFields.VALUE_TYPE_STATS.value][object_class_id] += count
    
    def _add_to_domain_and_range_of_property(self, properties_statistics_dict: dict, class_id, class_property_usage_record):
        for property_id, range_record in class_property_usage_record["properties"].items():
            prop_stats = properties_statistics_dict[property_id]
            prop_stats[PropertyFields.INSTANCE_USAGE_COUNT.value] = range_record["counter"]
            self._add_to_domain_of_property(prop_stats, class_id, range_record["counter"])
            self._add_to_range_of_property(prop_stats, range_record)
    
    def _summarize_property_usage_dict(self, usage_dict: dict):
        total_count = sum([value for value in usage_dict.values()])
        summary = []
        for class_id, count in usage_dict.items():
            summary.append({
                ScoresFields.CLASS.value: wd_json_fields_ex.extract_wd_numeric_id_part(class_id),
                ScoresFields.SCORE.value: float(float(count) / float(total_count))
            })
        summary.sort(reverse=True, key=lambda s: s[ScoresFields.SCORE.value])
        return summary
    
    def _summarize_property_domain_and_range(self, properties_statistics_dict: dict):
        for stats_record in properties_statistics_dict.values():
            stats_record[GenConstFields.SUBJECT_TYPE_STATS.value] = self._summarize_property_usage_dict(stats_record[GenConstFields.SUBJECT_TYPE_STATS.value])
            stats_record[ItemConstFields.VALUE_TYPE_STATS.value] = self._summarize_property_usage_dict(stats_record[ItemConstFields.VALUE_TYPE_STATS.value])

## Statistics finalization

    def _compute_statistics(self, classes_statistics_dict: dict, properties_statistics_dict: dict):
        i = 1
        for class_id, class_property_usage_record in self.class_property_usage_dict.items():
            classes_statistics_dict[class_id][ClassFields.SUBJECT_OF_STATS_SCORES.value] = self._compute_class_properties_usage_statistics(class_property_usage_record["subjectOf"])
            classes_statistics_dict[class_id][ClassFields.INSTANCE_STATEMENT_COUNT] = class_property_usage_record["subjectOf"]["counter"]
            
            classes_statistics_dict[class_id][ClassFields.VALUE_OF_STATS_SCORES.value] = self._compute_class_properties_usage_statistics(class_property_usage_record["valueOf"])
            classes_statistics_dict[class_id][ClassFields.INSTANCE_INLINKS_COUNT] = class_property_usage_record["valueOf"]["counter"]
            
            self._add_to_domain_and_range_of_property(properties_statistics_dict, class_id, class_property_usage_record["subjectOf"])
            
            i += 1
            ul.try_log_progress(self.logger, i, ul.CLASSES_PROGRESS_STEP)
        
        self.logger.info("Summarizing domain and range")
        self._summarize_property_domain_and_range(properties_statistics_dict)
        self._save_to_files(classes_statistics_dict, properties_statistics_dict)
    
    def _save_to_files(self, classes_statistics_dict: dict, properties_statistics_dict: dict):
        self.logger.info("Writing classes to a file.")
        decoding.write_mapped_entities_to_file(classes_statistics_dict, CLASSES_STATS_OUTPUT_FILE_PATH)
        self.logger.info("Writing properties to a file.")
        decoding.write_mapped_entities_to_file(properties_statistics_dict, PROPERTIES_STATS_OUTPUT_FILE_PATH)
    
    def finalize_statistics(self):
        # Clear the instance of dict
        self.entity_to_instance_of_dict = None
        classes_statistics_dict = self._init_classes_statistics_dict()
        properties_statistics_dict = self._init_properties_statistics_dict()
        self.logger.info("Finilizing statistics")
        self._compute_statistics(classes_statistics_dict, properties_statistics_dict)
        
    