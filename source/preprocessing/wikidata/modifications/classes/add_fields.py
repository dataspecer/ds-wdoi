import wikidata.modifications.modifier as mods

CHILDREN_FIELD = "children"
SUBJECT_OF_FIELD = "subjectOf"
VALUE_OF_FIELD = "valueOf"

class AddFields(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("add-fields"))

    def add_field_if_missing(self, wd_entity, field):
        if field not in wd_entity:
            wd_entity[field] = []
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        self.add_field_if_missing(wd_entity, CHILDREN_FIELD)
        self.add_field_if_missing(wd_entity, SUBJECT_OF_FIELD)
        self.add_field_if_missing(wd_entity, VALUE_OF_FIELD)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} parents")
        