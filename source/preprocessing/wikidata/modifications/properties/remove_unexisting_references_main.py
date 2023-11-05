import wikidata.modifications.modifier as mods

class RemoveUnexistingReferencesMainProperties(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("rer-properties-main"))
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        wd_entity["instanceOf"] = self.filter_existing(wd_entity["instanceOf"], True, context)
        wd_entity["relatedProperty"] = self.filter_existing(wd_entity["relatedProperty"], False, context)
        wd_entity["subpropertyOf"] = self.filter_existing(wd_entity["subpropertyOf"], False, context)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.missing_refs)} main property references")