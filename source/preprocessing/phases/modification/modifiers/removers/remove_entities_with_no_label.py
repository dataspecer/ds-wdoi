from phases.modification.modifiers.removers.remover import Remover
from phases.modification.modifiers.context import Context

class RemoveEntitiesWithNoLabel(Remover):
    def __init__(self, logger, context: Context, logging_on: bool) -> None:
        super().__init__(logger.getChild("remove_entities_with_no_label"), context, logging_on)
    
    def report_status(self) -> None:
        self.logger.info(f"Classes Marked: {len(self.classes_marked_for_removal)} Removed {len(self.classes_removed)}")
        self.logger.info(f"Properties Marked: {len(self.properties_marked_for_removal)} Removed {len(self.properties_removed)}")
    
    def modify_all(self) -> None:
        self._mark_for_removal(self.context.classes_dict, self.classes_marked_for_removal)
        self._mark_for_removal(self.context.properties_dict, self.properties_marked_for_removal)
        self.remove(self.context.classes_dict, self.classes_marked_for_removal, self.classes_removed)
        self.remove(self.context.properties_dict, self.properties_marked_for_removal, self.properties_removed)
        self.report_status()
        
    def _mark_for_removal(self, entities_dict: dict, mark_set: set):
        for entity in entities_dict.values():
            if len(entity['labels']) == 0:
                mark_set.add(entity['id'])
                self.try_log(f'Marked for removal entity {entity['id']}.')
    