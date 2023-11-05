import wikidata.modifications.modifier as mods

class RemoveUnexistingReferencesClasses(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("rer-classes"))
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        wd_entity["subclassOf"] = self.filter_existing(wd_entity["subclassOf"], True, context)
        wd_entity["instanceOf"] = self.filter_existing(wd_entity["instanceOf"], True, context)
        wd_entity["propertiesForThisType"] = self.filter_existing(wd_entity["propertiesForThisType"], False, context)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.missing_refs)} references")
        