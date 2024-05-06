# Wdio API service

The service is an API of the Wikidata ontoloyg.
It loads the preprocessed ontology into a memory and provides access APIs.

- Structure of this readme:
  - Implementation
  - How to run the service.

# Implementation

Is implemented as Node.js server with Fastify and Typescript.

![missing picture](./readme-pictures/backend.png)

- The service is devided into two main components:
  1. Service API
  2. In-memory ontology
  3. Hierarchy algorithms
  4. Class search

## Service API With Fastify

Abstractions based on `fastify`.

- The server is asynchronously started by `fastify`.
  - Opon start up `fastify` will initialize the `WdOntology` class by loading the preprocessed ontology into memory.
  - Logging is configured based on dev/prod builds.
    - Internally it uses pinojs for logging.
    - During development it uses `pino-pretty`.
    - In production it logs into a file `log.log`.
- Routes are created as a plugin into `fastify`.
- Each route contains a schema of the route output, that is done in order to increase performance of serialization of the data.
  - We are using `json-schema-to-ts` as a means to write json schemas for the routes responses.
  - There are [multiple ways](https://fastify.dev/docs/latest/Reference/TypeScript/) how to do it.
- The API returns `fastify` errors when an unexisting entity is accessed.
  - For more on errors visit [docs](https://fastify.dev/docs/latest/Reference/Errors/).

## Ontology

The ontology is represented by the class `WdOntology`.
It loads the preprocessed ontology into a memory and creates API for the `fastify` routes.

- Structure:
  - `entities`
    - Contains Wikidata entities to be loaded from the preprocessed files.
  - `hierarchy-walker`
    - Implements walking of the class hierarchy (parents/children).
    - Enables using extractor for each passed class in the hierarchy.
  - `loading`
    - Loads preprocessed entities into a intermediate format, which is then used for constructing the Wikidata entities.
  - `search`
    - Implements searching based on string.
    - Contains client to the ElasticSearch
  - `surroundings`
    - Implements walking the surroundings.
    - `domains-ranges` - implements extractors and functions for obtaining domains or ranges for a specific class and a property, the class defines the final ordering of the returned properties.
    - `filter-by-instance` - runs the SPARQL query for obtaining filter from an instance.
    - `hierarchy-with-properties` - implements extractor to obtain and sort properties, including inherited, for a specific class.
  - `wd-ontology.ts`
    - Provides API for the `fastify` routes.
    - Provides implementation of simpler methods and composists of all more complex classes (e.g. hierarchy walking and surroundings).
  - `expose-to-fastify.ts`
    - Loads Wikidata ontology as a plugin into `fastify`.

### In-memory ontology

- The ontology is loaded into memory from a file upon startup of the node.js process.
- The loading is implemented inside `./src/ontology/loading` folder.
  - The folder contains the loading function and special entities that represent entities inside the preprocessed files. The special entities are then used in constructors of the final entities inside the ontology (folder `./src/ontology/entities`).
  - Process:
    1. The preprocessed files are read line by line, each time parsing an entity from the line and mapping it into the special entity type.
    2. The newly mapped entity is then passed to a construtor for the final entity.
       - This serves as a possibility to exclude some information from the preprocessed files.
    3. The final entity is stored inside a map to be accessed when dereferencing an entity id.
       - During loading, we use static constants for empty fields of the entities, to reduce memory footprint.

<br>

The ontology is comprised of classes and properties.
Each entity has its own map for dereferencing entity ids.
For properties right now we do not store any constraints except the merged usage statistics with property constraints - since they are used in the hierarchy algorithms.

### Hierarchy algorithms

- The hierarchy algorithms are based on walking the subclass of hierarchy of classes.
- Class hierarchy
  - The main algorithm is inside `hierarchy-walker` folder.
    - It enables to provide an extractor which is passed each passed class during the hierarchy walk.
    - It defaults to obtaining parent/children classes.
- Surroundings
  - Implementation of obtaining surroundings of an entity. Mostly used for class surroundings, which obtains available properties and parent hierarchy.
  - `hierarchy-with-properties`
    - Implements extractor for obtaining all properties from a class (including its hierarchy).
    - The extractor sorts the properties based on the score from preprocessing.
  - `one-distance-desc`
    - Implements surroundings of an entity in one distance (one edge step).
    - For a class it obtains available properties and subclasses.
    - For a property it obtains related properties and domains and ranges.
  - `domains-ranges`
    - Implements methods for obtaining domains and ranges for a property and a class.
    - Given a class and a property, the implementation returns all domains/ranges for a property, sorted based on the scores from the class.
      - Meaning if the property has ranges inside the class `subjectOf`/`valueOf` fields, the ranges are used as a priority and then the rest of the domains/ranges are used.
  - `filter-by-instance`
    - Provided with instance URI of a Wikidata entity. It obtains properties and their ranges, which can be used as a filter for surroundings.
    - Assuming the entity is instance and not a class (with the class it would never finish the query).

### Search

- Seach contains Elastic search client and Wikidata client.
- Search process:

  1. Search class obtains the query.
  2. Search class queries Elastic search and Wikidata Actions API.
  3. The results are merged:
     - Results from Wikdiata Action API are checked if they are classes.
     - If they are classes, they will be returned to the client, if not they are discarded.
     - The results are then concatenated with the results from the Elastic search.

- This was done in order to obtain priority from Wikidata itself, while keeping the returned classes consistent with the ontology.

# How to run the service.

## Requirements and installing

- Node.js v20 and above
- To install dependencies: `npm run install`
- Assuming there is running Elastic search service.
- Memory:
  - The service for about 4M classes and 11K properties requires at least 3.2 GB.
  - Depending on the Wikidata dump.

## Input files and .env

The input is handled via `.env` file.

    ES_NODE='https://localhost:9200'
    ES_PASSWD='password'
    ES_CERT_PATH='absolute/path/to/http_ca.crt'
    CLASSES_PATH='absolute/path/to/preprocessed/classes/file.json'
    PROPERTIES_PATH='absolute/path/to/preprocessed/properties/file.json'

- The service expects two files from preprocessing phase `CLASSES_PATH` and `PROPERTIES_PATH` in json format.
  - The files should be output from the 5. phase (Property recommendations).
- `ES_*` contain access information to the Elastic search instance.
  - This information is equivalent to the one used in the preprocessing pipeline, please refer to the documentation there.

## Logging

During development everything is logged using `pinojs` and `pino-pretty` into console.
During production everything is logged into `log.log` file.

## Docker

docker build -t wdio .

sudo docker run --network wdoi_bridge \
 -p 3042:3042 \
 -e ES_NODE="https://elastic:9200" \
 -e ES_PASSWD="" \
 --mount type=bind,source=/home/gora/ds-wdoi/source/preprocessing/classes-recs.json,target=/app/input_data/classes-recs.json,readonly \
 --mount type=bind,source=/home/gora/ds-wdoi/source/preprocessing/properties-recs.json,target=/app/input_data/properties-recs.json,readonly \
 --mount type=bind,source=/home/gora/http_ca2.crt,target=/app/input_data/http_ca.crt,readonly \
 --name wdoi_service wdoi_image
