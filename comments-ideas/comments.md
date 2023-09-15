## Comments

> Necasky query

SELECT DISTINCT ?property ?propertyLabel ?class ?classLabel
WHERE {
 VALUES ?property {wd:P119}
 ?property p:P2302 ?statement .
 ?statement pq:P2308 ?class . ?statement ps:P2302 wd:Q21510865 . #wd:Q21510865 . #wd:Q21503250 .
 SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } # Pomůže získat štítek ve vašem jazyce, pokud neexistuje, pak v anglickém jazyce
}


## Questions for Stepan

1. On the main page, vocabulary sources defines what happends when i click on create data structure? How to integrate it with the wikidata special interface?
   1. nejak to hardcode pokud to jsou wikidata tak se zobrazi to
   2. muj deal je jen ten dialog

2. What defines that something is an attribure or association?

3. What defines the final type of value of an attribute?
  - [URL Property](https://www.wikidata.org/wiki/Property:P2699)
  - [owner by property](https://www.wikidata.org/wiki/Property:P127)
  - [location](https://www.wikidata.org/wiki/Property:P276)

4. Dataspecer model? What If I would not like the side bar of the parent classes? 
     - Co vsechno potrebuju dodat do dataspeceru?
     - A co muzu upravit na urovni dataspeceru?
     - Chces aby se to upravilo nebo to nechat takhle?
     - Je lepsi udelat microfront end nebo rovnou integrace do ds.    

5. Codelists..
