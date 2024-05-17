# Loading phase

The phase loads labels and aliases into a search service - elastic search. Assuming the Elastic search runs on client from `utils.elastic_search.py`.

- For each Wikidata entity an object is generated that serves as an input to the Elastic search instance.
- The object contains labels and aliases for the English language. 
- There could be also descriptions but the search somehow was overtaken by the descriptions and resulted in not so relevant class search.
- In case multiple languages were added in the future:
  - It assumes that the English labels are always present. 
  - Each language must have its own specific field inside the object and assigned analyzer from the `elastic_search_config.py`.
  - If the values are missing from the Wikidata entity, a default value is used - empty string for description and label, empty array for aliases.

## Elastic search

- Assuming we are running elastic docker image.
- Creating the index
    - The indeces are creating from the helper function of `elastic_search_helpers.py`
    - The function must be run before using the loading phase.
    - When a new data comes in, the old index must be destroyed and created again.
    - It uses dynamic templates to map language string to specific analyzers (`elastic_search_config.py`).
- For setting up visit the parent folders.