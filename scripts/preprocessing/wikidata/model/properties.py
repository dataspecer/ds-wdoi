from enum import StrEnum
from enum import IntEnum
from enum import Enum



class Properties(StrEnum):
    SUBCLASS_OF = "P279"
    INSTANCE_OF = "P31"
    SUBPROPERTY_OF = "P1647"
    PROPERTIES_FOR_THIS_TYPE = "P1963"
    EQUIVALENT_CLASS = "P1709"
    EQUIVALENT_PROPERTY = "P1628"
    RELATED_PROPERTY = "P1659"
    PROPERTY_CONSTRAINT = "P2302"
    
class UnderlyingTypes(IntEnum):
    ENTITY = 0
    STRING = 1
    TIME = 2
    QUANTITY = 3
    GLOBE_COORDINATE = 4
    
class Datatypes(Enum):
    ITEM = ("wikibase-item", UnderlyingTypes.ENTITY)	
    PROPERTY = ("wikibase-property", UnderlyingTypes.ENTITY	)
    LEXEME = ("wikibase-lexeme", UnderlyingTypes.ENTITY)	
    SENSE = ("wikibase-sense", UnderlyingTypes.ENTITY)	
    FORM = ("wikibase-form", UnderlyingTypes.ENTITY	)
    MONOLINGUAL_TEXT = ("monolingualtext", UnderlyingTypes.STRING)
    STRING =( "string", UnderlyingTypes.STRING)
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
    
    @classmethod
    def index_of(cls, value: str):
        for idx, item in enumerate(cls):
            if item.value[0] == value:
                return idx
        raise ValueError(f"{value} is missing from Datatypes.")
    
    @classmethod
    def type_of(cls, value: str):
        for idx, item in enumerate(cls):
            if item.value[0] == value:
                return item.value[1]
        raise ValueError(f"{value} is missing from Datatypes.")