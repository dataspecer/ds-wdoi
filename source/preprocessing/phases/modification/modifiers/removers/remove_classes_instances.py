from collections import deque
from phases.modification.modifiers.removers.remover import Remover
from phases.modification.modifiers.context import Context
from core.model_simplified.classes import ClassFields

class RemoveClassInstances(Remover):
    def __init__(self, classes_ids, logger, context: Context, logging_on: bool) -> None:
        super().__init__(logger.getChild("remove_class_instances"), context, logging_on)
        self.ancestors_ids_to_keep = set(classes_ids)
        self.classes_ids = classes_ids
    
    def report_status(self) -> None:
        self.logger.info(f"Classes Marked: {len(self.classes_marked_for_removal)} Removed {len(self.classes_removed)}")
    
    def _find_ancestors_of(self, wd_class) -> list:
        visited_ids = set()
        queue = deque()
        
        visited_ids.add(wd_class[ClassFields.ID.value])
        queue.append(wd_class[ClassFields.SUBCLASS_OF.value])
        
        while (len(queue) != 0):
            next_ids = queue.popleft()
            for next_class_id in next_ids:
                if next_class_id not in visited_ids:
                    visited_ids.add(next_class_id)
                    next_cls = self.context.classes_dict[next_class_id]
                    queue.append(next_cls[ClassFields.SUBCLASS_OF.value])
        
        return list(visited_ids)

    def _mark_ancestors_to_keep(self):
        for class_id in self.classes_ids:
            ancestors = self._find_ancestors_of(self.context.classes_dict[class_id])
            self.ancestors_ids_to_keep.update(ancestors)
    
    def modify_all(self) -> None:
        self._mark_ancestors_to_keep()
        self._mark_instances_for_removal()
        self.remove(self.context.classes_dict, self.classes_marked_for_removal, self.classes_removed)
        
    def _mark_instances_for_removal(self):
        for class_id in self.classes_ids:
            wd_class = self.context.classes_dict[class_id]
            instances_ids = wd_class[ClassFields.INSTANCES.value]
            for instance_id in instances_ids:
                if instance_id not in self.ancestors_ids_to_keep:
                    self.classes_marked_for_removal.add(instance_id)

                
                
                
                