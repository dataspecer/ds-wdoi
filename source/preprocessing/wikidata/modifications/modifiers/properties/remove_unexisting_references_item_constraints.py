from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model.properties import UnderlyingTypes

class RemoveUnexistingReferencesItemConstraintsProperties(ModifierPart):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("rer-properties-item-constraints"))
    
    def __call__(self, wd_entity, context: Context) -> None:
        if UnderlyingTypes.ENTITY == wd_entity['underlyingType']:
            itemConstraints = wd_entity['constraints']['typeDependent']
        
            itemConstraints['valueType']['instanceOf'] = self.filter_existing_classes(itemConstraints['valueType']['instanceOf'], context.class_map)
            itemConstraints['valueType']['subclassOf'] = self.filter_existing_classes(itemConstraints['valueType']['subclassOf'], context.class_map)
            itemConstraints['valueType']['subclassOfInstanceOf'] = self.filter_existing_classes(itemConstraints['valueType']['subclassOfInstanceOf'], context.class_map)
            
            itemConstraints["valueRequiresStatement"] = self.filter_existing_allowance_map(itemConstraints["valueRequiresStatement"], context.property_map)
    
            if itemConstraints["inverse"] != None:
                inverseList = self.filter_existing_properties([itemConstraints["inverse"]], context.property_map)
                if len(inverseList) == 0:
                    itemConstraints["inverse"] = None
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} item constraints references")