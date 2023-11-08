import wikidata.modifications.modifier as mods

class RemoveUnexistingReferencesClasses(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("rer-classes"))
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        wd_entity["subclassOf"] = self.filter_existing_classes(wd_entity["subclassOf"], context.class_map)
        wd_entity["instanceOf"] = self.filter_existing_classes(wd_entity["instanceOf"], context.class_map)
        wd_entity["propertiesForThisType"] = self.filter_existing_properties(wd_entity["propertiesForThisType"], context.property_map)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} references")
        