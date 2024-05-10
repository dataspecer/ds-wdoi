# Extraction phase

The part contain 3. phase which is conducted in two steps - class extraction and property extraction.
The phase extracts the data from the Wikidata model into a simplified data model (located in the `core.model_simplified`).
The simplified model is simply a flattening of the hierarchical Wikidata model, while picking up only certain information from the entities. 

- The values of properties inside the Wikidata model are not checked, since Wikidata do not allow to use invalid values for properties (e.g. using an item for a string property).
- To find out what is extract for each entity, confront the the extraction methods for a class and for a property.
- The fields representing other entities (e.g. `subclassOf`) are storing only number identifiers.
    - The application needs to know whether it is a property or a class.
- We deviced an artificial entity for constraints `Q0` which denotes empty entity.
    - It is identifier is simply `0`.
    - Sometimes value of an contraint (even all other properties) can be `no value` or `some value`, while `some value` is no importance to us, `no value` can be significant for contraints (refer to [no value/some value](https://www.mediawiki.org/wiki/Wikibase/DataModel)).
- During extract we exluded depracated ranks of the statements.
- **Note that not all the fields present in the simplified model exist in this phase, some of them are added later during modification, consult the function for extraction what exactly is returned.**
- The phase extracts only Enlighs language information from the entities.
  - In case other language were added in the future, the English language must always be present.
    - That is done in order to always have certain specific classes present in the ontology (e.g. the root entity).
    - More on the issue can be found in the modification phase readme - removing classes with no label.

## Extraction comments

- The language option denotes that it extracts and includes only `aliases`, `descriptions` and `labels` in the selected languages.
- Each time entity ids are used, it transforms them into numeric values to reduce the number of strings inside application that further processes the data.
- For classes it extracts:
  - id
  - iri
  - aliases
  - labels
  - descriptions
  - instance of values
  - subclass of values
  - properties for this type
  - equivalent class (external ontology mapping)
- For properties it extracts:
  - id
  - iri
  - aliases
  - labels
  - descriptions
  - datatype - [higher level types](https://www.wikidata.org/wiki/Help:Data_type)
  - underlying type - [low level types](https://www.wikidata.org/wiki/Help:Data_type#Properties_by_type)
  - instance of values
  - subproperty of values
  - related property values
  - inverse property values
  - complementary property values
  - negates property values
  - equivalent property (external ontology mapping)
  - [constraints](https://www.wikidata.org/wiki/Help:Property_constraints_portal)
    - Even though we use only subject type and value type constraints, we extract also the most of the rest for possible future purposes.
    - general constraints:
      - property scope - allowed placement usage - main value, qualifier, reference
      - allowed entity types - the property can be used on certain entity types - for us only item is the main focus
      - conflicts with - contains a map of `(key=property): (value=[ids])` pairs which denotes that if the property is used, the property from the constraint cannot be used or cannot be used with the given values
      - item requires statement - the negation of conflicts with
      - subject type - contains fields based on usage instance of, subclass of, or a instance of + subclass of (note this is not combincation of the first two fields, it is a separate field with different values)
      - value type based:
        - item:
          - value type
          - none of / one of
          - inverse 
          - symmetric
          - value requires statement
        - string: (empty)
        - quantity: (empty)
        - time: (empty)