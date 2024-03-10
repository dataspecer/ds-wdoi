import {
  ListItem,
  IconButton,
  ListItemButton,
  Typography,
  List,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import { useState } from 'react';
import { WdClass } from '../../../../wikidata/entities/wd-class';
import { WdEntityDocsOnly } from '../../../../wikidata/entities/wd-entity';
import { WdProperty } from '../../../../wikidata/entities/wd-property';
import { ClassSurroundings } from '../../../../wikidata/query/get-surroundings';
import { DetailListDialog } from '../../../entity-detail/DetailListDialog';
import { SelectedProperty } from '../../selected-property';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RenderProperty } from './RenderProperty';

export function AssociationsAccordion({
  rootClass,
  rootSurroundings,
  setSelectedPropertiesUpper,
  propertyList,
  name,
}: {
  rootClass: WdClass;
  rootSurroundings: ClassSurroundings;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
  propertyList: WdProperty[];
  name: 'Identifiers' | 'Attributes' | 'Inwards' | 'Outwards';
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
      <Accordion variant='outlined' slotProps={{ transition: { unmountOnExit: true } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='panel1-content'
          id='panel1-header'
        >
          <div className='flex flex-row items-center space-x-1'>
            <Typography>{name}</Typography>
            <Typography className='text-sm text-slate-400'>
              {' (' + propertyList.length.toString() + ') '}
            </Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {propertyList.map((wdProperty) => {
              return (
                <RenderProperty
                  rootClass={rootClass}
                  rootSurroundings={rootSurroundings}
                  wdProperty={wdProperty}
                  handleOpenDetail={handleOpenDetail}
                />
              );
            })}
          </List>
        </AccordionDetails>
      </Accordion>
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
