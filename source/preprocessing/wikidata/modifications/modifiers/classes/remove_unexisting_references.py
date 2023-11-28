from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context

class RemoveUnexistingReferencesClasses(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("rer-classes"), context)
    
    def __call__(self, wd_entity) -> None:
        wd_entity["subclassOf"] = self.filter_existing_classes(wd_entity["subclassOf"])
        wd_entity["instanceOf"] = self.filter_existing_classes(wd_entity["instanceOf"])
        wd_entity["propertiesForThisType"] = self.filter_existing_properties(wd_entity["propertiesForThisType"])
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} references")
        