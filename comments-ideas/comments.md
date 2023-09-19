## Comments


#### Find value constrait classes of a property.

SELECT DISTINCT ?property ?propertyLabel ?class ?classLabel WHERE {
  VALUES ?property {
    wd:P119
  }
  ?property p:P2302 ?statement.
  ?statement ps:P2302 wd:Q21510865;
    pq:P2308 ?class. 
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}