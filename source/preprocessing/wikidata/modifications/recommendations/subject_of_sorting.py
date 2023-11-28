from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import *
import  utils.property_recommender as pr 
import utils.logging as ul

SUBJECT_OF_PROBS_FIELD = 'subjectOfProbs'

class SubjectOfSorting(ModifierFull):
    
    def __init__(self, logger, context: RecommendationContext) -> None:
        super().__init__(logger.getChild("subject-of-sort"), context)
        self.context = context

    def create_sort_value_getter(self, local_recs_subject: dict):
        context = self.context
        def sort_value_getter(prop_id: int):
            if prop_id in local_recs_subject:
                return local_recs_subject[prop_id]
            else:
                return context.global_recs_subject_map[prop_id]
        return sort_value_getter

    def filter_valid_recs(self, prop_ids_list: list, recs: list) -> bool:
        return list(filter(lambda rec_hit: (rec_hit["property"] in prop_ids_list), recs))
    
    def modify_all(self) -> None:
        for idx, wd_class in enumerate(self.context.class_map.values()):
            self.add_field_if_missing(wd_class, SUBJECT_OF_PROBS_FIELD)
            self.sort_subject_of(wd_class)
            ul.try_log_progress(self.logger, idx, ul.CLASSES_PROGRESS_STEP)
            
    # to do filter out all things that are not in the fields
    def sort_subject_of(self, wd_class) -> None:
        recommendations: list = self.filter_valid_recs(pr.get_local_recs(wd_class['id']), wd_class['subjectOf'])
        local_recs_subject: dict = pr.create_map_from_recs(recommendations)
        wd_class[SUBJECT_OF_PROBS_FIELD] = recommendations
        self.context.local_recs_subject_map_to_map[wd_class['id']] = local_recs_subject
        wd_class['subjectOf'].sort(reverse=True, key=self.create_sort_value_getter(local_recs_subject))        





    def report_status(self) -> None:
        pass
    

