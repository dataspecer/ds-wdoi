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

The scripts require `.env` file in the `preprocessing` folder with three values:
1. `ES_PASSWD` - a password of the elastic search instance provided with certificate
2. `ES_CERT_PATH` a path to elastic search cerficate
3. `ES_URL` - an url to elastic search instance

Example (notice that `" "` are not used):

    ES_PASSWD=abcdefg
    ES_CERT_PATH=/path/to/http_ca.cert
    ES_URL=https://localhost:1234

- Additional comments:
    - [Docker tutorial](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)
    - Since we are not using Kibana, it is enough to reset the password and copy the certiface out of the image, before using your own.
      - If using the certificate copied from the Elastic, you also need to adjust the client to disable verification.
    - Also to enable connection between Elastic and the Wikidata ontology API service Docker container (unless running without Docker), you need to set up a Docker `bridge`, which then enables to access the Elastic from within the Wikidata ontology API service Docker container.
      - Since now you will be are running two separete docker containers (Elastic and Wikidata ontology API service), we need to connect them via [docker bridge](https://docs.docker.com/network/drivers/bridge/).
        1. create your bridge `docker network create my-bridge`
        2. add to the Elastic container when you start the container by using `--network your_bridge` when running the container
        3. or you can add the `bridge` to the running Elastic container via `docker network connect your_bridge elastic_name` ([guide](https://docs.docker.com/reference/cli/docker/network/connect/))
        4. add the same option to service `--network your_bridge`