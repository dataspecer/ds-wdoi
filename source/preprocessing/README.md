# Preprocessing

This section is divided into three parts:
  1. Summary of the pipeline
  2. How to run the pipeline
  3. Notes on file output formats

# Summary of the pipeline

The preprocessing is done in 7 phases.:

0. Download
1. Identification 
   - The first pass of the dump 
     - Identification of classes and properties
     - *Property usage statistics*
        - Store instance of values for each entity in the dump for further processing 
2. Separation
   -  She second pass of the dump 
      -  Separation of classes and properties from the dump into two new files preserving the Wikidata data model
      -  *Property usage statistics*
           - Store property usage for domain and range of classes
           - Compute summary from the stored property usage for each class and property   
3. Extraction 
   - The data from separated wikidata classes and properties are extracted into a simplified data model
4. Modification
   - Semantic and structural modifications are done on the simplified data model
5. Property Recommendations
   - Merging of recommendations from property usage statistics with property constraints
   - Boosting "properties for this type" properties
6. Loading to search engine
   - Load labels and aliases into ElasticSearch service

> Note: 
> 1. During 1. and 2. phase, there are running statistics for property usage happening during the dump pases. The statistics run with during 1. and 2. phase to reduce time of the computation.
> 2. The types of property values are not checked, since the Wikidata does not allow to entry value that do not match the property type. Such as: placing a property into subclass of statement.
> 3. I consider only the unique values from extracted properties.
> 4. The output files always contain a single json boject on each line representing an entity (a property or a class).

# How to run and use the pipeline

The pipeline uses Wikidata JSON dump in the GZIP format.
Each of the main steps mentioned above has its own main script file.
The script file can be run with the provided instructions (below).
There is also a script that is able to run all the phases at once.

## Before running the scippts

- Before running the scripts, read the instructions and preferably comments for each of the phases in `phases` folder.
- The the pipeline also assumes there is an Elastic Search service running, that is later used by the API service.
  - read 6. phase information below about usage

### Requirements

- Python 3.11 and above
- Elastic Search 8.13 and above
- Mamory and time
  - The runtimes and memory was measured on virtual infrasctructure with Ubuntu 22 with 64 GB of RAM and 32 core processor (altough this phase does not use multithreading).
  - Memory
    - Wikidata gzip dump ~ 130 GB (as of 4.4.2024) on disk, depending on the current size
    - Phases (counting in reserves and disregarding Elastic Search):
      - The 1. and 2. phase of preprocessing require at least 42 GB of RAM
      - For the rest at least 16 GB
  - Time
    - Downloading depends on the internet connection
      - University server took ~ 7 hours
    - After downloading, ~ 11 hours to preprocess everything. 

### Installing dependencies

- Ideally use Python virtual enviroment for the scripts.
- Use frozen `requirements.txt` file to install all dependencies. 

### **Logging**:

  - Everything is logged into `log.log` file and console (`std_out`).
  - Errors also logged separately into `log_errors.log`.
  - Each phase is prefixed with a string identifier.

## Donwloading Wikidata dump (0. phase)

Downloads the newest Wikidata dump in GZIP format, overwriting already existing one.
The main script is `p_download.py`.

- Input:
  - None
  - Example of running:
  
        $> python p_download.py

- Output:
  - `latest-all.json.gz` file in the folder of script execution

- Logging prefix: `download`

## Identification and separation with statistics (1. and 2. phase)

The part contains 1. and 2. phase with computation of property usage statistics.
The statistics is run during the phases to reduce time of the statistics computation.
The main script is `p_identification_separation.py`

- Input:
  - A path to the wikidata json dump in `.gz` format
  - Example of running:
    
        $> python p_identification_separation.py latest-all.json.gz

- Output:
  - Separated classes and propeties files in the folder of script execution
    - `classes.json.gz`
    - `properties.json.gz`
    - Each output file contains an json array where on each line is a wikidata entity.
    
  - Statistics summaries files in the folder of script execution
    - `classes-property-usage.json`
      - Contains property usage summary for each class with probabilities
    - `properties-domain-range-usage.json`
      - Contains domain and range statistics for each property without probabilities

- Logging prefix: `identification_separation`

## Extraction (3. phase)

The part contain 3. phase which is conducted in two steps - class extraction and property extraction.
The phase extracts the data from the Wikidata model into a simplified data model.
The simplified model is simply a flattening of the hierarchical Wikidata model. 
The main script is `p_extraction.py`.

- Input:
  - Optional argument for languages extraction
    - `--lang`
    - Accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - Defaults to `--lang en`
    - **The "en" is compulsory at the moment** and will be included even though it is not set.
    - For available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
  - A required parameter one of `["cls", "props", "both"]`
    - Based on the parameter either the first or the second phase is skipped.
    - For conducting only specific extraction:
      - Classes extraction - use `cls`
      - Properties extraction - use `props`
      - For both extractions - use `both`
  - Required paths to `classes.json.gz` and `properties.json.gz` from previous phase, in the given order

        $> python p_extraction.py both classes.json.gz properties.json.gz

        or

        $> python p_extraction.py --langs en -- both classes.json.gz properties.json.gz


