import wikidata.modifications.modifier as mods

class RemoveUnexistingReferencesGeneralConstraintsProperties(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("rer-properties-general-constraints"))
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        constraints = wd_entity['constraints']
        
        constraints["allowedQualifiers"] = self.filter_existing(constraints["allowedQualifiers"], False, context)
        constraints["requiredQualifiers"] = self.filter_existing(constraints["requiredQualifiers"], False, context)
        
        constraints['subjectType']['instanceOf'] = self.filter_existing(constraints['subjectType']['instanceOf'], True, context)
        constraints['subjectType']['subclassOf'] = self.filter_existing(constraints['subjectType']['subclassOf'], True, context)
        constraints['subjectType']['subclassOfInstanceOf'] = self.filter_existing(constraints['subjectType']['subclassOfInstanceOf'], True, context)
        
        constraints["itemRequiresStatement"] = self.filter_existing_allowance_map(constraints["itemRequiresStatement"], False, context)
        constraints["conflictsWith"] = self.filter_existing_allowance_map(constraints["conflictsWith"], False, context)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.missing_refs)} general constraints references")