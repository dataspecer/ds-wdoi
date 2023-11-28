from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import Context

"""
This depends on the selection of the languages during transformation.
If there are no labels, the users cannot search for the classes.
These classes usually means they carry no semantic meaning (such as: empty wikidata entities).
"""
class RemoveEntitiesWithNoLabel(ModifierFull):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("remove-entities-with-no-label"), context)
    
    def report_status(self) -> None:
        self.logger.info(f"Classes Marked: {len(self.classes_marked_for_removal)} Removed {len(self.classes_removed)}")
        self.logger.info(f"Properties Marked: {len(self.properties_marked_for_removal)} Removed {len(self.properties_removed)}")
    
    def modify_all(self) -> None:
        self._mark_for_removal(self.context.class_map, self.classes_marked_for_removal)
        self._mark_for_removal(self.context.property_map, self.properties_marked_for_removal)
        self.remove(self.context.class_map, self.classes_marked_for_removal, self.classes_removed)
        self.remove(self.context.property_map, self.properties_marked_for_removal, self.properties_removed)
        self.report_status()
        
    def _mark_for_removal(self, entity_map: dict, mark_set: set):
        for entity in entity_map.values():
            if len(entity['labels']) == 0:
                mark_set.add(entity['id'])
                self.logger.info(f'Marked for removal entity {entity['id']}.')
    