- Output:
  - files in the folder of script execution, containing entities in the new simplified model
    - `classes-ex.json`
    - `properties-ex.json`

- Logging prefix: `extraction`

## Modification (4. phase)

The phase loads all the data in the new model into memory and does a semantic and structural checking and modification to the entities.
Subsequently it saves them to two files.
This phase was moved here from server, because this part also takes quite a bit of time (which was unexpected at first).
The main script is `p_modification.py`

- Input:
  - Required paths to `classes-ex.json`, `properties-ex.json`, `classes-property-usage.json` and `properties-domain-range-usage.json` in the given order, from the 3. phase

        $> python p_modification.py classes-ex.json properties-ex.json classes-property-usage.json properties-domain-range-usage.json

- Output:
  - `classes-mod.json`
  - `properties-mod.json`

- Logging prefix: `modification`

## Precomputing recommendations (5. phase)

A phase that enables to change property orderings on classes.
So far only boosting of properties from properties_for_this_type field and merging property constraints to property usage statistics.
The largest part of the recommendation phase is done in the 2. phase when finilazing property usage statistics.

The main script is `p_property_recommendations.py`.

- input:
  - required paths to `classes-mod.json` and `properties-mod.json` in the given order from the fourth phase

        $> python p_property_recommendations.py classes-mod.json properties-mod.json

- output:
  - `classes-recs.json`
  - `properties-recs.json`

- logging prefix: `property_recommendations`

## Loading into search service (6. phase)

The phase loads labels and aliases into a search service - elastic search. 
Assuming the Elastic search runs on client from `utils.elastic_search.py`.
Before running this phase, create the indeces using `helper scripts` functions.
The main script is `p_loading.py`.

- Inputs:
  - optional argument for languages extraction
    - This parameter must always be equal to the one used in phase 3.
    - `--lang`
    - accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - defaults to `--lang en`
    - **The "en" is compulsory at the moment** and will be included even though it is not set.
    - for available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
    - it should be the same value as was given in the previous phase.
  - paths to the two files generated in the previous step - `classes-recs.json` and `properties-recs.json`

        $> python p_loading.py classes-recs.json properties-recs.json

- Outputs:
  - none

- Logging prefix: `loading`

### Helper scripts

This phase contains helper scipt `p_loading_es_helpers.py`
It either creates, refreshes or deletes classes and properties indices.

- Usage:

      # Creating indices
      &> python loading_es_helpers.py create

      # Deleting everything
      &> python loading_es_helpers.py delete

      # Refreshing the indices
      &> python loading_es_helpers.py refresh

      # Searching the class/property index
      &> python loading_es_helpers.py search_classes "query string goes here"
      &> python loading_es_helpers.py search_classes "query string goes here"

      # Listing indices
      &> python loading_es_helpers.py list

      # List mappings of indices
      &> python loading_es_helpers.py mappings

- Logging prefix: `es_helpers`

### Elastic search set up

Assuming we are running on Elastic docker image.

The scripts require `.env` file in the `preprocessing` folder with three values:
1. `ES_PASSWD` - a password of the elastic search instance provided with certificate
2. `ES_CERT_PATH` a path to elastic search cerficate
3. `ES_URL` - an url to elastic search instance

Example (notice that `" "` are not used):

    ES_PASSWD=abcdefg
    ES_CERT_PATH=/path/to/http_ca.cert
    ES_URL=https://localhost:1234

- How to obtain the values:
    - [docker tutorial](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)
    - Since we are not using Kibana, it is enough to reset the password and copy the certiface out of the image
    - **Do not forget** to add `--network your_bridge` option to the run, so you could connet to the wdoi API service.

## Run all script

The script runs all phases.
The main file is `p_run_all_phases.py`.

- Input:
  - optional argument for languages extraction
    - `--lang`
    - accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - defaults to `--lang en`
    - **The "en" is compulsory at the moment** and will be included even though it is not set.
    - for available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
  - optional boolean flag argument whether to donwload the newest dump
    - `--donwload`
    - defaults to `False`
    - the `True` will overwrite the existing dump in the current folder
  - optional argument to continue from a specific phase
    - `--continue-from` `[id_sep, ext, mod, recs, load]`
    - each value represents a phase based on the output files suffixes.
    - the preprocessing will continue from the given phase
    - if the argument is used, download is diregarded


# Notes on the file output formats

- We use json format for storing entity information.
- Every json file contain a single entity on a single line in the file.
  - Thus to obtain an entity, it is enough to read line of the file the entity is present on.
- The output entities from phases, except the 2. phase, follow the format denoted in the `core/model_simplified` folder.
- Instead of storing references to objects, the fields that reference other entity store only an id of the entity.
  - It is necessary to create a map/dictionary of the entities to follow the identifiers to the appropriate entities.
