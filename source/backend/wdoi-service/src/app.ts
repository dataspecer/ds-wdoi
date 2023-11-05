import { WdOntology } from './ontology/wd-ontology';

WdOntology.create('c:/AAA/ds-wdoi/source/preprocessing/classes-final.json', 'c:/AAA/ds-wdoi/source/preprocessing/properties-final.json')
  .then((_) => {
    console.log('done');
  })
  .catch((value) => {
    console.log(value);
  });
