from source.preprocessing.wikidata.modifications.context import Context
from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import *
import utils.logging as ul

class ValueOfSorting(ModifierFull):
    
    def __init__(self, logger, context: RecommendationContext) -> None:
        super().__init__(logger.getChild("value-of-sorting"), context)
        self.context = context
    
    def create_sort_value_getter(self):
        context = self.context
        
        def compute_new_global_rec_value(prop_id: int, subject_type_contraints):
            class_ids = list(set(subject_type_contraints["instanceOf"] + subject_type_contraints["subclassOfInstanceOf"]))
            probability_sum = float(0)
            for class_id in class_ids:
                class_local_recs_subject = context.local_recs_subject_map_to_map[class_id]
                if prop_id in class_local_recs_subject:
                    probability_sum += class_local_recs_subject[prop_id]
                else:
                    probability_sum += context.global_recs_subject_map[prop_id]
            context.global_recs_value_map[prop_id] = (probability_sum / float(len(class_ids)))

        def sort_value_getter(prop_id):
            if prop_id not in context.global_recs_value_map:
                compute_new_global_rec_value(prop_id, context.property_map[prop_id]["constraints"]["subjectType"])
            return context.global_recs_value_map[prop_id]

        return sort_value_getter
    
    def modify_all(self) -> None:
        for idx, wd_class in enumerate(self.context.class_map.values()):
            self.sort_value_of(wd_class)
            ul.try_log_progress(self.logger, idx, ul.CLASSES_PROGRESS_STEP)

    def sort_value_of(self, wd_class) -> None:
        wd_class["valueOf"].sort(reverse=True, key=self.create_sort_value_getter())
        
    def report_status(self) -> None:
        pass