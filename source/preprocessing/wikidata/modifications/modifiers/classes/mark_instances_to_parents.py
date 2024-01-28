from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.modifications.modifiers.classes.add_fields import *

"""
This should be run after removing unexisting references, self cycles and assigment of fields.
"""
class MarkInstancesToParents(ModifierPart):
    
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("mark-instances-to-parents"), context)
        
    def __call__(self, wd_entity) -> None:
        entityId = wd_entity['id']
        for parentId in wd_entity['instanceOf']:
            if parentId in self.context.class_map:
                parent = self.context.class_map[parentId]
                self.add_field_if_missing(parent, INSTANCES_FIELD)
                parent[INSTANCES_FIELD].append(entityId)
            else:
                self.logger.info(f"Missing class {parentId}")
                self.marker_set.add(parentId)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} parents of instances")
        