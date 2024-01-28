from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import *
import  utils.property_recommender as pr 
import utils.logging as ul

SUBJECT_OF_PROBS_FIELD = 'subjectOfProbs'

class SubjectOfSorting(ModifierFull):
    
    def __init__(self, logger, context: RecommendationContext) -> None:
        super().__init__(logger.getChild("subject-of-sort"), context)
        self.context = context
        self.local_recs_missing = { "count": 0 }

    def create_sort_value_getter(self, local_recs_subject_map: dict):
        context = self.context
        counter = self.local_recs_missing
        def sort_value_getter(prop_id: int):
            if prop_id in local_recs_subject_map:
                return local_recs_subject_map[prop_id]
            else:
                counter["count"] += 1
                return context.global_recs_subject_map[prop_id]
        return sort_value_getter

    def filter_valid_recs(self, subjects_prop_ids_list: list, recs: list) -> bool:
        return list(filter(lambda rec_hit: (rec_hit["property"] in subjects_prop_ids_list), recs))
    
    def modify_all(self) -> None:
        for idx, wd_class in enumerate(self.context.class_map.values()):
            self.add_field_if_missing(wd_class, SUBJECT_OF_PROBS_FIELD)
            self.sort_subject_of(wd_class)
            ul.try_log_progress(self.logger, idx, ul.RECS_PROGRESS_STEP)
            
    def sort_subject_of(self, wd_class) -> None:
        subjectOfField = wd_class['subjectOf']
        if len(subjectOfField) != 0:
            recommendations: list = self.filter_valid_recs(subjectOfField, pr.get_local_recs(wd_class['id']))
            local_recs_subject_map: dict = pr.create_map_from_recs(recommendations)
            wd_class[SUBJECT_OF_PROBS_FIELD] = recommendations
            self.context.local_recs_subject_map_to_map[wd_class['id']] = local_recs_subject_map
            subjectOfField.sort(reverse=True, key=self.create_sort_value_getter(local_recs_subject_map))        
        else:
            wd_class[SUBJECT_OF_PROBS_FIELD] = []
        
    def report_status(self) -> None:
        self.logger.info(f"Count of missing local subject recs: {self.local_recs_missing["count"]}")
        
    

