from wikidata.modifications.context import *
from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import *
import utils.logging as ul
from wikidata.model_simplified.classes import ClassFields

class ValueOfSorting(ModifierFull):
    
    def __init__(self, logger, context: RecommendationContext) -> None:
        super().__init__(logger.getChild("value-of-sorting"), context)
        self.context = context
        self.local_recs_missing = { "count": 0 }
    
    def create_sort_value_getter(self):
        context = self.context
        counter = self.local_recs_missing
        
        def compute_new_global_rec_value(prop_id: int, subject_type_contraints):
            class_ids = list(set(subject_type_contraints["instanceOf"] + subject_type_contraints["subclassOfInstanceOf"]))
            maxValue = float(0)
            if len(class_ids) != 0:
                for class_id in class_ids:
                    class_local_recs_subject_map = context.local_recs_subject_map_to_map.get(class_id)
                    if class_local_recs_subject_map is not None and prop_id in class_local_recs_subject_map:
                        maxValue = max(class_local_recs_subject_map[prop_id], maxValue)
                    else:
                        counter["count"] += 1
                        maxValue = max(context.global_recs_subject_map[prop_id], maxValue)
                context.global_recs_value_map[prop_id] = maxValue
            else:
                context.global_recs_value_map[prop_id] = context.global_recs_subject_map[prop_id]
            
        def sort_value_getter(prop_id: int):
            if prop_id not in context.global_recs_value_map:
                compute_new_global_rec_value(prop_id, context.property_map[prop_id]["constraints"]["subjectType"])
            return context.global_recs_value_map[prop_id]

        return sort_value_getter
    
    def modify_all(self) -> None:
        for idx, wd_class in enumerate(self.context.class_map.values()):
            self.sort_value_of(wd_class)
            ul.try_log_progress(self.logger, idx, ul.RECS_PROGRESS_STEP)

    def sort_value_of(self, wd_class) -> None:
        wd_class[ClassFields.VALUE_OF.value].sort(reverse=True, key=self.create_sort_value_getter())
        
    def report_status(self) -> None:
        self.logger.info(f"Count of missing local subject recs: {self.local_recs_missing["count"]} for object computation.")
