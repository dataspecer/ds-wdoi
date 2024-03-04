from wikidata.modifications.removers.remover import Remover
from wikidata.modifications.context import Context
from wikidata.modifications.modifiers.classes.add_fields import *
from wikidata.model.classes import *
from wikidata.model_simplified.classes import ClassFields
"""
Assuming this runs after children were assigned to classes. 
Since there is the need to traverse recursively to children and remove them as well.
In case the removed class is their only parent or all parents are already marked for removal.
"""
class RemoveClassesWithNoParent(Remover):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("remove-classes-with-no-parent"), context)
    
    def report_status(self) -> None:
        self.logger.info(f"Classes Marked: {len(self.classes_marked_for_removal)} Removed {len(self.classes_removed)}")
    
    def modify_all(self) -> None:
        self._mark_for_removal()
        self.remove(self.context.class_map, self.classes_marked_for_removal, self.classes_removed)
        self.report_status()
        
    def _mark_for_removal(self):
        for entity in self.context.class_map.values():
            if len(entity[ClassFields.SUBCLASS_OF.value]) == 0 and entity[ClassFields.ID.value] != ROOT_ENTITY_ID_NUM:
                self.classes_marked_for_removal.add(entity[ClassFields.ID.value])
                if len(entity[ClassFields.CHILDREN.value]) == 0:
                    self.logger.info(f"Marked empty class for removal {entity[ClassFields.ID.value]}")
                else:
                    self.logger.info(f"Marked class for removal {entity[ClassFields.ID.value]}")
                    self._recursive_removal(entity[ClassFields.CHILDREN.value])
                    
    def _recursive_removal(self, entity_children_ids):
        queue = [entity_children_ids]
        while len(queue) != 0:
            children_ids = queue.pop()
            for child_id in children_ids:
                child = self.context.class_map[child_id]
                if self._marked_parents_count(child[ClassFields.SUBCLASS_OF.value]) == len(child[ClassFields.SUBCLASS_OF.value]) and child_id != ROOT_ENTITY_ID_NUM:
                    self.classes_marked_for_removal.add(child[ClassFields.ID.value])
                    self.logger.info(f"Marked class for removal {child[ClassFields.ID.value]}")
                    queue.append(child[ClassFields.CHILDREN.value])
        
    def _marked_parents_count(self, parents_ids):
        count = 0
        for parent_id in parents_ids:
            if parent_id in self.classes_marked_for_removal:
                count += 1
        return count