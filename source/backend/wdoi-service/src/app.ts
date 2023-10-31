import { WdOntology } from './ontology/wd-ontology';

WdOntology.Create('c:/AAA/ds-wdoi/source/preprocessing/classes.json', 'c:/AAA/ds-wdoi/source/preprocessing/properties.json')
  .then((value) => {
    console.log('done');
  })
  .catch((value) => {
    console.log(value);
  });
