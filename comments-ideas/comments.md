## Comments

> Necasky query

SELECT DISTINCT ?property ?propertyLabel ?class ?classLabel
WHERE {
 VALUES ?property {wd:P119}
 ?property p:P2302 ?statement .
 ?statement pq:P2308 ?class . ?statement ps:P2302 wd:Q21510865 . #wd:Q21510865 . #wd:Q21503250 .
 SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } # Pomůže získat štítek ve vašem jazyce, pokud neexistuje, pak v anglickém jazyce
}
