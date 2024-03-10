import { useState, useMemo } from 'react';
import { ClassSurroundings, SurroundingsParts } from '../../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../../selected-property';
import { EntityIdsList } from '../../../../wikidata/entities/wd-entity';
import { WdClass } from '../../../../wikidata/entities/wd-class';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Datatype, WdProperty } from '../../../../wikidata/entities/wd-property';
import { AssociationsAccordion } from './AssociationsAccordion';

type PropertyPartsSelectionInput = 'inherited' | 'own';

interface PropertiesGroups {
  attributeProperties: WdProperty[];
  identifierProperties: WdProperty[];
  inItemProperties: WdProperty[];
  outItemProperties: WdProperty[];
}

interface InAndOutProperties {
  outProperties: WdProperty[];
  inProperties: WdProperty[];
}

function materializeProperties(
  propertiesIds: EntityIdsList,
  rootSurroundings: ClassSurroundings,
): WdProperty[] {
  const results: WdProperty[] = [];
  propertiesIds.forEach((propertyId) => {
    const wdProperty = rootSurroundings.propertiesMap.get(propertyId);
    if (wdProperty != null) results.push(wdProperty);
    else console.log(`Missing property ${propertyId}`);
  });
  return results;
}

function retrieveInAndOutProperties(
  rootClass: WdClass,
  rootSurroundings: ClassSurroundings,
  surroundingsParts: SurroundingsParts,
  propertyPartsSelection: PropertyPartsSelectionInput,
): InAndOutProperties {
  let outPropertiesIds: EntityIdsList = [];
  let inPropertiesIds: EntityIdsList = [];

  if (propertyPartsSelection === 'inherited') {
    outPropertiesIds = rootSurroundings.subjectOfIds;
    inPropertiesIds = rootSurroundings.valueOfIds;
  } else if (surroundingsParts === 'constraints') {
    outPropertiesIds = rootClass.subjectOfProperty;
    inPropertiesIds = rootClass.valueOfProperty;
  } else {
    outPropertiesIds = rootClass.subjectOfPropertyStats;
    inPropertiesIds = rootClass.valueOfPropertyStats;
  }

  return {
    outProperties: materializeProperties(outPropertiesIds, rootSurroundings),
    inProperties: materializeProperties(inPropertiesIds, rootSurroundings),
  };
}

function splitPropertiesIntoGroups(inAndOutProperties: InAndOutProperties): PropertiesGroups {
  const attributeProperties: WdProperty[] = [];
  const identifierProperties: WdProperty[] = [];
  const outProperties: WdProperty[] = [];

  inAndOutProperties.outProperties.forEach((wdProperty) => {
    if (wdProperty.datatype === Datatype.ITEM) outProperties.push(wdProperty);
    else if (wdProperty.datatype === Datatype.EXTERNAL_IDENTIFIER)
      identifierProperties.push(wdProperty);
    else attributeProperties.push(wdProperty);
  });

  return {
    attributeProperties: attributeProperties,
    identifierProperties: identifierProperties,
    outItemProperties: outProperties,
    inItemProperties: inAndOutProperties.inProperties,
  };
}

function textFilter(wdProperties: WdProperty[], text: string): WdProperty[] {
  if (text != null && text !== '') {
    return wdProperties.filter((property) => property.labels['en'].toLowerCase().includes(text));
  } else return wdProperties;
}

