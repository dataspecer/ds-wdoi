from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from phases.modification.modifiers.classes.add_fields import *
from core.model_simplified.classes import ClassFields
"""
This should be run after removing unexisting references, self cycles and assigment of fields.
"""
class MarkInstancesToParents(ModifierPart):
    
    def __init__(self, logger, context: Context, logging_on: bool) -> None:
        super().__init__(logger.getChild("mark_instances_to_parents"), context, logging_on)
        
    def __call__(self, wd_class) -> None:
        entityId = wd_class[ClassFields.ID.value]
        for parentId in wd_class[ClassFields.INSTANCE_OF.value]:
            if parentId in self.context.classes_dict:
                parent = self.context.classes_dict[parentId]
                self.add_field_if_missing(parent, ClassFields.INSTANCES.value)
                parent[ClassFields.INSTANCES.value].append(entityId)
            else:
                self.try_log(f"Missing class {parentId}")
                self.marker_set.add(parentId)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} parents of instances")
        