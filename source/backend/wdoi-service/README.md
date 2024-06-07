# Wdio API service

The service is an API of the Wikidata ontology.
It loads the preprocessed ontology into a memory and provides access APIs.

- Structure of this readme:
  - Implementation
  - How to run the service.

# Implementation

Is implemented as Node.js server with Fastify and Typescript.

![missing picture](./readme-pictures/backend.png)

- The service is devided into four main components:
  1. Service API
  2. In-memory ontology
  3. Hierarchy algorithms
  4. Class search

## Service API with Fastify

- Abstractions are based on `fastify` model.

  - Everything is a plugin.
  - Working with typescript requires typings for routes and augmentations for hooks and decorators ([guide](https://fastify.dev/docs/latest/Reference/TypeScript/)).

- The server is asynchronously started by `fastify` by loading all plugins into `FastifyInstance` inside `app.ts` file.
  - Opon start up, `fastify` will initialize the `WdOntology` class by loading the preprocessed ontology into memory from specified files inside environment variables.
  - Logging is configured based on development/production builds.
    - Internally it uses `pinojs` for logging.
    - During development it uses `pino-pretty`.
    - In production the format is leaner.
- Routes are created as a plugin into `fastify`.
  - Three main routes:
    - `/documentation` serves dynamically create swagger API as a static page.
    - `/restart` enables restart of the `fastify` server, to reload a new ontology from files (assuming they got updated).
    - Routes with a `/api/v3` prefix contain API for the Wikidata ontology.
  - Each route contains a schema of the route output, that is done in order to increase performance of serialization of the data and to allow typescript in the request/response.
    - Internally, it uses `fast-json-stringtify`.
    - We are using `json-schema-to-ts` as a means to write json schemas for the routes responses and requests.
    - There are [multiple ways](https://fastify.dev/docs/latest/Reference/TypeScript/) how to do it.
    - The API returns `fastify` errors when an unexisting entity is accessed.
      - For more on errors visit [docs](https://fastify.dev/docs/latest/Reference/Errors/).
- Host and ports:
  - For running inside docker, the `host` needs to be set to `0.0.0.0` otherwise the `fastify` will not connect to the outside.
  - During development, it defaults to `localhost`.
  - Port is set to `3042`.

### Restarting == Load new data

- The route `/restart` was created to enable restart of the `fastify` server which results in loading the ontology files again.
- Assuming that the files got updated, the new ontology is loaded to the server.
- The route requires a `RESTART_KEY` which authorizes the restart, since the route is exposed to the internet.
  - There are surely better ways how to secure a route.
  - For our purposes, since the restart is done only from the internal network, we deemed it sufficient for the enviroment we are presented with.

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
  - `entity-details`
    - Implements entity detail.
    - For a class it obtains available properties and subclasses from the ancestors hierarchy.
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

# How to run the service

## Requirements and installing

- Node.js v20 and above
- To install dependencies: `npm run install`
- Assuming there is running Elastic search service (read below about `.env` and docker images).
- Memory:
  - The service for about 4M classes and 11K properties requires at least 3.2 GB.
  - The reduced ontology contains about 830K classes and requires at least 1.9 GB.

## Running during development

The input is handled via `.env` file during development. In conteinerized application, the variables are handled via `docker run -e "..."` or inside `docker compose`.

- Environment variales:

      SEARCH_CLASSES_ENDPOINT='http://localhost:3062/search-classes'
      SEARCH_PROPERTIES_ENDPOINT='http://localhost:3062/search-properties'
      CLASSES_PATH='/path/to/preprocessed/classes/file.json'
      PROPERTIES_PATH='/path/to/preprocessed/properties/file.json'
      RESTART_KEY="1234567"

- The service expects two files from preprocessing phase `CLASSES_PATH` and `PROPERTIES_PATH` in json format.
  - The files should be output from the 5. phase (Property recommendations), or other, but the loading must be adjusted to the specific phase output format.
- The assumptions is that there is a running Search service instance with the endpoins `SEARCH_CLASSES_ENDPOINT` and `SEARCH_PROPERTIES_ENDPOINT`.
- The `RESTART_KEY` is a key to enable restart of the server to load new ontology from files.

<br>

> Afte you set the `.env` file you can run the service

    $> npm run start

> or build

    $> npm run dist

There is also nodemon installed, but the testing usually requires loading the ontology to see the full behaviour.
For this reason, running with the start proved to be more beneficial.

## Containerization and running in production

- There is a ready `Dockerfile` in the folder and it is set up to run in production mode.
- The image structure:
  - `/app` path contains the copied and installed application.
  - `/app/input` is expected to bind the folder of output files from the preprocessing phase.
- Ports and hosts
  - `fastify` needs to set the `host` to `0.0.0.0` in order to work with the docker.
  - `port` is set to run on `3042` as in development.
- Based on the Wdoi services architecture, the service is ment to be published to the outside. So you should publish ports (`-p` option).
- When running separately, you will want to connect the service to the rest of the application. To do that, create a docker bridge that will connect the services. The services are then available by their container names as hosts names.

### Enviroment variables

- The assumption is that the environment variables are set during the container start up, either inside the provided `docker-compose.yml` or during `docker run`.
- The variable names need to match the varibles from the development `.env` file.
  - `NODE_ENV` is set in the `Dockerfile` to `production`.
  - `SEARCH_PROPERTIES_ENDPOINT` and `SEARCH_CLASSES_ENDPOINT` contains url of the Search search instance, but the `host` name must match the container name of Search service. Since the containers are connected via external bridge and the Search service itself is not expected to be exposed to the public.
  - `CLASSES_PATH`, `PROPERTIES_PATH` contain path to the files in the binded `/app/input` folder. The names match the files from the outside. When starting the container you need to create bind mount to enable the access to the preprocessing output folder.

### Building and running the image separately

> Building the image

    $> docker build -t wdoi_api_image .

> Running the container (adjust the bridge, the paths and the restart key). The example show how to bind the output files from preprocessing as separate files. In docker compose, it is easier to bind the entire folder.

    docker run --rm \
    -p 3042:3042 \
    --restart unless-stopped \
    --network your_bridge \
    -e SEARCH_CLASSES_ENDPOINT=http://search:3062/search-classes" \
    -e SEARCH_PROPERTIES_ENDPOINT="http://search:3062/search-properties" \
    -e RESTART_KEY="1234567" \
    -e CLASSES_PATH="/app/input/classes.json"
    -e PROPERTIES_PATH="/app/input/properties.json"
    --mount type=bind,source=/path/to/ds-wdoi/source/preprocessing/output/classes-recs.json,target=/app/input/classes.json,readonly \
    --mount type=bind,source=/path/to/ds-wdoi/source/preprocessing/output/properties-recs.json,target=/app/input/properties.json,readonly \
    --name wdoi_api_service wdoi_api_image

But the **prefered** way is to run the `docker-compose.yml` from the parent `source` folder.

### Restarting

- The restart is assumed to be done from within the internal bridge network.
- The key must then match on both sides.
- Within the internal bridge network, the container is accessed via its name.

## Swagger

- In development mode, upon startup of the service, there will be generated `swagger.yaml` file into the current folder.
- The swagger is served as a static page from the route `/documentation`
- It is disable in production mode.
