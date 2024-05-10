from phases.modification.modifiers.modifier_all import ModifierAll
from phases.modification.modifiers.context import *
from core.model_simplified.classes import ClassFields
from core.model_simplified.scores import ScoresFields
import core.utils.logging as ul
import pathlib
import core.utils.decoding as decoding

class ClassesPropertyUsageStatsMerger(ModifierAll):
    
    def __init__(self, logger, context: Context, classes_property_usage_stats_filename: pathlib.Path, logging_on: bool) -> None:
        super().__init__(logger.getChild("classes_property_usage_merger"), context, logging_on)
        self.classes_property_usage_stats_filename = classes_property_usage_stats_filename
        self.missing_classes = set()
    
    def merge_inner_range(self, property_scores_records):
        for property_score_record in property_scores_records:
            property_score_record[ScoresFields.RANGE.value] = list(map(lambda x: x[ScoresFields.CLASS.value], property_score_record[ScoresFields.RANGE_SCORES.value]))
    
    def merge_property_usage(self, wd_class, class_stats, field_with_scores, field_with_only_ids):
        wd_class[field_with_scores] = class_stats[field_with_scores]
        wd_class[field_with_only_ids] = list(map(lambda x: x[ScoresFields.PROPERTY.value], class_stats[field_with_scores]))
        self.merge_inner_range(wd_class[field_with_scores])            
    
    def merge_counters(self, wd_class, class_stats):
        wd_class[ClassFields.INLINKS_COUNT.value] = class_stats[ClassFields.INLINKS_COUNT.value]
        wd_class[ClassFields.INSTANCE_INLINKS_COUNT.value] = class_stats[ClassFields.INSTANCE_INLINKS_COUNT.value]
        wd_class[ClassFields.STATEMENT_COUNT.value] = class_stats[ClassFields.STATEMENT_COUNT.value]
        wd_class[ClassFields.INSTANCE_STATEMENT_COUNT.value] = class_stats[ClassFields.INSTANCE_STATEMENT_COUNT.value]
        wd_class[ClassFields.INSTANCE_COUNT.value] = class_stats[ClassFields.INSTANCE_COUNT.value]
        wd_class[ClassFields.SITELINKS_COUNT.value] = class_stats[ClassFields.SITELINKS_COUNT.value]
    
    def modify_all(self) -> None:
        classes_property_usage_stats: dict = decoding.load_entities_to_dict(self.classes_property_usage_stats_filename, self.logger, ul.CLASSES_PROGRESS_STEP)
        for idx, class_stats in enumerate(classes_property_usage_stats.values()):
            cls_id = class_stats[ClassFields.ID.value]
            if cls_id in self.context.classes_dict:
                wd_class = self.context.classes_dict[cls_id]
                self.merge_counters(wd_class, class_stats)
                # Subject of statistics
                self.merge_property_usage(wd_class, class_stats, ClassFields.SUBJECT_OF_STATS_SCORES.value, ClassFields.SUBJECT_OF_STATS.value)
                # Value of statistics
                self.merge_property_usage(wd_class, class_stats, ClassFields.VALUE_OF_STATS_SCORES.value, ClassFields.VALUE_OF_STATS.value)
            else:
                self.missing_classes.add(cls_id)
                self.try_log(f"Found missing class = {cls_id}")
            ul.try_log_progress(self.logger, idx, ul.CLASSES_PROGRESS_STEP)
            
    def report_status(self) -> None:
        self.logger.info(f"Merged classes with property usage statistics, but missed {len(self.missing_classes)} classes")
        
    

