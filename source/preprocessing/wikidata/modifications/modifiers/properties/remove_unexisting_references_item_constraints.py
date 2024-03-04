from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model.properties import UnderlyingTypes
from wikidata.model_simplified.properties import PropertyFields
from wikidata.model_simplified.constraints import GenConstFields, ItemConstFields

class RemoveUnexistingReferencesItemConstraintsProperties(ModifierPart):
    def __init__(self, logger,  context: Context) -> None:
        super().__init__(logger.getChild("rer-properties-item-constraints"), context)
    
    def __call__(self, wd_entity) -> None:
        if UnderlyingTypes.ENTITY == wd_entity[PropertyFields.UNDERLYING_TYPE.value]:
            itemConstraints = wd_entity[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value]
        
            itemConstraints[ItemConstFields.VALUE_TYPE.value]['instanceOf'] = self.filter_existing_classes(itemConstraints[ItemConstFields.VALUE_TYPE.value]['instanceOf'])
            itemConstraints[ItemConstFields.VALUE_TYPE.value]['subclassOf'] = self.filter_existing_classes(itemConstraints[ItemConstFields.VALUE_TYPE.value]['subclassOf'])
            itemConstraints[ItemConstFields.VALUE_TYPE.value]['subclassOfInstanceOf'] = self.filter_existing_classes(itemConstraints[ItemConstFields.VALUE_TYPE.value]['subclassOfInstanceOf'])
            
            itemConstraints[ItemConstFields.VALUE_TYPE_STATS.value] = self.filter_existing_classes(itemConstraints[ItemConstFields.VALUE_TYPE_STATS.value])

            itemConstraints[ItemConstFields.VALUE_REQUIRES_STATEMENT.value] = self.filter_existing_allowance_map(itemConstraints[ItemConstFields.VALUE_REQUIRES_STATEMENT.value])
    
            if itemConstraints[ItemConstFields.INVERSE.value] != None:
                inverseList = self.filter_existing_properties([itemConstraints[ItemConstFields.INVERSE.value]])
                if len(inverseList) == 0:
                    itemConstraints[ItemConstFields.INVERSE.value] = None
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} item constraints references")