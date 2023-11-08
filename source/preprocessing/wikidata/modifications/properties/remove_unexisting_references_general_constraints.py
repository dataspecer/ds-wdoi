import wikidata.modifications.modifier as mods

class RemoveUnexistingReferencesGeneralConstraintsProperties(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("rer-properties-general-constraints"))
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        constraints = wd_entity['constraints']
        
        constraints["allowedQualifiers"] = self.filter_existing_properties(constraints["allowedQualifiers"], context.property_map)
        constraints["requiredQualifiers"] = self.filter_existing_properties(constraints["requiredQualifiers"], context.property_map)
        
        constraints['subjectType']['instanceOf'] = self.filter_existing_classes(constraints['subjectType']['instanceOf'], context.class_map)
        constraints['subjectType']['subclassOf'] = self.filter_existing_classes(constraints['subjectType']['subclassOf'], context.class_map)
        constraints['subjectType']['subclassOfInstanceOf'] = self.filter_existing_classes(constraints['subjectType']['subclassOfInstanceOf'], context.class_map)
        
        constraints["itemRequiresStatement"] = self.filter_existing_allowance_map(constraints["itemRequiresStatement"], context.property_map)
        constraints["conflictsWith"] = self.filter_existing_allowance_map(constraints["conflictsWith"], context.property_map)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} general constraints references")