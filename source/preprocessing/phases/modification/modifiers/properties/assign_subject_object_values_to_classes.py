from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from phases.modification.modifiers.classes.add_fields import *
from core.model_wikidata.constraints import *
from core.model_wikidata.properties import *
from core.model_simplified.classes import ClassFields
from core.model_simplified.properties import PropertyFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields, TypeConstFields

class AssignSubjectValueConstsToClasses(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("assign_subject_consts_object"), context)
        self.object_assignment = set()

    def __call__(self, wd_property) -> None:
        prop_id = wd_property[PropertyFields.ID.value]
        constraints = wd_property[PropertyFields.CONSTRAINTS.value]
        if self.canBeUsedAsMainValue(constraints) and self.canBeUsedOnItems(constraints) and self.isAllowedDatatype(wd_property):
            self.marker_set.add(prop_id)
            self.assign_type_constraints(constraints[GenConstFields.SUBJECT_TYPE.value], prop_id, ClassFields.SUBJECT_OF_CONSTS.value)
            
            if self.isItemProperty(constraints):
                self.object_assignment.add(prop_id)
                self.assign_type_constraints(constraints[GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE.value], prop_id, ClassFields.VALUE_OF_CONSTS.value)
    
    def assign_type_constraints(self, type_constraints, prop_id, field: str):
        self.assign_prop_to_classes_field(type_constraints[TypeConstFields.INSTANCE_OF.value], prop_id, field)
        self.assign_prop_to_classes_field(type_constraints[TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value], prop_id, field)
        
    def assign_prop_to_classes_field(self, classes_ids_list, prop_id, field: str):
        for class_id in classes_ids_list:
            cls = self.context.classes_dict[class_id]
            cls[field].append(prop_id)
    
    def canBeUsedAsMainValue(self, constraints) -> bool:
        return PropertyScopeValues.index_of(PropertyScopeValues.AS_MAIN) in constraints[GenConstFields.PROPERTY_SCOPE.value]

    def canBeUsedOnItems(self, constraints) -> bool:
        return AllowedEntityTypesValues.index_of(AllowedEntityTypesValues.ITEM) in constraints[GenConstFields.ALLOWED_ENTITY_TYPES.value]
    
    def isAllowedDatatype(self, wd_property) -> bool:
        datatype = wd_property[PropertyFields.DATATYPE.value]
        return datatype != Datatypes.index_of("wikibase-lexeme") and datatype != Datatypes.index_of("wikibase-sense") and datatype != Datatypes.index_of("wikibase-form") and datatype != Datatypes.index_of("wikibase-property") 
    
    def isItemProperty(self, constraints) -> bool:
        return ItemConstFields.VALUE_TYPE.value in constraints[GenConstFields.TYPE_DEPENDENT.value]
    
    def report_status(self) -> None:
        self.logger.info(f"Assigned {len(self.marker_set)} subject values and {len(self.object_assignment)} object values")