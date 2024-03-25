from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_wikidata.properties import UnderlyingTypes
from core.model_simplified.properties import PropertyFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields, TypeConstFields

class RemoveUnexistingReferencesItemConstraintsProperties(ModifierPart):
    def __init__(self, logger,  context: Context) -> None:
        super().__init__(logger.getChild("rer-properties-item-constraints"), context)
    
    def __call__(self, wd_property) -> None:
        if wd_property[PropertyFields.UNDERLYING_TYPE.value] == UnderlyingTypes.ENTITY:
            itemConstraints = wd_property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value]
        
            itemConstraints[ItemConstFields.VALUE_TYPE.value][TypeConstFields.INSTANCE_OF.value] = self.filter_existing_classes(itemConstraints[ItemConstFields.VALUE_TYPE.value][TypeConstFields.INSTANCE_OF.value])
            itemConstraints[ItemConstFields.VALUE_TYPE.value][TypeConstFields.SUBCLASS_OF.value] = self.filter_existing_classes(itemConstraints[ItemConstFields.VALUE_TYPE.value][TypeConstFields.SUBCLASS_OF.value])
            itemConstraints[ItemConstFields.VALUE_TYPE.value][TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value] = self.filter_existing_classes(itemConstraints[ItemConstFields.VALUE_TYPE.value][TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value])
            
            itemConstraints[ItemConstFields.VALUE_TYPE_STATS.value] = self.filter_existing_classes(itemConstraints[ItemConstFields.VALUE_TYPE_STATS.value])

            itemConstraints[ItemConstFields.VALUE_REQUIRES_STATEMENT.value] = self.filter_existing_allowance_map(itemConstraints[ItemConstFields.VALUE_REQUIRES_STATEMENT.value])
    
            if itemConstraints[ItemConstFields.INVERSE.value] != None:
                inverseList = self.filter_existing_properties([itemConstraints[ItemConstFields.INVERSE.value]])
                if len(inverseList) == 0:
                    itemConstraints[ItemConstFields.INVERSE.value] = None
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} item constraints references")