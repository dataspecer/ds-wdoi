# Meeting with Stepan

Discussing some technical aspects of the Dataspecer tool and it's evolution.

## Prepared questions and topics

1. On the main page, vocabulary sources defines what happends when i click on create data structure? How to integrate it with the wikidata special interface?
   - Response:
     - It can be made to define the ui, so far It can be hardcoded.
     - Be careful of responsibilities, my responsibility is the adapter not the button.
    
2. What defines that something is an attribure or association?
   - Response:
     -  In the future, there will be no attributes.
     -  I should not care right now. 

3. What defines the final type of value of an attribute and codelists..
     - [URL Property](https://www.wikidata.org/wiki/Property:P2699)
     - [owner by property](https://www.wikidata.org/wiki/Property:P127)
     - [location](https://www.wikidata.org/wiki/Property:P276)
     - Response:
       - I do not need to care right now.
       - We want to know the usage and the performance in general.

4. Dataspecer model? What If I would not like the side bar of the parent classes? 
     - Co vsechno potrebuju dodat do dataspeceru?
     - A co muzu upravit na urovni dataspeceru?
     - Chces aby se to upravilo nebo to nechat takhle?
     - Je lepsi udelat microfront end nebo rovnou integrace do ds.
     - Response:
       - In general I should think about it.
       - There are options but the thing is that someone did a browser of the Wikidata ontology before in the past. Which hinders my thoughts on doing a browser my self.    
