import wikidata.modifications.modifier as mods

ROOT_ENTITY_ID = 35120

class AllClassesAreRooted(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__()
        self.zero_parents_set = set()
        self.found_root = False
        self.logger = logger.getChild("all-classes-are-rooted")
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        if wd_entity['id'] == ROOT_ENTITY_ID:
            wd_entity['subclassOf'] = []
            self.logger.info("Found root entity.")
            self.found_root = True
        elif len(wd_entity['subclassOf']) == 0:
            wd_entity['subclassOf'].append(ROOT_ENTITY_ID)
            self.logger.info(f"Found entity: {wd_entity['id']} with zero parents.")
            self.zero_parents_set.add(wd_entity['id'])
        else:
            pass
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.zero_parents_set)} classes without parent. Root = {self.found_root}")
        