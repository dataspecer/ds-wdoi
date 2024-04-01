import { useState, useMemo } from 'react';
import { ClassSurroundings } from '../../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../../selected-property';
import { EntityIdsList } from '../../../../wikidata/entities/wd-entity';
import { WdClassHierarchySurroundingsDescOnly } from '../../../../wikidata/entities/wd-class';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Datatype, WdPropertyDescOnly } from '../../../../wikidata/entities/wd-property';
import { AssociationsAccordion } from './AssociationsAccordion';
import { FilterByInstanceDialog } from './FilterByInstanceDialog';

export type PropertyPartsSelectionInput = 'inherited' | 'own';

interface PropertiesGroups {
  attributeProperties: WdPropertyDescOnly[];
  identifierProperties: WdPropertyDescOnly[];
  inItemProperties: WdPropertyDescOnly[];
  outItemProperties: WdPropertyDescOnly[];
}

interface InAndOutProperties {
  outProperties: WdPropertyDescOnly[];
  inProperties: WdPropertyDescOnly[];
}

function materializeProperties(
  propertiesIds: EntityIdsList,
  rootSurroundings: ClassSurroundings,
): WdPropertyDescOnly[] {
  const results: WdPropertyDescOnly[] = [];
  propertiesIds.forEach((propertyId) => {
    const wdProperty = rootSurroundings.propertiesMap.get(propertyId);
    if (wdProperty != null) results.push(wdProperty);
    else console.log(`Missing property ${propertyId}`);
  });
  return results;
}

function retrieveInAndOutProperties(
  rootClass: WdClassHierarchySurroundingsDescOnly,
  rootSurroundings: ClassSurroundings,
  propertyPartsSelection: PropertyPartsSelectionInput,
): InAndOutProperties {
  let outPropertiesIds: EntityIdsList = [];
  let inPropertiesIds: EntityIdsList = [];

  if (propertyPartsSelection === 'inherited') {
    outPropertiesIds = rootSurroundings.subjectOfIds;
    inPropertiesIds = rootSurroundings.valueOfIds;
  } else {
    outPropertiesIds = rootClass.subjectOfProperty;
    inPropertiesIds = rootClass.valueOfProperty;
  }
  return {
    outProperties: materializeProperties(outPropertiesIds, rootSurroundings),
    inProperties: materializeProperties(inPropertiesIds, rootSurroundings),
  };
}

function splitPropertiesIntoGroups(inAndOutProperties: InAndOutProperties): PropertiesGroups {
  const attributeProperties: WdPropertyDescOnly[] = [];
  const identifierProperties: WdPropertyDescOnly[] = [];
  const outProperties: WdPropertyDescOnly[] = [];

  inAndOutProperties.outProperties.forEach((wdProperty) => {
    if (wdProperty.datatype === Datatype.ITEM) {
      outProperties.push(wdProperty);
    } else if (wdProperty.datatype === Datatype.EXTERNAL_IDENTIFIER) {
      identifierProperties.push(wdProperty);
    } else {
      attributeProperties.push(wdProperty);
    }
  });

  return {
    attributeProperties: attributeProperties,
    identifierProperties: identifierProperties,
    outItemProperties: outProperties,
    inItemProperties: inAndOutProperties.inProperties,
  };
}

function textFilter(wdProperties: WdPropertyDescOnly[], text: string): WdPropertyDescOnly[] {
  if (text != null && text !== '') {
    return wdProperties.filter((property) => property.labels['en'].toLowerCase().includes(text));
  } else return wdProperties;
}

export function AssociationsList({
  rootSurroundings,
  setSelectedPropertiesUpper,
}: {
  rootSurroundings: ClassSurroundings;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}) {
  const [propertyPartsSelection, setPropertyPartsSelection] =
    useState<PropertyPartsSelectionInput>('own');
  const [filterDialogOpened, setFilterDialogOpened] = useState(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [searchTextInput, setSearchTextInput] = useState('');
  const [showAttributeProperties, setShowAttributeProperties] = useState<boolean>(true);
  const [showIdentifierProperties, setShowIdentifierProperties] = useState<boolean>(true);
  const [showOutItemProperties, setShowOutItemProperties] = useState<boolean>(true);
  const [showInItemProperties, setShowInItemProperties] = useState<boolean>(true);

  const rootClass = useMemo<WdClassHierarchySurroundingsDescOnly>(() => {
    return rootSurroundings.classesMap.get(
      rootSurroundings.startClassId,
    ) as WdClassHierarchySurroundingsDescOnly;
  }, [rootSurroundings]);

  const propertiesGroups = useMemo<PropertiesGroups>(() => {
    const inAndOutProperties: InAndOutProperties = retrieveInAndOutProperties(
      rootClass,
      rootSurroundings,
      propertyPartsSelection,
    );
    return splitPropertiesIntoGroups(inAndOutProperties);
  }, [rootClass, rootSurroundings, propertyPartsSelection]);

  const attributeProperties = useMemo<WdPropertyDescOnly[]>(() => {
    if (showAttributeProperties) {
      return textFilter(propertiesGroups.attributeProperties, searchTextInput);
    } else return [];
  }, [propertiesGroups, searchTextInput, showAttributeProperties]);

  const identifierProperties = useMemo<WdPropertyDescOnly[]>(() => {
    if (showIdentifierProperties) {
      return textFilter(propertiesGroups.identifierProperties, searchTextInput);
    } else return [];
  }, [propertiesGroups, searchTextInput, showIdentifierProperties]);

  const outItemProperties = useMemo<WdPropertyDescOnly[]>(() => {
    if (showOutItemProperties) {
      return textFilter(propertiesGroups.outItemProperties, searchTextInput);
    } else return [];
  }, [propertiesGroups, searchTextInput, showOutItemProperties]);

  const inItemProperties = useMemo<WdPropertyDescOnly[]>(() => {
    if (showInItemProperties) {
      return textFilter(propertiesGroups.inItemProperties, searchTextInput);
    } else return [];
  }, [propertiesGroups, searchTextInput, showInItemProperties]);

  return (
    <div className='flex flex-col space-y-2'>
      <div>
        {filter == null ? (
          <Button variant='contained' onClick={() => setFilterDialogOpened(true)}>
            Filter By Instance
          </Button>
        ) : (
          <Button
            color='error'
            variant='contained'
            onClick={() => {
              setFilter(undefined);
            }}
          >
            Cancel Filter
          </Button>
        )}
      </div>
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
              value={propertyPartsSelection}
              label='Display'
              size='small'
              onChange={(e) => {
                const value = e.target.value;
                if (value !== 'inherited' && value !== 'own') setPropertyPartsSelection('own');
                else setPropertyPartsSelection(value);
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
            propertyAccordionType={'Attributes'}
            propertyPartsSelection={propertyPartsSelection}
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
            propertyAccordionType={'Identifiers'}
            propertyPartsSelection={propertyPartsSelection}
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
            propertyAccordionType={'Outwards'}
            propertyPartsSelection={propertyPartsSelection}
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
            propertyAccordionType={'Inwards'}
            propertyPartsSelection={propertyPartsSelection}
          />
        ) : (
          <></>
        )}
      </div>
      <FilterByInstanceDialog
        handleSetInstanceFilter={(x: string) => setFilter(x)}
        isOpen={filterDialogOpened}
        onDialogClose={() => setFilterDialogOpened(false)}
      />
    </div>
  );
}
