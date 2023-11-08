import wikidata.modifications.modifier as mods

class RemoveUnexistingReferencesMainProperties(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("rer-properties-main"))
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        wd_entity["instanceOf"] = self.filter_existing_classes(wd_entity["instanceOf"], context.class_map)
        wd_entity["relatedProperty"] = self.filter_existing_properties(wd_entity["relatedProperty"], context.property_map)
        wd_entity["subpropertyOf"] = self.filter_existing_properties(wd_entity["subpropertyOf"], context.property_map)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} main property references")