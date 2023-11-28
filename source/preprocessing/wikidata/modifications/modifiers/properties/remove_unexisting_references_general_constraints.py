from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context

class RemoveUnexistingReferencesGeneralConstraintsProperties(ModifierPart):
    def __init__(self, logger,  context: Context) -> None:
        super().__init__(logger.getChild("rer-properties-general-constraints"), context)
    
    def __call__(self, wd_entity) -> None:
        constraints = wd_entity['constraints']
        
        constraints["allowedQualifiers"] = self.filter_existing_properties(constraints["allowedQualifiers"])
        constraints["requiredQualifiers"] = self.filter_existing_properties(constraints["requiredQualifiers"])
        
        constraints['subjectType']['instanceOf'] = self.filter_existing_classes(constraints['subjectType']['instanceOf'])
        constraints['subjectType']['subclassOf'] = self.filter_existing_classes(constraints['subjectType']['subclassOf'])
        constraints['subjectType']['subclassOfInstanceOf'] = self.filter_existing_classes(constraints['subjectType']['subclassOfInstanceOf'])
        
        constraints["itemRequiresStatement"] = self.filter_existing_allowance_map(constraints["itemRequiresStatement"])
        constraints["conflictsWith"] = self.filter_existing_allowance_map(constraints["conflictsWith"])
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} general constraints references")