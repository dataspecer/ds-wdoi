import { ListItem, IconButton, ListItemButton, Typography } from '@mui/material';
import { WdClassHierarchySurroundingsDescOnly } from '../../../../wikidata/entities/wd-class';
import { WdEntityDescOnly } from '../../../../wikidata/entities/wd-entity';
import { UnderlyingType, WdPropertyDescOnly } from '../../../../wikidata/entities/wd-property';
import { ClassSurroundings } from '../../../../wikidata/query/get-class-surroundings';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { PropertyAccordionType } from './AssociationsAccordion';
import { useCallback, useContext, useState } from 'react';
import { DomainAndRangeDialog } from './domain-or-range-dialog/DomainAndRangeDialog';
import { PropertyPartsSelectionInput } from './AssociationsList';
import { FilterByInstanceContext } from './FilterByInstanceContext';

function isValidDomainRangeAccordion(propertyAccordionType: PropertyAccordionType): boolean {
  return propertyAccordionType !== 'Attributes' && propertyAccordionType !== 'Identifiers';
}

export function RenderProperty({
  rootClass,
  rootSurroundings,
  wdProperty,
  handleOpenDetail,
  propertyAccordionType,
  propertyPartsSelection,
}: {
  rootClass: WdClassHierarchySurroundingsDescOnly;
  rootSurroundings: ClassSurroundings;
  wdProperty: WdPropertyDescOnly;
  handleOpenDetail: (wdEntityDocs: WdEntityDescOnly) => void;
  propertyAccordionType: PropertyAccordionType;
  propertyPartsSelection: PropertyPartsSelectionInput;
}) {
  const [domainOrRangeDialogOpened, setDomainOrRangeDialogOpened] = useState<boolean>(false);
  const filterByInstance = useContext(FilterByInstanceContext);

  const onDialogCloseHandleCallback = useCallback(() => {
    setDomainOrRangeDialogOpened(false);
  }, [setDomainOrRangeDialogOpened]);

  const onDialogOpenHandleCallback = useCallback(() => {
    setDomainOrRangeDialogOpened(true);
  }, [setDomainOrRangeDialogOpened]);

  return (
    <ListItem
      key={wdProperty.iri}
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
      <ListItemButton
        onClick={
          isValidDomainRangeAccordion(propertyAccordionType) ? onDialogOpenHandleCallback : () => {}
        }
      >
        <div className='flex flex-col'>
          <div className='flex flex-row items-center space-x-2'>
            <Typography className='font-bold'>{wdProperty.labels['en']} </Typography>
            <Typography>({'P' + wdProperty.id.toString()})</Typography>
            <Typography className='text-sm text-slate-400'>
              Wikidata Datatype:
              {UnderlyingType[wdProperty.underlyingType]}
            </Typography>
          </div>
          <Typography>{wdProperty.descriptions['en'] ?? ''}</Typography>
        </div>
      </ListItemButton>
      {domainOrRangeDialogOpened && isValidDomainRangeAccordion(propertyAccordionType) ? (
        <DomainAndRangeDialog
          wdClass={rootClass}
          wdProperty={wdProperty}
          isOpen={domainOrRangeDialogOpened}
          onDialogClose={onDialogCloseHandleCallback}
          propertyPartsSelection={propertyPartsSelection}
          filterByInstanceClasses={
            propertyAccordionType === 'Outwards'
              ? filterByInstance?.subjectOfFilterRecordsMap.get(wdProperty.id)
              : filterByInstance?.valueOfFilterRecordsMap.get(wdProperty.id)
          }
          domainsOrRanges={propertyAccordionType === 'Outwards' ? 'ranges' : 'domains'}
        />
      ) : (
        <></>
      )}
    </ListItem>
  );
}
