from phases.modification.modifiers.removers.remover import Remover
from phases.modification.modifiers.context import Context
from phases.modification.modifiers.classes.add_fields import *
from core.model_wikidata.classes import *
from core.model_simplified.classes import ClassFields

class RemoveClassesWithNoParent(Remover):
    """
    Assuming this runs after children were assigned to classes. 
    Since there is the need to traverse recursively to children and remove them as well.
    In case the removed class is their only parent or all parents are already marked for removal.
    """

    def __init__(self, logger, context: Context, logging_on: bool) -> None:
        super().__init__(logger.getChild("remove_classes_with_no_parent"), context, logging_on)
    
    def report_status(self) -> None:
        self.logger.info(f"Classes Marked: {len(self.classes_marked_for_removal)} Removed {len(self.classes_removed)}")
    
    def modify_all(self) -> None:
        self._mark_for_removal()
        self.remove(self.context.classes_dict, self.classes_marked_for_removal, self.classes_removed)
        
    def _mark_for_removal(self):
        for wd_class in self.context.classes_dict.values():
            if len(wd_class[ClassFields.SUBCLASS_OF.value]) == 0 and wd_class[ClassFields.ID.value] != ROOT_ENTITY_ID_NUM:
                self.classes_marked_for_removal.add(wd_class[ClassFields.ID.value])
                if len(wd_class[ClassFields.CHILDREN.value]) == 0:
                    self.try_log(f"Marked empty class for removal {wd_class[ClassFields.ID.value]}")
                else:
                    self.try_log(f"Marked class for removal {wd_class[ClassFields.ID.value]}")
                    self._recursive_removal(wd_class[ClassFields.CHILDREN.value])
                    
    def _recursive_removal(self, class_children_ids):
        queue = [class_children_ids]
        while len(queue) != 0:
            children_ids = queue.pop()
            for child_id in children_ids:
                child = self.context.classes_dict[child_id]
                if self._marked_parents_count(child[ClassFields.SUBCLASS_OF.value]) == len(child[ClassFields.SUBCLASS_OF.value]) and child_id != ROOT_ENTITY_ID_NUM:
                    self.classes_marked_for_removal.add(child[ClassFields.ID.value])
                    self.try_log(f"Marked class for removal {child[ClassFields.ID.value]}")
                    queue.append(child[ClassFields.CHILDREN.value])
        
    def _marked_parents_count(self, parents_ids):
        count = 0
        for parent_id in parents_ids:
            if parent_id in self.classes_marked_for_removal:
                count += 1
        return count