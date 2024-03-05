from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.modifications.modifiers.classes.add_fields import *
from wikidata.model_simplified.classes import ClassFields
"""
This should be run after removing unexisting references, self cycles and assigment of fields.
"""
class MarkInstancesToParents(ModifierPart):
    
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("mark-instances-to-parents"), context)
        
    def __call__(self, wd_class) -> None:
        entityId = wd_class[ClassFields.ID.value]
        for parentId in wd_class[ClassFields.INSTANCE_OF.value]:
            if parentId in self.context.class_map:
                parent = self.context.class_map[parentId]
                self.add_field_if_missing(parent, ClassFields.INSTANCES.value)
                parent[ClassFields.INSTANCES.value].append(entityId)
            else:
                self.logger.info(f"Missing class {parentId}")
                self.marker_set.add(parentId)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} parents of instances")
        