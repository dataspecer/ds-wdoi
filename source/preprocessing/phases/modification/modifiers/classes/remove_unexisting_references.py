from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_simplified.classes import ClassFields
from core.model_simplified.scores import ScoresFields

class RemoveUnexistingReferencesClasses(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("rer_classes"), context)
    
    def remove_unexisting_inner_range(self, property_scores_records):
        for property_scores_record in property_scores_records:
            property_scores_record[ScoresFields.RANGE.value] = self.filter_existing_classes(property_scores_record[ScoresFields.RANGE.value])
            property_scores_record[ScoresFields.RANGE_SCORES.value] = list(filter(lambda x: x[ScoresFields.CLASS.value] in property_scores_record[ScoresFields.RANGE.value], property_scores_record[ScoresFields.RANGE_SCORES.value]))
    
    def __call__(self, wd_class) -> None:
        wd_class[ClassFields.SUBCLASS_OF.value] = self.filter_existing_classes(wd_class[ClassFields.SUBCLASS_OF.value])
        wd_class[ClassFields.INSTANCE_OF.value] = self.filter_existing_classes(wd_class[ClassFields.INSTANCE_OF.value])
        wd_class[ClassFields.INSTANCES.value] = self.filter_existing_classes(wd_class[ClassFields.INSTANCES.value])
        wd_class[ClassFields.CHILDREN.value] = self.filter_existing_classes(wd_class[ClassFields.CHILDREN.value])
        wd_class[ClassFields.PROPERTIES_FOR_THIS_TYPE.value] = self.filter_existing_properties(wd_class[ClassFields.PROPERTIES_FOR_THIS_TYPE.value])
        
        wd_class[ClassFields.SUBJECT_OF_STATS.value] = self.filter_existing_properties(wd_class[ClassFields.SUBJECT_OF_STATS.value])
        wd_class[ClassFields.SUBJECT_OF_STATS_SCORES.value] = list(filter(lambda x: x[ScoresFields.PROPERTY.value] in wd_class[ClassFields.SUBJECT_OF_STATS.value], wd_class[ClassFields.SUBJECT_OF_STATS_SCORES.value]))
        self.remove_unexisting_inner_range(wd_class[ClassFields.SUBJECT_OF_STATS_SCORES.value])

        wd_class[ClassFields.VALUE_OF_STATS.value] = self.filter_existing_properties(wd_class[ClassFields.VALUE_OF_STATS.value])
        wd_class[ClassFields.VALUE_OF_STATS_SCORES.value] = list(filter(lambda x: x[ScoresFields.PROPERTY.value] in wd_class[ClassFields.VALUE_OF_STATS.value], wd_class[ClassFields.VALUE_OF_STATS_SCORES.value]))
        self.remove_unexisting_inner_range(wd_class[ClassFields.VALUE_OF_STATS_SCORES.value])
    
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} references")
        