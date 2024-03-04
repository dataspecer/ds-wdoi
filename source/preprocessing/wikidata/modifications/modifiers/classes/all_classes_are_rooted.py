from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model.classes import *
from wikidata.model_simplified.classes import ClassFields

class AllClassesAreRooted(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("all-classes-are-rooted"), context)
        self.found_root = False
    
    def __call__(self, wd_entity) -> None:
        if wd_entity[ClassFields.ID.value] == ROOT_ENTITY_ID_NUM:
            wd_entity[ClassFields.SUBCLASS_OF.value] = []
            self.logger.info("Found root entity.")
            self.found_root = True
        elif len(wd_entity[ClassFields.SUBCLASS_OF.value]) == 0:
            wd_entity[ClassFields.SUBCLASS_OF.value].append(ROOT_ENTITY_ID_NUM)
            self.logger.info(f"Found entity: {wd_entity[ClassFields.ID.value]} with zero parents.")
            self.marker_set.add(wd_entity[ClassFields.ID.value])
        else:
            pass
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} classes without parent. Root = {self.found_root}")
        