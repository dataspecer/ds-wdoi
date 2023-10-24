# Second meeting

What I want is to mainly discuss some semantic of the Wikidata model and how to interpret it inside Dataspecer.
Then, I wish to consult semantics of the search dialog.

## Model

- Qualifiers and items constraints
  - Some properties have a constraint such that it can be used only as a qualifier/reference.
  - Some properties have that they can be used only on Lexemes, Forms and Senses, Property, MediaInfo, Items.
  - Constraints
    - Allowed entity types constrait
    - allowed qualifiers
  - Wikidata instance of and subclass of in hierarchy?
      - Can I make instance seem as a subclass -> parent?

- **Responses**:
  - I should ignore the qualifiers right now.
  - I should ignore other namespaces of wikidata.
  - When building hierarchy, I should not consider "instance of"

## Query dialog when searching for the root

- What is the semantics?
  - Write text input + add properties -> what to return.
  - Add only properties?
  - I think I would put the instance somewhere else.

- **Responses**:
  - It was my mistake, because I understood in a way more difficult way than it was ment.
  - I should just search instances and properties and classes by text and show them as one.

## Discussing dp.

- Page 42 in ontology browsing?

- **Responses**:
  - It is okey If I did something similar.


## Next meeting

- Try to model a picture of the Wikidata model and what I would like to include in my ontology.
- Work on the programming part of the first version.