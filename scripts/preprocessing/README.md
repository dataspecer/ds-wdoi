# Preprocessing

The preprocessing is done in three phases:

1. Extraction of classes and properties Ids into a set.
2. The set is then passes to a second phase which extracts the classes and properties into two files.
3. The extracted classes and properties are then transformed into objects that will serve as input to the server.

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