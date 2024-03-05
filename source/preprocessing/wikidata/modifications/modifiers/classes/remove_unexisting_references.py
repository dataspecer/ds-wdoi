from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model_simplified.classes import ClassFields

class RemoveUnexistingReferencesClasses(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("rer-classes"), context)
    
    def __call__(self, wd_class) -> None:
        wd_class[ClassFields.SUBCLASS_OF.value] = self.filter_existing_classes(wd_class[ClassFields.SUBCLASS_OF.value])
        wd_class[ClassFields.INSTANCE_OF.value] = self.filter_existing_classes(wd_class[ClassFields.INSTANCE_OF.value])
        wd_class[ClassFields.INSTANCES.value] = self.filter_existing_classes(wd_class[ClassFields.INSTANCES.value])
        wd_class[ClassFields.CHILDREN.value] = self.filter_existing_classes(wd_class[ClassFields.CHILDREN.value])
        wd_class[ClassFields.PROPERTIES_FOR_THIS_TYPE.value] = self.filter_existing_properties(wd_class[ClassFields.PROPERTIES_FOR_THIS_TYPE.value])
        
        wd_class[ClassFields.SUBJECT_OF_STATS.value] = self.filter_existing_properties(wd_class[ClassFields.SUBJECT_OF_STATS.value])
        wd_class[ClassFields.VALUE_OF_STATS.value] = self.filter_existing_properties(wd_class[ClassFields.VALUE_OF_STATS.value])

        wd_class[ClassFields.SUBJECT_OF_STATS_PROBS.value] = list(filter(lambda x: x["property"] in wd_class[ClassFields.SUBJECT_OF_STATS.value], wd_class[ClassFields.SUBJECT_OF_STATS_PROBS.value]))
        wd_class[ClassFields.VALUE_OF_STATS_PROBS.value] = list(filter(lambda x: x["property"] in wd_class[ClassFields.VALUE_OF_STATS.value], wd_class[ClassFields.VALUE_OF_STATS_PROBS.value]))
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} references")
        