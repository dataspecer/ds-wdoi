# Preprocessing

The preprocessing is done in three phases:

1. Extraction of classes and properties Ids into a set.
2. The set is then passes to a second phase which extracts the classes and properties into two files.
3. The extracted classes and properties are then transformed into objects that will serve as input to the server.

> Note: 
> 1. Types of the properties are not checked, since wikidata does not allow to entry value that do not match the type. Such as: placing a property into subclass of statement.
> 2. I consider only the unique values from extracted properties.
> 


## Extraction

The part contains 1. and 2. phase.
The main script is `extraction.py`

- input:
  - a path to the wikidata json dump in bz2 format
  - Example of running:
    
        $> python extraction.py latest-all.json.bz2

- output:
  - `classes.json.bz2`
  - `properties.json.bz2`
  - Each output file contains an json array where on each line is a wikidata entity.
  - Example:

        [
        { ... },
        { ... },
        { ... },
        ...
        ]

- logging:
  - the logging takes place into `info_ex.log` file 

### Extraction comments

- The first phase considers a class as an entity:
  - that is an instance of a metaclass of a class, or
  - that is a value of a instance of property in any item, or
  - that contains a subclass of statement
- The two phases are separate because we do not know which entities are classes
- The output files of the second phase contain reduced entities:
  - It extracts only english `descriptions`, `labels` and `aliases`.
  - `sitelinks` are removed since there is no usage directly to the ontology

## Transformation

The part contain 3. phase which is conducted in two steps.
The first step transforms classes and the second step transforms properties.

- input:
  - a parameter `["cls", "props", "both"]`
    - based on the parameter either the first or the second phase is skipped.
    - for conducting only specific transformation:
      - classes transformation - use `cls`
      - properties transformation - use `props`
      - for both transformations - use `both`
  - a path to `classes.json.bz2` and `properties.json.bz2` in the given order

        $> python transformation.py both classes.json.bz2 properties.json.bz2


- output:
  - `classes.json`
  - `properties.json`
  - the files are in the same format as in phase 1. 2. except there are not compressed

- logging:
  - the logging takes place into `info_tr.log` file  


### Transformation comments

- What might be a good idea to add?
  - exact match (external ontology mapping)
  - external subproperty of (external ontology mapping)
  - external superproperty of (external ontology mapping)
  - part of / has parts?
  - facet of
  - constraints for other types than item

- For classes it extracts:
  - labels
  - descriptions
  - instance of values
  - subclass of values
  - properties for this type
  - equivalent class (external ontology mapping)
- For properties it extracts
  - labels
  - descriptions
  - datatype
  - underlying type
  - instance of values
  - subproperty of values
  - related property values
  - equivalent property (external ontology mapping)
  - constraints
    - general:
      - property scope
      - allowed entity types
      - conflicts with
      - item requires statement
      - subject types
    - types based:
      - item:
        - value type
        - none of / one of
        - inverse 
        - symmetric
        - value requires statement
      - string:
      - quantity:
      - time:

- Each time entity ids are used, it transformes them into numeric values to reduce the number of strings inside application that further processed the data.
- The application needs to know whether the ids are of a class or of a property.
- The extraction of constraints contain:
  - general constraints:
    - property scope - allowed placement usage - main value, qualifier, reference
    - allowed entity types - the property can be used on certain entity types - for us only Item is main focus
    - conflicts with - contains a map of property: [ids] which denotes that if the property is used, the property from the constraint cannot be used or cannot be used with the given values
    - item requires statement - the negation of conflicts with
    - subject type
  - type based constraints - so far I extracted the constraints for properties of type item
    - value type
    - none of/ one of - codelists that point to any item from the wikidata
    - inverse - property, exactly one or nothing
    - symmetric - whether the property is symmetric
    - value requires statement