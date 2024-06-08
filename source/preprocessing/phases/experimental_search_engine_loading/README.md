# Experimental seach engine loading

The phase loads the new prepared data entities into the Qdrant and Elastic search.
We have chosen Elastic for full-text search, since it's capabilities are next to no other database.
For a vector search we have chosen Qdrant vector database because it is possible the only vector database that specializes on filtering the search space. 
The general application state and the documentation were in a good state.

- Qdrant comments
  - To enable fast loading to Qdrant, it is necessary to disable indexing on upsert opration. When we insert all the vectors, we update the collection to create vector index if the number of vector exceeds a certain threshold.
  - After the indexing enable, the status of the database will be noted as `yellow` when displaying the collection status. It takes some time to create the index, unfortunatelly, it is not possible to somehow wait programatically for the completion.
  - The scalar values index is created before insertion of the points.
- Elastic search comments
  - For all the text values, we need to choose an analyzer (English analyzer) that will parse the input text before indexing.
  - We also disable storing of the data in the `_source` field, not to take too much memory and because it is unecessary, since the search service will contain all the information there will be no need to retrieve it.