# First meeting after project start

I want to mainly show UI design in the Figma tool and ask questions about it.

## UI

[here](https://www.figma.com/file/6iULJh0Hvm4cSu39WisXLq/ds-wdoi?type=design&node-id=0%3A1&mode=design&t=euG11MLTby7Yaq23-1)


- Questions:
  - Root selection
     1. Should the detail of the classes show hierarchy information that the user could navigate or leave it as is?
     2. Would the browsing via graph be a good thing?
     3. Should there be properties while browsing or in detail?
     - Responses:
       - In general, I should think about the first dialog when searching the root.
       - How to integrate the dialog with the different lists I search in.
       - Browsing should somehow show properties. 
  - Association selection
     1. Mainly which design seems to be the best?
        - They said both are okey, but I think the graph is the best one. 
     2. What properties to show and how to perceive it in the Dataspecer tool?
        - How should I approach inheritance of properties?
          - Should I display properties of parents as well or just the ones specifically for the selected class?
        - It is better to show all and let them choose.  

## First development phase

- Can I start?
  - Yes I can.
- Meeting with Stepan if still not agreed upon.
  - We agreen on friday at 11am.
- What defines the final type of value of an attribute/association?
  - [URL Property](https://www.wikidata.org/wiki/Property:P2699)
  - [owner by property](https://www.wikidata.org/wiki/Property:P127)
  - [location](https://www.wikidata.org/wiki/Property:P276)
  - This was left for the meeting with Stepan.

## Next meeting

- Think about integrating the search root dialog with something more advanced than search text.
  - Such as show classes that have the listed properties or something like that.
  - I should take a look at the search thing in Wikidata.
- Try to show UI with properties.
- Try to device some sparql queries into the wikidata that will reflect the UI.
- Try to code the basic integration as is in the dataspecer calling the sparql service.
- Think if I want to do the UI as well, or leave it for the better architecture phase.
- Think if I want to do a different app the will integrate with the dataspecer - ontology browser.