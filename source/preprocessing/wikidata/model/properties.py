from enum import StrEnum
from enum import IntEnum
from enum import Enum
class UnderlyingTypes(IntEnum):
    ENTITY = 0
    STRING = 1
    TIME = 2
    QUANTITY = 3
    GLOBE_COORDINATE = 4
    
class Datatypes(StrEnum):
    ITEM = ("wikibase-item", UnderlyingTypes.ENTITY)	
    PROPERTY = ("wikibase-property", UnderlyingTypes.ENTITY)
    LEXEME = ("wikibase-lexeme", UnderlyingTypes.ENTITY)	
    SENSE = ("wikibase-sense", UnderlyingTypes.ENTITY)	
    FORM = ("wikibase-form", UnderlyingTypes.ENTITY	)
    MONOLINGUAL_TEXT = ("monolingualtext", UnderlyingTypes.STRING)
    STRING = ("string", UnderlyingTypes.STRING)
    EXTERNAL_IDENTIFIER = ("external-id", UnderlyingTypes.STRING)
    URL = ("url", UnderlyingTypes.STRING)	
    COMMONS_MEDIA_FILE = ("commonsMedia", UnderlyingTypes.STRING)
    GEOGRAPHIC_SHAPE = ("geo-shape", UnderlyingTypes.STRING)
    TABULAR_DATA = ("tabular-data", UnderlyingTypes.STRING)
    MATHEMATICAL_EXPRESSION = ("math", UnderlyingTypes.STRING)	
    MUSICAL_NOTATION = ("musical-notation", UnderlyingTypes.STRING)
    QUANTITY = ("quantity", UnderlyingTypes.QUANTITY)
    POINT_IN_TIME = ("time", UnderlyingTypes.TIME)
    GEOGRAPHIC_COORDINATES = ("globe-coordinate", UnderlyingTypes.GLOBE_COORDINATE)
    
    def __new__(cls, value: str, type: UnderlyingTypes):
        obj = str.__new__(cls, value)
        obj._value_ = value
        obj.underlyingType = type
        return obj
    
    @classmethod
    def index_of(cls, value: str):
        for idx, item in enumerate(cls):
            if item.value == value:
                return idx
        raise ValueError(f"{value} is missing from {cls.__name__}.")
    
    @classmethod
    def type_of(cls, value: str):
        for idx, item in enumerate(cls):
            if item.value == value:
                return item.underlyingType
        raise ValueError(f"{value} is missing from {cls.__name__}.")
    
class Properties(StrEnum):
    SUBCLASS_OF = "P279", UnderlyingTypes.ENTITY
    INSTANCE_OF = "P31", UnderlyingTypes.ENTITY
    SUBPROPERTY_OF = "P1647", UnderlyingTypes.ENTITY
    PROPERTIES_FOR_THIS_TYPE = "P1963", UnderlyingTypes.ENTITY
    EQUIVALENT_CLASS = "P1709", UnderlyingTypes.STRING
    EQUIVALENT_PROPERTY = "P1628", UnderlyingTypes.STRING
    RELATED_PROPERTY = "P1659", UnderlyingTypes.ENTITY
    PROPERTY_CONSTRAINT = "P2302", UnderlyingTypes.ENTITY
    PROPERTY_SCOPE = "P5314", UnderlyingTypes.ENTITY
    ITEM_OF_PROPERTY_CONSTRAINT = "P2305", UnderlyingTypes.ENTITY
    PROPERTY = "P2306", UnderlyingTypes.ENTITY
    RELATION = "P2309", UnderlyingTypes.ENTITY
    CLASS = "P2308", UnderlyingTypes.ENTITY
    
    def __new__(cls, value: str, type: UnderlyingTypes):
        obj =  str.__new__(cls, value)
        obj._value_ = value
        obj.underlyingType = type
        return obj
    