import wikidata.modifications.modifier as mods
from wikidata.model.properties import UnderlyingTypes

class RemoveUnexistingReferencesItemConstraintsProperties(mods.Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("rer-properties-item-constraints"))
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        if UnderlyingTypes.ENTITY == wd_entity['underlyingType']:
            itemConstraints = wd_entity['constraints']['typeDependent']
        
            itemConstraints['valueType']['instanceOf'] = self.filter_existing(itemConstraints['valueType']['instanceOf'], True, context)
            itemConstraints['valueType']['subclassOf'] = self.filter_existing(itemConstraints['valueType']['subclassOf'], True, context)
            itemConstraints['valueType']['subclassOfInstanceOf'] = self.filter_existing(itemConstraints['valueType']['subclassOfInstanceOf'], True, context)
            
            itemConstraints["valueRequiresStatement"] = self.filter_existing_allowance_map(itemConstraints["valueRequiresStatement"], False, context)
    
            if itemConstraints["inverse"] != None:
                inverseList = self.filter_existing([itemConstraints["inverse"]], False, context)
                if len(inverseList) == 0:
                    itemConstraints["inverse"] = None
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} item constraints references")