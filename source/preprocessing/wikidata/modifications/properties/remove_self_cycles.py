import wikidata.modifications.modifier as mods

class RemoveSelfCyclesProperty(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("remove-self-cycles-property"))
        
    def __call__(self, wd_entity, context: mods.Context) -> None:
        self.remove_self_cycle(wd_entity, "subpropertyOf", isClass=False)
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} self cycles in properties")
        