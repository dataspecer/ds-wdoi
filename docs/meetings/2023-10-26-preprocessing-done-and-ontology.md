# Sixth meeting 

I am presenting finished preprocessing and ontology.

[Presentation](https://docs.google.com/presentation/d/1t5npUp1rF1iwD4QQV67rUZHbZWvvnAhYiGQMgVBXRnE/edit?usp=sharing)

[Ontology](https://drive.google.com/file/d/1N9_UtjzDTD-Q6J0-hdDeMXK66I2S6v61/view?usp=drive_link)

## Questions from presentation

- How to display properties that have no subject type?
  - It should not be displayed to the user all at once, for now I should stick to the subject value type constraints.
  - There should be possibly a way to click into a search bar, where the user would search all the properties.
- How to display properties that can be used only as qualifiers?
  - For now, I should not think about it. So exclude them.
- How to understand subject type constraint is it says subclass of relation?
  - For now, stick to "instance of" and "instance of/subclass of".

## Next meeting

- Add parameters to choose languages for extraction into the extraction.py script.
- Do the backend.