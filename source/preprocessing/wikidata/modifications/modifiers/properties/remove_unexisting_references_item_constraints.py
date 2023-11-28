from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model.properties import UnderlyingTypes

class RemoveUnexistingReferencesItemConstraintsProperties(ModifierPart):
    def __init__(self, logger,  context: Context) -> None:
        super().__init__(logger.getChild("rer-properties-item-constraints"), context)
    
    def __call__(self, wd_entity) -> None:
        if UnderlyingTypes.ENTITY == wd_entity['underlyingType']:
            itemConstraints = wd_entity['constraints']['typeDependent']
        
            itemConstraints['valueType']['instanceOf'] = self.filter_existing_classes(itemConstraints['valueType']['instanceOf'])
            itemConstraints['valueType']['subclassOf'] = self.filter_existing_classes(itemConstraints['valueType']['subclassOf'])
            itemConstraints['valueType']['subclassOfInstanceOf'] = self.filter_existing_classes(itemConstraints['valueType']['subclassOfInstanceOf'])
            
            itemConstraints["valueRequiresStatement"] = self.filter_existing_allowance_map(itemConstraints["valueRequiresStatement"])
    
            if itemConstraints["inverse"] != None:
                inverseList = self.filter_existing_properties([itemConstraints["inverse"]])
                if len(inverseList) == 0:
                    itemConstraints["inverse"] = None
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} item constraints references")