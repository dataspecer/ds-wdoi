from enum import StrEnum

class GeneralConstraints(StrEnum):
    PROPERTY_SCOPE = "Q53869507"
    ALLOWED_ENTITY_TYPES = "Q52004125"
    SUBJECT_TYPE = "Q21503250"
    CONFLICTS_WITH = "Q21502838"
    ITEM_REQUIRES_STATEMENT = "Q21503247"
    SINGLE_VALUE = "Q19474404"
    SINGLE_BEST_VALUE = "Q52060874"
    MULTI_VALUE = "Q21510857"
    DISTINCT_VALUES = "Q21502410"
    ALLOWED_QUALIFIERS = "Q21510851"
    REQUIRED_QUALIFIERS = "Q21510856"
    
class ItemDatatypeConstraints(StrEnum):
    VALUE_TYPE = "Q21510865"
    ONE_OF = "Q21510859"
    NONE_OF =  "Q52558054"
    VALUE_REQUIRES_STATEMENT = "Q21510864"
    SYMMETRIC = "Q21510862"
    INVERSE = "Q21510855"
    
class StringDatatypeConstraints(StrEnum):
    FORMAT = "Q21502404"
    
class QuantityDatatypeConstraints(StrEnum):
    INTEGER = "Q52848401"
    ALLOWED_UNITS = "Q21514353"
    NO_BOUNDS = "Q51723761"
    RANGE = "Q21510860"
    DIFFERENCE_WITHIN_RANGE = "Q21510854"
    
class TimeDatatypeConstraints(StrEnum):
    RANGE = "Q21510860"
    DIFFERENCE_WITHIN_RANGE = "Q21510854"
    
    
# Allowed values for specific constraints


class PropertyScopeValues(StrEnum):
    AS_MAIN = "Q54828448"
    AS_QUALIFIER = "Q54828449"
    AS_REFERENCE = "Q54828450"
    
    @classmethod
    def index_of(cls, value: str):
        for idx, item in enumerate(cls):
            if item == value:
                return idx
        raise ValueError(f"{value} is missing from {cls.__name__}.")

class AllowedEntityTypesValues(StrEnum):
    ITEM = "Q29934200"
    PROPERTY = "Q29934218"
    LEXEME = "Q51885771"
    FORM = "Q54285143"
    SENSE = "Q54285715"
    MEDIA_INFO = "Q59712033"
    
    @classmethod
    def index_of(cls, value: str):
        for idx, item in enumerate(cls):
            if item == value:
                return idx
        raise ValueError(f"{value} is missing from {cls.__name__}.")

class SubjectValueRelationsValues(StrEnum):
    INSTANCE_OF = "Q21503252"
    SUBCLASS_OF = "Q21514624"
    SUBCLASS_OF_INSTANCE_OF = "Q30208840"
    
    @classmethod
    def index_of(cls, value: str):
        for idx, item in enumerate(cls):
            if item == value:
                return idx
        raise ValueError(f"{value} is missing from {cls.__name__}.")



