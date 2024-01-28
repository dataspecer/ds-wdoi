from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context

CHILDREN_FIELD = "children"
SUBJECT_OF_FIELD = "subjectOf"
VALUE_OF_FIELD = "valueOf"
INSTANCES_FIELD = "instances"

"""
Durig modification this should be run as soon as possible.
Since it creates fields that will be used by other modifiers later on.
"""
class AddFields(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("add-fields"), context)

    def __call__(self, wd_entity) -> None:
        self.add_field_if_missing(wd_entity, CHILDREN_FIELD)
        self.add_field_if_missing(wd_entity, SUBJECT_OF_FIELD)
        self.add_field_if_missing(wd_entity, VALUE_OF_FIELD)
        self.add_field_if_missing(wd_entity, INSTANCES_FIELD)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} classes")
        