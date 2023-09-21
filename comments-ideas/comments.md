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


## Design decisions

- I should not care about item constraits now.
- I should not cate about qualifiers contraints now.
- When building the hierarchy, I should consider only the "subclass of" property and exlude the "instance of".
- I want to use the SchemaTree recommender and Wikidata search entities.