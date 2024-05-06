from enum import StrEnum

class GenConstFields(StrEnum):
  # Array of numeric identifiers of scopes of a property - statement, reference, qualifier.
  # Mapping are in the Wikidata model. 
  PROPERTY_SCOPE  = "propertyScope"
  # Array of numeric identifiers of allowed types of a property - item, propery, lexemes... 
  # Mapping are in the Wikidata model. 
  ALLOWED_ENTITY_TYPES  = "allowedEntityTypes"
  # Array of numeric identifiers of allowed property qualifiers (properties). 
  ALLOWED_QUALIFIERS  = "allowedQualifiers"
  # Array of numeric identifiers of compulsory property qualifiers (properties). 
  REQUIRED_QUALIFIERS  = "requiredQualifiers"
  # A map of (propertyId): [classId, ...] that the property conflicts with on item.
  CONFLICTS_WITH  = "conflictsWith"
  # A map of (propertyId): [classId, ...] that the item requires additional statement with this property.
  ITEM_REQUIRES_STATEMENT  = "itemRequiresStatement"
  # Contains type dependent constraints, so far only item constraints.
  TYPE_DEPENDENT  = "typeDependent"
  # Contains {instanceOf: [classId,..], subclassOf: [classId, ...], subclassOfInstanceOf: [classId,...]} based on the subject constriant.
  SUBJECT_TYPE  = "subjectType"
  
  # Added in modification phase.
  # Contains numeric identifiers of classes that are domain of this property based on property usage statistics.
  # Sorted based on scores from the statistics computation
  # After property recommendation phase contains merged classes with property constraints.
  SUBJECT_TYPE_STATS = "subjectTypeStats"
  
class ItemConstFields(StrEnum):
  # Contains {instanceOf: [classId,..], subclassOf: [classId, ...], subclassOfInstanceOf: [classId,...]} based on the value constraint.
  VALUE_TYPE = "valueType"
  # Added in modification phase.
  # Contains numeric identifiers of classes that are range of this property based on property usage statistics.
  # Sorted based on scores from the statistics computation
  # After property recommendation phase contains merged classes with property constraints.
  VALUE_TYPE_STATS = "valueTypeStats"
  # An equivalent of ITEM_REQUIRES_STATEMENT for range.
  VALUE_REQUIRES_STATEMENT = "valueRequiresStatement"
  IS_SYMETRIC = "isSymmetric"
  # Contains numeric identifiers of classes that the property can have as a value.
  ONE_OF = "oneOf"
  # Contains numeric identifiers of classes that the property cannot have as a value.
  NONE_OF = "noneOf"
  # A numeric identifier of property that is inverse.
  INVERSE = "inverse"
  
class TypeConstFields(StrEnum):
  INSTANCE_OF = "instanceOf"
  SUBCLASS_OF = "subclassOf"
  INSTANCE_OF_SUBCLASS_OF = "subclassOfInstanceOf"