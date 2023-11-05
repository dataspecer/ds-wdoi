import wikidata.modifications.modifier as mods

class RemoveUnexistingReferencesClasses(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__()
        self.missing_refs = set()
        self.logger = logger.getChild("remove-unexisting-references")
    
    def filter_existing(self, ids_list, classFlag, context: mods.Context):
        entity_map = context.class_map if classFlag else context.property_map
        present_vals = []
        for id in ids_list:
            if id in entity_map:
                present_vals.append(id)
            else:
                self.logger.info(f"Found missing reference {id} (is Class = {classFlag})")
                self.missing_refs.add(id)
        return present_vals
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        wd_entity["subclassOf"] = self.filter_existing(wd_entity["subclassOf"], True, context)
        wd_entity["instanceOf"] = self.filter_existing(wd_entity["instanceOf"], True, context)
        wd_entity["propertiesForThisType"] = self.filter_existing(wd_entity["propertiesForThisType"], False, context)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.missing_refs)} references")
        