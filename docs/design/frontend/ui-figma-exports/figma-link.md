# A link to my figma repository

[The link](https://www.figma.com/file/6iULJh0Hvm4cSu39WisXLq/ds-wdoi?type=design&node-id=0%3A1&mode=design&t=euG11MLTby7Yaq23-1)

## First Design

- Root search
    - The user can search by property or by class name
    - After clicking detail the user can browse the classes or properties and click back button as in browser history
    - Cons:
      - The search by property is not intuitive, since it seems we are choosing property as a root
      - Although the thought is a good one
- Associations hierarchy of parents
    - I tried to implement the forward list for parents
    - The list itself is still on the right
    - The only difference is that the user can open a small accordion and display the direct parents of the class
    - Also in the opened accordion a user can click to forward scroll to the class as if browsing
    - With search bar based on string
    - Ideas:  
      - The questions is wheter do we need the parents at all
      - The graph itself is not a good representation since it wont tell user much
- The property associations
    - A simple search bar based on strings
    - Displaying inherited properties and Own properties

- What am I missing?
  - The click to show the domain
  - A button to switch between in and out associations
  
### Thoughts on the first design
    
-  The search by property is not intuitive, since it seems we are choosing property as a root
-  The question is whether do we need the parents bar
-  The range for properties should be displayed after the click
-  There should be added properties of qualifiers and other with no range or domain
-  Maybe I could choose a different lists based on backward or inward associations