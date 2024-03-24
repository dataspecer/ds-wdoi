from enum import StrEnum

class PropertyFields(StrEnum):
 ID = "id"
 IRI = "iri"
 ALIASES = "aliases"
 LABELS = "labels"
 DESCRIPTIONS = "descriptions"
 DATATYPE = "datatype"
 UNDERLYING_TYPE = "underlyingType"
 INSTANCE_OF = "instanceOf"
 SUBPROPERTY_OF = "subpropertyOf"
 RELATED_PROPERTY = "relatedProperty"
 INVERSE_PROPERTY = "inverseProperty"
 COMPLEMENTARY_PROPERTY = "complementaryProperty"
 NEGATES_PROPERTY = "negatesProperty"
 EQUIVALENT_PROPERTY = "equivalentProperty"
 CONSTRAINTS = "constraints"
 SUBPROPERTIES = 'subproperties'