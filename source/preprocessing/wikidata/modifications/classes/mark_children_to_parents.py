import wikidata.modifications.modifier as mods
from wikidata.modifications.classes.add_fields import *

class MarkChildrenToParents(mods.Modifier):
    
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("mark-children-to-parents"))
        
    def add_children_field_if_missing(self, wd_entity):
        if CHILDREN_FIELD not in wd_entity:
            wd_entity[CHILDREN_FIELD] = []
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        entityId = wd_entity['id']
        for parentId in wd_entity['subclassOf']:
            if parentId in context.class_map:
                parent = context.class_map[parentId]
                self.add_children_field_if_missing(parent)
                parent[CHILDREN_FIELD].append(entityId)
            else:
                self.logger.info(f"Missing class {parentId}")
                self.marker_set.add(parentId)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} parents")
        