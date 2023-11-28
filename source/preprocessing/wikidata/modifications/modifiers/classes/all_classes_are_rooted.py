from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model.classes import *

class AllClassesAreRooted(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("all-classes-are-rooted"), context)
        self.found_root = False
    
    def __call__(self, wd_entity) -> None:
        if wd_entity['id'] == ROOT_ENTITY_ID_NUM:
            wd_entity['subclassOf'] = []
            self.logger.info("Found root entity.")
            self.found_root = True
        elif len(wd_entity['subclassOf']) == 0:
            wd_entity['subclassOf'].append(ROOT_ENTITY_ID_NUM)
            self.logger.info(f"Found entity: {wd_entity['id']} with zero parents.")
            self.marker_set.add(wd_entity['id'])
        else:
            pass
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} classes without parent. Root = {self.found_root}")
        