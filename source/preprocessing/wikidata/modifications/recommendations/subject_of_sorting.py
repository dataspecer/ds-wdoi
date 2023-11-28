from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import *
import  utils.property_recommender as pr 
import utils.logging as ul

SUBJECT_OF_PROBS_FIELD = 'subjectOfProbs'

class SubjectOfSorting(ModifierFull):
    
    def __init__(self, logger, context: RecommendationContext) -> None:
        super().__init__(logger.getChild("subject-of-sort"), context)
        self.context = context

    def create_sort_value_getter_func(self, local_recs):
        context = self.context
        local_rec_map = pr.create_map_from_recs(local_recs) 
        def sort_value_getter_func(cls_id: int):
            if cls_id in local_rec_map:
                return local_rec_map[cls_id]
            else:
                return context.global_recs[cls_id]
        return sort_value_getter_func

    def modify_all(self) -> None:
        for idx, wd_class in enumerate(self.context.class_map.values()):
            if wd_class['id'] == 5:
                self.add_field_if_missing(wd_class, SUBJECT_OF_PROBS_FIELD)
                self.sort_subject_of(wd_class)
                ul.try_log_progress(self.logger, idx, ul.CLASSES_PROGRESS_STEP)
                exit()
            
    def sort_subject_of(self, wd_class) -> None:
        recommendations = pr.get_local_recs(wd_class['id'])
        wd_class[SUBJECT_OF_PROBS_FIELD] = recommendations
        wd_class['subjectOf'].sort(reverse=True, key=self.create_sort_value_getter_func(recommendations))        

    def report_status(self) -> None:
        pass
    

