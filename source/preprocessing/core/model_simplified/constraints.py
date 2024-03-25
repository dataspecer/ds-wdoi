from enum import StrEnum

class GenConstFields(StrEnum):
  PROPERTY_SCOPE  = "propertyScope"
  ALLOWED_ENTITY_TYPES  = "allowedEntityTypes"
  ALLOWED_QUALIFIERS  = "allowedQualifiers"
  REQUIRED_QUALIFIERS  = "requiredQualifiers"
  CONFLICTS_WITH  = "conflictsWith"
  ITEM_REQUIRES_STATEMENT  = "itemRequiresStatement"
  TYPE_DEPENDENT  = "typeDependent"
  SUBJECT_TYPE  = "subjectType"
  SUBJECT_TYPE_STATS = "subjectTypeStats"
  
class ItemConstFields(StrEnum):
  VALUE_TYPE = "valueType"
  VALUE_TYPE_STATS = "valueTypeStats"
  VALUE_REQUIRES_STATEMENT = "valueRequiresStatement"
  IS_SYMETRIC = "isSymmetric"
  ONE_OF = "oneOf"
  NONE_OF = "noneOf"
  INVERSE = "inverse"
  
class TypeConstFields(StrEnum):
  INSTANCE_OF = "instanceOf"
  SUBCLASS_OF = "subclassOf"
  INSTANCE_OF_SUBCLASS_OF = "subclassOfInstanceOf"