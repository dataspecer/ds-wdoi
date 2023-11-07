import wikidata.modifications.modifier as mods

class RemoveSelfCyclesClass(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("remove-self-cycles-class"))
        
    def __call__(self, wd_entity, context: mods.Context) -> None:
        self.remove_self_cycle(wd_entity, "subclassOf", True)
        self.remove_self_cycle(wd_entity, "instanceOf", True)
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} self cycles in classes")
        