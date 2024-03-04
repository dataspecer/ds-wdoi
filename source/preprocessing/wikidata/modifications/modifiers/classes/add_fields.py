from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model_simplified.classes import ClassFields

"""
Durig modification this should be run as soon as possible.
Since it creates fields that will be used by other modifiers later on.
Note that the list is incomplete, since some fields are added during merging of statistics and during recommendation computation.
The fields here are for the main modification phase.
"""
class AddFields(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("add-fields"), context)

    def __call__(self, wd_entity) -> None:
        self.add_field_if_missing(wd_entity, ClassFields.CHILDREN.value)
        self.add_field_if_missing(wd_entity, ClassFields.SUBJECT_OF.value)
        self.add_field_if_missing(wd_entity, ClassFields.VALUE_OF.value)
        self.add_field_if_missing(wd_entity, ClassFields.INSTANCES.value)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} classes")
        