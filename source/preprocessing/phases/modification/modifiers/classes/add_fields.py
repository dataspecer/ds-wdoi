from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_simplified.classes import ClassFields

"""
Durig modification this should be run as soon as possible.
Since it creates fields that will be used by other modifiers later on.
Note that the list is incomplete, since some fields are added during merging of statistics and during recommendation computation.
The fields here are for the main modification phase.
"""
class AddFields(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("add_fields"), context)

    def __call__(self, wd_class) -> None:
        self.add_field_if_missing(wd_class, ClassFields.CHILDREN.value)
        self.add_field_if_missing(wd_class, ClassFields.SUBJECT_OF_CONSTS.value)
        self.add_field_if_missing(wd_class, ClassFields.VALUE_OF_CONSTS.value)
        self.add_field_if_missing(wd_class, ClassFields.INSTANCES.value)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} classes")
        