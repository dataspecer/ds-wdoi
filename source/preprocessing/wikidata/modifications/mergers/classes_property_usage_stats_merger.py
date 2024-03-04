from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import *
from wikidata.model_simplified.classes import ClassFields
import utils.logging as ul
import pathlib
import utils.decoding as decoding

class ClassesPropertyUsageStatsMerger(ModifierFull):
    
    def __init__(self, logger, context: Context, classes_property_usage_stats_filename: pathlib.Path) -> None:
        super().__init__(logger.getChild("classes-property-usage-merger"), context)
        self.classes_property_usage_stats_filename = classes_property_usage_stats_filename
        self.missing_classes = set()
    
    def modify_all(self) -> None:
        classes_property_usage_stats: dict = decoding.load_entities_to_map(self.classes_property_usage_stats_filename, self.logger, ul.CLASSES_PROGRESS_STEP)
        for idx, stats_class in enumerate(classes_property_usage_stats.values()):
            cls_id = stats_class[ClassFields.ID.value]
            if cls_id in self.context.class_map:
                wd_class = self.context.class_map[cls_id]
                wd_class[ClassFields.SUBJECT_OF_STATS_PROBS.value] = stats_class[ClassFields.SUBJECT_OF_STATS_PROBS.value]
                wd_class[ClassFields.SUBJECT_OF_STATS.value] = list(map(lambda x: x["property"], stats_class[ClassFields.SUBJECT_OF_STATS_PROBS.value]))
                wd_class[ClassFields.VALUE_OF_STATS_PROBS.value] = stats_class[ClassFields.VALUE_OF_STATS_PROBS.value]
                wd_class[ClassFields.VALUE_OF_STATS.value] = list(map(lambda x: x["property"], stats_class[ClassFields.VALUE_OF_STATS_PROBS.value]))
            else:
                self.missing_classes.add(cls_id)
                self.logger.info(f"Found missing class = {cls_id}")
            ul.try_log_progress(self.logger, idx, ul.CLASSES_PROGRESS_STEP)
            
    def report_status(self) -> None:
        self.logger.info(f"Merged classes with property usage statistics, but missed {len(self.missing_classes)} classes")
        
    

