import { useState, useMemo } from 'react';
import { ClassSurroundings, SurroundingsParts } from '../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../selected-property';
import { EntityIdsList, WdEntityDocsOnly } from '../../../wikidata/entities/wd-entity';
import { WdClass } from '../../../wikidata/entities/wd-class';
import { UnderlyingType, WdProperty } from '../../../wikidata/entities/wd-property';
import { DetailListDialog } from '../../entity-detail/DetailListDialog';
import {
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';

type PropertySelectionInput = 'inherited' | 'own';

function getFilteredProperties(
  rootClass: WdClass,
  rootSurroundings: ClassSurroundings,
  selectionInput: PropertySelectionInput,
  searchTextInput: string,
): [EntityIdsList, EntityIdsList] {
  let rootIsSubjectOf = rootSurroundings.subjectOfIds;
  let rootIsValueOf = rootSurroundings.valueOfIds;
  if (selectionInput === 'own') {
    rootIsSubjectOf = rootClass.subjectOfProperty;
    rootIsValueOf = rootClass.valueOfProperty;
  }
  if (searchTextInput === '') return [rootIsSubjectOf, rootIsValueOf];
  else {
    rootIsSubjectOf = rootIsSubjectOf.filter((propId) => {
      const prop = rootSurroundings.propertiesMap.get(propId) as WdProperty;
      return prop.labels['en'].toLowerCase().includes(searchTextInput);
    });
    rootIsValueOf = rootIsValueOf.filter((propId) => {
      const prop = rootSurroundings.propertiesMap.get(propId) as WdProperty;
      return prop.labels['en'].toLowerCase().includes(searchTextInput);
    });
    return [rootIsSubjectOf, rootIsValueOf];
  }
}

function RenderProperty({
  rootSurroundings,
  wdProperty,
  handleOpenDetail,
  orientation,
  endpoint,
}: {
  rootSurroundings: ClassSurroundings;
  wdProperty: WdProperty;
  handleOpenDetail: (wdEntityDocs: WdEntityDocsOnly) => void;
  orientation: 'in' | 'out';
  endpoint: WdClass | undefined;
}) {
  return (
    <ListItem
      key={'out+' + wdProperty.iri}
      disablePadding
      secondaryAction={
        <IconButton
          edge='end'
          aria-label='comments'
          onClick={() => {
            handleOpenDetail(wdProperty);
          }}
        >
          <InfoTwoToneIcon />
        </IconButton>
      }
    >
      <ListItemButton>
        <div className='flex flex-col'>
          <div className='flex flex-row items-center space-x-2'>
            <Typography className='font-bold'>{wdProperty.labels['en']} </Typography>
            <Typography>({'P' + wdProperty.id.toString()})</Typography>
            <Typography>{orientation === 'out' ? ' -(out)-> ' : '<-(in)-  '}</Typography>
            <Typography>
              {endpoint != null ? endpoint.labels['en'] : UnderlyingType[wdProperty.underlyingType]}
            </Typography>
          </div>
          <Typography>{wdProperty.descriptions['en'] ?? ''}</Typography>
        </div>
      </ListItemButton>
    </ListItem>
  );
}

function RenderAssociationList({
  rootClass,
  rootSurroundings,
  setSelectedPropertiesUpper,
  propertyList,
  orientation,
}: {
  rootClass: WdClass;
  rootSurroundings: ClassSurroundings;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
  propertyList: EntityIdsList;
  orientation: 'in' | 'out';
}) {
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailEntity, setDetailEntity] = useState<WdEntityDocsOnly | undefined>(undefined);
  const [selectedProperties, setSelectedProperties] = useState<SelectedProperty[]>([]);

  function handleCloseDetail() {
    setDetailEntity(undefined);
    setDetailOpened(false);
  }

  function handleOpenDetail(wdEntityDocs: WdEntityDocsOnly) {
    setDetailOpened(true);
    setDetailEntity(wdEntityDocs);
  }

  return (
    <div>
      <List>
        {propertyList.map((propId) => {
          const wdProperty = rootSurroundings.propertiesMap.get(propId) as WdProperty;
          return (
            <RenderProperty
              rootSurroundings={rootSurroundings}
              wdProperty={wdProperty}
              handleOpenDetail={handleOpenDetail}
              orientation={orientation}
              endpoint={undefined}
            />
          );
        })}
      </List>
      {detailOpened ? (
        <DetailListDialog
          detailOpened={detailOpened}
          detailEntity={detailEntity as WdEntityDocsOnly}
          confirmButtonText='OK'
          onCloseHandle={handleCloseDetail}
          onConfirmHandle={() => {
            handleCloseDetail();
          }}
          disableConfirmOn={() => false}
        ></DetailListDialog>
      ) : (
        <></>
      )}
    </div>
  );
}

export function AssociationsList({
  rootSurroundings,
  setSelectedPropertiesUpper,
  part,
}: {
  rootSurroundings: ClassSurroundings;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
  part: SurroundingsParts;
}) {
  console.log(rootSurroundings);
  const [searchTextInput, setSearchTextInput] = useState('');
  const [propertySelection, setPropertySelection] = useState<PropertySelectionInput>('own');

  const rootClass = rootSurroundings.classesMap.get(rootSurroundings.startClassId) as WdClass;

  const [subjectOf, valueOf] = useMemo<[EntityIdsList, EntityIdsList]>(() => {
    return getFilteredProperties(rootClass, rootSurroundings, propertySelection, searchTextInput);
  }, [rootSurroundings, propertySelection, searchTextInput, rootClass]);

  return (
    <div className='flex flex-col space-y-2'>
      <div>Associations</div>
      <div className='flex flex-row items-center space-x-2'>
        <div className='basis-3/5'>
          <TextField
            size='small'
            label='Type to search'
            variant='standard'
            fullWidth
            onChange={(e) => setSearchTextInput(e.target.value)}
          ></TextField>
        </div>
        <div className='basis-2/5'>
          <FormControl>
            <InputLabel id='property-selection-label'>Selection</InputLabel>
            <Select
              labelId='property-selection-label'
              id='property-selection'
              value={propertySelection}
              label='Selection'
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
      <div>Association</div>
      <RenderAssociationList
        rootClass={rootClass}
        rootSurroundings={rootSurroundings}
        setSelectedPropertiesUpper={setSelectedPropertiesUpper}
        propertyList={subjectOf}
        orientation='out'
      />
      <div>Backwards Association</div>
      <RenderAssociationList
        rootClass={rootClass}
        rootSurroundings={rootSurroundings}
        setSelectedPropertiesUpper={setSelectedPropertiesUpper}
        propertyList={valueOf}
        orientation='in'
      />
    </div>
  );
}