export function AssociationsList({
  rootSurroundings,
  setSelectedPropertiesUpper,
  surroundingsPart,
}: {
  rootSurroundings: ClassSurroundings;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
  surroundingsPart: SurroundingsParts;
}) {
  console.log(rootSurroundings);
  const [propertySelection, setPropertySelection] = useState<PropertyPartsSelectionInput>('own');
  const [searchTextInput, setSearchTextInput] = useState('');
  const [showAttributeProperties, setShowAttributeProperties] = useState<boolean>(true);
  const [showIdentifierProperties, setShowIdentifierProperties] = useState<boolean>(true);
  const [showOutItemProperties, setShowOutItemProperties] = useState<boolean>(true);
  const [showInItemProperties, setShowInItemProperties] = useState<boolean>(true);

  const rootClass = useMemo<WdClass>(() => {
    return rootSurroundings.classesMap.get(rootSurroundings.startClassId) as WdClass;
  }, [rootSurroundings]);

  const propertiesGroups = useMemo<PropertiesGroups>(() => {
    const inAndOutProperties: InAndOutProperties = retrieveInAndOutProperties(
      rootClass,
      rootSurroundings,
      surroundingsPart,
      propertySelection,
    );
    return splitPropertiesIntoGroups(inAndOutProperties);
  }, [rootClass, rootSurroundings, surroundingsPart, propertySelection]);

  const attributeProperties = useMemo<WdProperty[]>(() => {
    if (showAttributeProperties) {
      return textFilter(propertiesGroups.attributeProperties, searchTextInput);
    } else return [];
  }, [propertiesGroups, searchTextInput, showAttributeProperties]);

  const identifierProperties = useMemo<WdProperty[]>(() => {
    if (showIdentifierProperties) {
      return textFilter(propertiesGroups.identifierProperties, searchTextInput);
    } else return [];
  }, [propertiesGroups, searchTextInput, showIdentifierProperties]);

  const outItemProperties = useMemo<WdProperty[]>(() => {
    if (showOutItemProperties) {
      return textFilter(propertiesGroups.outItemProperties, searchTextInput);
    } else return [];
  }, [propertiesGroups, searchTextInput, showOutItemProperties]);

  const inItemProperties = useMemo<WdProperty[]>(() => {
    if (showInItemProperties) {
      return textFilter(propertiesGroups.inItemProperties, searchTextInput);
    } else return [];
  }, [propertiesGroups, searchTextInput, showInItemProperties]);

  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex flex-row items-center space-x-2'>
        <div className='basis-5/10 flex-row'>
          <span>Show Properties:</span>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAttributeProperties}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setShowAttributeProperties(event.target.checked);
                  }}
                />
              }
              label='Attributes'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showIdentifierProperties}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setShowIdentifierProperties(event.target.checked);
                  }}
                />
              }
              label='Identifiers'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOutItemProperties}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setShowOutItemProperties(event.target.checked);
                  }}
                />
              }
              label='Ouwards'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showInItemProperties}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setShowInItemProperties(event.target.checked);
                  }}
                />
              }
              label='Inwards'
            />
          </FormGroup>
        </div>
        <div className='basis-3/10'>
          <TextField
            size='small'
            label='Type to search'
            variant='standard'
            fullWidth
            onChange={(e) => setSearchTextInput(e.target.value)}
          ></TextField>
        </div>
        <div className='basis-2/10'>
          <FormControl>
            <InputLabel id='property-selection-label'>Display</InputLabel>
            <Select
              labelId='property-selection-label'
              id='property-selection'
              value={propertySelection}
              label='Display'
              size='small'
              onChange={(e) => {
                const value = e.target.value;
                if (value !== 'inherited' && value !== 'own') setPropertySelection('own');
                else setPropertySelection(value);
              }}
            >
              <MenuItem value={'own'}>Own</MenuItem>
              <MenuItem value={'inherited'}>Inherited</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
      <div>
        {showAttributeProperties ? (
          <AssociationsAccordion
            key={1}
            rootClass={rootClass}
            rootSurroundings={rootSurroundings}
            setSelectedPropertiesUpper={setSelectedPropertiesUpper}
            propertyList={attributeProperties}
            name={'Attributes'}
          />
        ) : (
          <></>
        )}
        {showIdentifierProperties ? (
          <AssociationsAccordion
            key={2}
            rootClass={rootClass}
            rootSurroundings={rootSurroundings}
            setSelectedPropertiesUpper={setSelectedPropertiesUpper}
            propertyList={identifierProperties}
            name={'Identifiers'}
          />
        ) : (
          <></>
        )}
        {showOutItemProperties ? (
          <AssociationsAccordion
            key={3}
            rootClass={rootClass}
            rootSurroundings={rootSurroundings}
            setSelectedPropertiesUpper={setSelectedPropertiesUpper}
            propertyList={outItemProperties}
            name={'Outwards'}
          />
        ) : (
          <></>
        )}
        {showInItemProperties ? (
          <AssociationsAccordion
            key={4}
            rootClass={rootClass}
            rootSurroundings={rootSurroundings}
            setSelectedPropertiesUpper={setSelectedPropertiesUpper}
            propertyList={inItemProperties}
            name={'Inwards'}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
