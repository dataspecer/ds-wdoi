# JSON extractors

- The folder contains function to extract data from the Wikidata json dump file following the json [the Wikidata dump JSON format](https://doc.wikimedia.org/Wikibase/master/php/docs_topics_json.html).
    - `wd_fields` serves as extractor of each json entity root fields
    - `wd_statements` contains functions for extracting statement values of the entities
        - for our purposes we only need to extract entity identifier values and string values
    - `wd_constraints` contains function for extracting constraints qualifiers values
    - `wd_languages` contains function to extract Wikidata language objects (labels, descriptions, aliases)