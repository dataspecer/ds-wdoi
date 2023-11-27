from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.modifications.modifiers.classes.add_fields import *

"""
This should be run after removing unexisting references, self cycles and assigment of fields.
"""
class MarkChildrenToParents(ModifierPart):
    
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("mark-children-to-parents"))
        
    def __call__(self, wd_entity, context: Context) -> None:
        entityId = wd_entity['id']
        for parentId in wd_entity['subclassOf']:
            if parentId in context.class_map:
                parent = context.class_map[parentId]
                self.add_field_if_missing(parent, CHILDREN_FIELD)
                parent[CHILDREN_FIELD].append(entityId)
            else:
                self.logger.info(f"Missing class {parentId}")
                self.marker_set.add(parentId)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} parents")
        