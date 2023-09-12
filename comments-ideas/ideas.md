# Ideas

This file contains ideas and thoughts written in an informal language.

## UI

This is a written form of ideas of UI.
The graphical part can be found [here](https://www.figma.com/file/6iULJh0Hvm4cSu39WisXLq/ds-wdoi?type=design&node-id=0%3A1&mode=design&t=euG11MLTby7Yaq23-1) or inside `ui-figma-exports` folder.
The idea of ui is devided into two parts - Root selection and Association selection.

### Root selection

  1. A user will select wikidata as input in the specification main page.
  2. The classical dataspecer search bar would show up - a single line of a search bar.
  3. The search bar could have settings that sets how to search: 
       - **Search by class**
         1. A text based search on the classes names.
         2. A user searches for a class.
         3. Output would list classes as in current dataspecer.
         4. The user would select a single class and could show a detail.
         5. By clicking the line of the class, the user would select it as the root.
         6. ? Inside detail, a user could see hierarchy info about parents and children.
         7. ? By clicking on the info about the class inside detail, the user would navigate the hierarchy.
         8. ? A back button on the main window could lead him back as he was cliking.
         - *detail of the classes*:
           - a name (label)
           - description (different language options)
           - ? image
           - ? **child and parent classes?** - Could the user browse it?
           - ? **possible properties?** - But is it not a bit too much, it would be the same after root is selected?
         - *comments*:
           - The classes will be in our backend.  
           - The parent classes and child classes will make it possible to browse even without a browser.
       - **Search by instance**
         1. A text based search on the known instances in wikidata.
         2. A user searches for an instance, e.g. Paris.
         3. The output would list matching instances.
         4. The user would click the line of the instance and detail would show up (as clicking the i in circle normally would).
         5. The detail would show a list of "instance of" and "subclass of" classes + maybe constraints.
         6. Then the user would select a class from the detail as the root by clicking on it.
         7. ? Or if the detail of the class contained parents/children the user could navigate it.
         8. ? Again by clicking back button would lead him back.
         - *detail of the instances*:
           - name, label, image, description
           - "instance of" and subclass of" classes with the same detail as in search by class.
         - *comments*:
           - This is based on the Stepan's idea.
           - The problem is that managing all instances locally is impossible, so the wikidata php api should be used instead.  
           - [php query api in wikidata](https://www.wikidata.org/w/api.php?action=help&modules=query%2Bsearch)  
           - [php get entities api in wikidata](https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&search=Veronika%20Scheuerova) (only example link) 
       - **Search by property**
         1. A text based search on the existing properties.
         2. A user searches for a property that the class can have or it is pointed by (wikidata property constaints on values and subjects).
         3. The output would list matching properties.
         4. The user would expand the detail and look at the property constaints that contain classes (subjects and objects).
         5. The user then selects a single class as the root node.
         6. ? Or if the detail of the class contained parents/children the user could navigate it.
         7. ? Again by clicking back button would lead him back.
         - *detail of the properties*:
           - name, label, description
           - ? Maybe a bit of other contraints?
           - Classes of subject and object in the same detail as in search by class.
         - *comments*:
           - The properties will be in our backend. 
  4. **Browsing after detail of the class**
     - Is it all with the detail?
     - What if the user could browse the class hierarchy as I mentioned in the **search by class** above?
     - How could they do it?
       1. Following the parents and children ("subclass of hierarchy")
       2. 1 + properties? If they are actually listed in the detail - but it has multiple target object for a single property, is it even managable?
     - Ideas of views:
       -  **Browser as in slovnik.gov**
          - After designing and interface in Figma, I noticed that it somehow assumes it since i can always click on detail in the class.
          - It would be either a separate page like "slovnik.gov.cz" served from backend or integrated inside Dataspecer.
          - The view would show the same thigs as in "slovnik.gov.cz" with a bit of detail from wikidata pages.
          - The classes are simple.
          - The properties should be in a form of list + search bar.
          - The user would select property and the target class.
       - **Graph expander**
         - A view with only a single class would show up with two edges (parents and children) to the class ending with a plus sign.
         - The user would click the pluses and the graph would expand.
         - There would be and option for expanding all or just the selected classes.
         - Properties would be in a form of detail.
           - There could be a third edge that would expand single properties to the selected target classes.
         - Examples:
           - There is a graph builder, but it is way too general, it can follow everything
           - [graph builder children](https://angryloki.github.io/wikidata-graph-builder/?item=Q133067&property=P279&mode=reverse&graph_direction=down)
           - [graph builder parents](https://angryloki.github.io/wikidata-graph-builder/?item=Q133067&property=P279&graph_direction=down)
       - **Complete graph**
         - Show complete list of hierarchy of the selected class.
         - [graph builder parents](https://angryloki.github.io/wikidata-graph-builder/?item=Q133067&property=P279&graph_direction=down)

Questions to answer:
  
  1. Should the detail of the classes show hierarchy information that the user could navigate or leave it as is?
  2. If yes/not would a graph diagram of the hierarchy a good thing to have?
  3. Should the class details or graph show properties?

### Association selection

- There will be a list of properties shown to the user with basic description as in the current Dataspecer.
- Filtering options:
  1. Text based filtering on names.
       - Can be extended with text based filtering in description.
  2. Filter by selecting target classes of properties.
       - The view could then group the properties by target classes.
  3. Filter by selecting subject classes of properties.
       - The view could then group the properties by subject classes.  
  4. Filter by **by origin**:
     - This depends on whether we are showing all properties to the user (inherited + own constraints) or just the ones pertaining to the selected class (given by constraints):
        1. Show everything
           - Might be too much for the user but he can search it immediately and does not have to look for other classes.
             - This is good, because there are so many classes.
           - There is a need to know from which parent class came something.
           - There are multiple ways we could try to imagine it generically:
             1. Starting point is - everything is selected, so the user sees everything from parents.
             2. What can the user do?
                1. Use a graph to select classes he wants to see properties from (graph could be searchable with text).
                2. If there was no graph and he wanted to navigate, he could use grouping view based on parent class. The groups in the view would have headers. The headers would contain links to other parents in the shown list. -> So it is not a selection but just scroll to a different position in the list.
                3. It could be the same as in dataspecer sidebar, only it could be serialized. The sidebar classes would show depth + navigation links as in the previous example (3.). User could maybe select the ones he wants to see and maybe also search by text in the sidebar.
        2. Show only the ones pertaining to the class defined by constraints on edges - this is in current dataspecer it seems
           - I dont like this very much, because there can be a lot of classes, so how should a user be able to search all of them?
           - What can the user do?  
             1. We could use the same graph and he would select what classes he wants to see properties from.
             2. Or the expansion can be done by clicking headers in the list as in the above (1.2.3).
             3. Above (1.2.4)
      - Viable options seems to be a graph with selection or a grouping by parents with expansion or a side panel with navigation and selection.
- view options
  - by origin grouping
  - by subject grouping
  - by object grouping 
- Threre could be a recommneder option/window in which the there would be a list of recommended properties based on the properties the user has already selected

Questions to answer:
  1. Should the properties for the given class show only its pertaining properties (given by constraint) or all from parents (inherited).
  2. What seems as the best option for parent classes management?
     1. a graph
     2. a view in which we group properties by parents, the header will be a navigation to the parents in the given list (scroll to that posision or expand the list)
     3. the side panel would handle the navigation and selection

## Recommendation of properties

Assuming we are on a current type:

- **What to even recommend from?**
    - I need to obtain all properties, that have subject constraint equal to the current type.
    - What if there are none?
      - Some properties do not have assignet subject contrait and, basically, can be used on any class.
      - I could follow the hierarchy tree to the root and ask for additional properties. Basically repeat the query for my parent classes. This can be precomputed. 
      - Should this happen always, that is to say, include all properties from parent classes to the shown property list or show only properties for the current class and user should decide depth to which expand parent classes or maybe just by clicking the classes he wants?**
    - Note that I want to exclude the annoying ID properties or properties regarding the wikidata types.
- **If I obtain some properties to show.** - I must consider the intersection of the valid properties by constraint and recommended properties.
  1. I must take into an account the properties for this type values, before recommending something else. **(This must be done always.)**
  2. I could sort them with schema tree recommender only, but only if it recommends everyting for the type. 
     1. Could be precomputed in that case. 
     2. In this case the recommendation could be recomputed again and again when user selects something. But that would be pretty annoying for the user. Maybe user could click for new recommendations if he wanted? 
  3. I could sort them based on frequency on types. Basically the most used properties will be in the front.
  4. I could use both 2.-3. How ?
     1.  I could have multiple windows - one for static sorted list by frequency and another one for recommendations as the user clicks. So it would be on going recommendation. 
- **In case the clustering based on parent classes took place**.
  - I should be able to sort them with reference to each other, parent should have more pririty because it is more general. 
  - I could count coocured properties and give them more priority.
  - I could maintain the probabilities if i used schema tree, and show only the heighest ones. This makes sense, because good properties on parents want to be seen.


## API to backend

So far only in abstraction:

- Searching for a root.
  - search by a class name
  - search by a instance (external api)
  - search by a property
- Hierarchy and browsing (either in the root search or association search).
  - give me parents (multiple input classes)
  - give me children (multiple input classes)
  - give me entire parent hierarchy?
  - give me entire children hierarchy?
- Details
  - give me details for a class (multiple input classes) with/out properties
    - with properties
      - all
      - own
      - inherited
      - general
  - give me details for a property
- Recommendations
  - give me recommendations based on already made user association selection


## Model

Questions to answer:

- A wikidata states that the constraints are just recommendations.
  - How to approach it during extraction and ontology building?
- How to view qualifier properties?
- What if no object subject is defined?
  - It should use the same thing as in root selection.