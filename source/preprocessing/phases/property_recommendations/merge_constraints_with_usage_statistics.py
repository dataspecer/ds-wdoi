from core.model_wikidata.properties import UnderlyingTypes
from core.model_simplified.properties import PropertyFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields, TypeConstFields

def merge_property_constraints_with_usage_statistics(classes_dict: dict, properties_dict: dict):
    for property_id, property in properties_dict.items():
        if property[PropertyFields.UNDERLYING_TYPE.value] == UnderlyingTypes.ENTITY:
            pass
        else:
            pass
        
def __merge_with_literal_property(property, classes_dict: dict):
    subjectTypeConstraint = property[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE.value]
    domain_classes = subjectTypeConstraint[TypeConstFields.INSTANCE_OF.value] + subjectTypeConstraint[TypeConstFields.INSTANCE_OF_SUBCLASS_OF]
    
    
    