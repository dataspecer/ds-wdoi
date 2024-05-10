from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_wikidata.classes import *
from core.model_simplified.classes import ClassFields

class RootAllClasses(ModifierPart):
    def __init__(self, logger, context: Context, logging_on: bool) -> None:
        super().__init__(logger.getChild("root_all_classes"), context, logging_on)
        self.found_root = False
    
    def __call__(self, wd_class) -> None:
        wd_class_id = wd_class[ClassFields.ID.value]
        if wd_class_id == ROOT_ENTITY_ID_NUM:
            wd_class[ClassFields.SUBCLASS_OF.value] = []
            self.try_log("Found root entity.")
            self.found_root = True
        elif len(wd_class[ClassFields.SUBCLASS_OF.value]) == 0:
            wd_class[ClassFields.SUBCLASS_OF.value].append(ROOT_ENTITY_ID_NUM)
            wd_root = self.context.classes_dict[ROOT_ENTITY_ID_NUM]
            self.add_field_if_missing(wd_root, ClassFields.CHILDREN.value)
            wd_root[ClassFields.CHILDREN.value].append(wd_class_id)
            self.try_log(f"Found entity: {wd_class_id} with zero parents.")
            self.marker_set.add(wd_class_id)
        else:
            pass
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} classes without parent. Root = {self.found_root}")
        