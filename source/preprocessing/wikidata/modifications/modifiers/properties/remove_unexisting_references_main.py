from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context

class RemoveUnexistingReferencesMainProperties(ModifierPart):
    def __init__(self, logger,  context: Context) -> None:
        super().__init__(logger.getChild("rer-properties-main"), context)
    
    def __call__(self, wd_entity) -> None:
        wd_entity["instanceOf"] = self.filter_existing_classes(wd_entity["instanceOf"])
        wd_entity["relatedProperty"] = self.filter_existing_properties(wd_entity["relatedProperty"])
        wd_entity["subpropertyOf"] = self.filter_existing_properties(wd_entity["subpropertyOf"])
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} main property references")