from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_simplified.properties import PropertyFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields, TypeConstFields

class RemoveUnexistingReferencesGeneralConstraintsProperties(ModifierPart):
    def __init__(self, logger,  context: Context) -> None:
        super().__init__(logger.getChild("rer_properties_general_constraints"), context)
    
    def __call__(self, wd_property) -> None:
        constraints = wd_property[PropertyFields.CONSTRAINTS.value]
        
        constraints[GenConstFields.ALLOWED_QUALIFIERS.value] = self.filter_existing_properties(constraints[GenConstFields.ALLOWED_QUALIFIERS.value])
        constraints[GenConstFields.REQUIRED_QUALIFIERS.value] = self.filter_existing_properties(constraints[GenConstFields.REQUIRED_QUALIFIERS.value])
        
        constraints[GenConstFields.SUBJECT_TYPE.value][TypeConstFields.INSTANCE_OF.value] = self.filter_existing_classes(constraints[GenConstFields.SUBJECT_TYPE.value][TypeConstFields.INSTANCE_OF.value])
        constraints[GenConstFields.SUBJECT_TYPE.value][TypeConstFields.SUBCLASS_OF.value] = self.filter_existing_classes(constraints[GenConstFields.SUBJECT_TYPE.value][TypeConstFields.SUBCLASS_OF.value])
        constraints[GenConstFields.SUBJECT_TYPE.value][TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value] = self.filter_existing_classes(constraints[GenConstFields.SUBJECT_TYPE.value][TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value])
        
        constraints[GenConstFields.SUBJECT_TYPE_STATS.value] = self.filter_existing_classes(constraints[GenConstFields.SUBJECT_TYPE_STATS.value])
        
        constraints[GenConstFields.ITEM_REQUIRES_STATEMENT.value] = self.filter_existing_allowance_map(constraints[GenConstFields.ITEM_REQUIRES_STATEMENT.value])
        constraints[GenConstFields.CONFLICTS_WITH.value] = self.filter_existing_allowance_map(constraints[GenConstFields.CONFLICTS_WITH.value])
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} general constraints references")