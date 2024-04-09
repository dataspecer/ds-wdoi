import {
  Typography,
  List,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  useMediaQuery,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { WdClassHierarchySurroundingsDescOnly } from '../../../../wikidata/entities/wd-class';
import { WdEntityDescOnly } from '../../../../wikidata/entities/wd-entity';
import { WdPropertyDescOnly } from '../../../../wikidata/entities/wd-property';
import { ClassSurroundings } from '../../../../wikidata/query/get-class-surroundings';
import { DetailListDialog } from '../../../entity-detail/DetailListDialog';
import { SelectedProperty } from '../../selected-property';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RenderProperty } from './RenderProperty';
import { PropertyPartsSelectionInput } from './AssociationsList';
import InfiniteScroll from 'react-infinite-scroll-component';

export type PropertyAccordionType = 'Identifiers' | 'Attributes' | 'Inwards' | 'Outwards';

const PROPERTIES_PER_PAGE = 50;

export function AssociationsAccordion({
  rootClass,
  rootSurroundings,
  setSelectedPropertiesUpper,
  propertyList,
  propertyAccordionType,
  propertyPartsSelection,
}: {
  rootClass: WdClassHierarchySurroundingsDescOnly;
  rootSurroundings: ClassSurroundings;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
  propertyList: WdPropertyDescOnly[];
  propertyAccordionType: PropertyAccordionType;
  propertyPartsSelection: PropertyPartsSelectionInput;
}) {
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailEntity, setDetailEntity] = useState<WdEntityDescOnly | undefined>(undefined);
  const [selectedProperties, setSelectedProperties] = useState<SelectedProperty[]>([]);
  const [listLength, setListLength] = useState<number>(PROPERTIES_PER_PAGE);

  const handleCloseDetailCallback = useCallback(() => {
    setDetailEntity(undefined);
    setDetailOpened(false);
  }, [setDetailEntity, setDetailOpened]);

  const handleOpenDetailCallback = useCallback(
    (wdEntityDocs: WdEntityDescOnly) => {
      setDetailOpened(true);
      setDetailEntity(wdEntityDocs);
    },
    [setDetailEntity, setDetailOpened],
  );

  const len = propertyList.length < listLength ? propertyList.length : listLength;

  return (
    <div>
      <Accordion variant='outlined' slotProps={{ transition: { unmountOnExit: true } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1-content'
          id='panel1-header'
        >
          <div className='flex flex-row items-center space-x-1'>
            <Typography>{propertyAccordionType}</Typography>
            <Typography className='text-sm text-slate-400'>
              {' (' + propertyList.length.toString() + ') '}
            </Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ height: '600px', overflowY: 'scroll' }} id={propertyAccordionType}>
          <List>
            <InfiniteScroll
              dataLength={len}
              next={() => {
                let newListLength = listLength + PROPERTIES_PER_PAGE;
                if (newListLength > propertyList.length) newListLength = propertyList.length;
                setListLength(newListLength);
              }}
              hasMore={true}
              scrollableTarget={propertyAccordionType}
              loader={<p>Loading...</p>}
            >
              {propertyList.slice(0, len).map((wdProperty) => {
                return (
                  <RenderProperty
                    key={wdProperty.iri}
                    rootClass={rootClass}
                    rootSurroundings={rootSurroundings}
                    wdProperty={wdProperty}
                    handleOpenDetail={handleOpenDetailCallback}
                    propertyAccordionType={propertyAccordionType}
                    propertyPartsSelection={propertyPartsSelection}
                  />
                );
              })}
            </InfiniteScroll>
          </List>
        </AccordionDetails>
      </Accordion>
      {detailOpened && (
        <DetailListDialog
          detailOpened={detailOpened}
          detailEntity={detailEntity as WdEntityDescOnly}
          confirmButtonText='OK'
          onCloseHandle={handleCloseDetailCallback}
          onConfirmHandle={handleCloseDetailCallback}
          disableConfirmOn={() => false}
        ></DetailListDialog>
      )}
    </div>
  );
}
