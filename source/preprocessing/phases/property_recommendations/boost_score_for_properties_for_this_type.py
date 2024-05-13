from core.model_simplified.classes import ClassFields
from core.model_simplified.scores import ScoresFields
import core.utils.logging as ul
from phases.property_recommendations.main_logger import main_logger

logger = main_logger.getChild("boosting")

def boost_score_for_properties_for_this_type(classes_dict: dict):
    for i, [cls_id, cls] in enumerate(classes_dict.items()):
        subject_of_stats_scores: list = cls[ClassFields.SUBJECT_OF_STATS_SCORES.value]
        properties_for_this_type = cls[ClassFields.PROPERTIES_FOR_THIS_TYPE.value]
        if len(properties_for_this_type) != 0:
            __boost_score_for_records(cls_id, subject_of_stats_scores, properties_for_this_type)
            subject_of_stats_scores.sort(reverse=True, key=lambda x: x[ScoresFields.SCORE.value])
            cls[ClassFields.SUBJECT_OF_STATS.value] = list(map(lambda x: x[ScoresFields.PROPERTY.value], subject_of_stats_scores))
        ul.try_log_progress(logger, i, ul.CLASSES_PROGRESS_STEP)

def __boost_score_for_records(cls_id, subject_of_stats_scores, properties_for_this_type):
    logger.info(f"Class {cls_id} has the field with {len(properties_for_this_type)} properties")
    found_properties = 0
    for property_score_record in subject_of_stats_scores:
        if property_score_record[ScoresFields.PROPERTY.value] in properties_for_this_type:
            property_score_record[ScoresFields.SCORE.value] = float(1)
            found_properties += 1  
    if found_properties != len(properties_for_this_type):
        logger.info(f"For class {cls_id} found only {found_properties}/{len(properties_for_this_type)} properties")