# Preprocessing

The preprocessing is done in three phases:

1. Extraction of classes and properties Ids into a set.
2. The set is then passes to a second phase which extracts the classes and properties into two files.
3. The extracted classes and properties are then transformed into objects that will serve as input to the server.
4. Load labels, aliases and description into a search service (Elastic search right now).

> Note: 
> 1. Types of the properties are not checked, since wikidata does not allow to entry value that do not match the type. Such as: placing a property into subclass of statement.
> 2. I consider only the unique values from extracted properties.

## Extraction (1. and 2. phase)

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

- The first phase considers a class as an entity (an exhaustive list):
  - that is an instance of a metaclass of a class, or
  - that is a value of a instance of property in any item, or
  - that is a value of a subclass of property in any item, or
  - that contains a subclass of statement
- The two phases are separate because we do not know which entities are classes
- The output files of the second phase contain reduced entities:
  - `sitelinks` are removed since there is no usage directly to the ontology

## Transformation (3. phase)

The part contain 3. phase which is conducted in two steps.
The first step transforms classes and the second step transforms properties.

- input:
  - optional argument for languages extracration
    - `--lang`
    - accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - defaults to `--lang en`
    - for available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
  - a required parameter one of `["cls", "props", "both"]`
    - based on the parameter either the first or the second phase is skipped.
    - for conducting only specific transformation:
      - classes transformation - use `cls`
      - properties transformation - use `props`
      - for both transformations - use `both`
  - required paths to `classes.json.bz2` and `properties.json.bz2` in the given order

        $> python transformation.py both classes.json.bz2 properties.json.bz2

        or

        $> python transformation.py --langs en -- both classes.json.bz2 properties.json.bz2


- output:
  - `classes.json`
  - `properties.json`
  - the files are in the same format as in phase 1. 2. except there are not compressed

- logging:
  - the logging takes place into `info_tr.log` file 


### Transformation comments

- The language option denotes that it transforms and includes only `aliases`, `descriptions` and `labels` in the selected languages.
- Each time entity ids are used, it transformes them into numeric values to reduce the number of strings inside application that further processed the data.
  - The application needs to know whether the ids are of a class or of a property.
- For classes it includes:
  - aliases
  - labels
  - descriptions
  - instance of values
  - subclass of values
  - properties for this type
  - equivalent class (external ontology mapping)
- For properties it includes:
  - aliases
  - labels
  - descriptions
  - datatype
  - underlying type
  - instance of values
  - subproperty of values
  - related property values
  - equivalent property (external ontology mapping)
  - constraints
    - general constraints:
      - property scope - allowed placement usage - main value, qualifier, reference
      - allowed entity types - the property can be used on certain entity types - for us only Item is main focus
      - conflicts with - contains a map of `(key=property): (value=[ids])` pairs which denotes that if the property is used, the property from the constraint cannot be used or cannot be used with the given values
      - item requires statement - the negation of conflicts with
      - subject type
      - types based:
        - item:
          - value type
          - none of / one of
          - inverse 
          - symmetric
          - value requires statement
        - string: (empty)
        - quantity: (empty)
        - time: (empty)
- What might be a good idea to add?
  - exact match (external ontology mapping)
  - external subproperty of (external ontology mapping)
  - external superproperty of (external ontology mapping)
  - part of / has parts?
  - facet of
  - constraints for other types than item

## Loading into search service (4. phase)

The phase loads labels, descriptions and aliases into a search service - elastic search. Assuming the Elastic search runs on client from `utils.elastic_search.py` .

- inputs:
  - optional argument for languages extracration
    - `--lang`
    - accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - defaults to `--lang en`
    - for available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
    - it should be the same value as was given in the previous phase.
  - paths to the two files generated in the previous step - `classes.json` and `properties.json`

        $> python loading.py classes.json properties.json
- outputs:
  - none

- logging:
  - the logging takes place into `info_load.log` file 
### Loading comments

For each Wikidata entity an object is generated that serves as an input to the Elastic search instance.
The object contains descriptions, labels and aliases for all the selected languguages. 
Each language has its own nested object with the above mentioned fields.
If the values are missing from the Wikidata entity, a default value is used - empty string for description and label, empty array for aliases.