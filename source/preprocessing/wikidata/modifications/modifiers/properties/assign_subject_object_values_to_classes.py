from wikidata.modifications.modifier import Modifier
from wikidata.modifications.context import Context
from wikidata.modifications.modifiers.classes.add_fields import *
from wikidata.model.constraints import *
from wikidata.model.properties import *

class AssignSubjectValueToClasses(Modifier):
    def __init__(self, logger) -> None:
        super().__init__(logger.getChild("assign-subject-object"))
        self.object_assignment = set()

    def __call__(self, wd_entity, context: Context) -> None:
        prop_id = wd_entity["id"]
        constraints = wd_entity["constraints"]
        if self.canBeUsedAsMainValue(constraints) and self.canBeUsedOnItems(constraints) and self.datatypeIsNotLexical(wd_entity):
            self.marker_set.add(prop_id)
            self.assign_type_constraints(constraints["subjectType"], prop_id, SUBJECT_OF_FIELD, context)
            
            if self.isItemProperty(constraints):
                self.object_assignment.add(prop_id)
                self.assign_type_constraints(constraints["typeDependent"]["valueType"], prop_id, VALUE_OF_FIELD, context)
    
    def assign_type_constraints(self, type_constraints, prop_id, field: str, context: Context):
        self.assign_prop_to_classes_field(type_constraints["instanceOf"], prop_id, field, context)
        self.assign_prop_to_classes_field(type_constraints["subclassOfInstanceOf"], prop_id, field, context)
        
    def assign_prop_to_classes_field(self, classes_ids_list, prop_id, field: str, context: Context):
        for class_id in classes_ids_list:
            cls = context.class_map[class_id]
            cls[field].append(prop_id)
    
    def canBeUsedAsMainValue(self, constraints) -> bool:
        return PropertyScopeValues.index_of(PropertyScopeValues.AS_MAIN) in constraints["propertyScope"]

    def canBeUsedOnItems(self, constraints) -> bool:
        return AllowedEntityTypesValues.index_of(AllowedEntityTypesValues.ITEM) in constraints["allowedEntityTypes"]
    
    def datatypeIsNotLexical(self, property) -> bool:
        datatype = property["datatype"]
        return datatype != Datatypes.index_of("wikibase-lexeme") and datatype != Datatypes.index_of("wikibase-sense") and datatype != Datatypes.index_of("wikibase-form")
    
    def isItemProperty(self, constraints) -> bool:
        return "valueType" in constraints["typeDependent"]
    
    def report_status(self) -> None:
        self.logger.info(f"Assigned {len(self.marker_set)} subject values and {len(self.object_assignment)} object values")