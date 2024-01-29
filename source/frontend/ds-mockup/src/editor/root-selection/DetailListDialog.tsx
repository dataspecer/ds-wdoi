import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { WdClassDocsOnly } from '../../wikidata/entities/wd-class';
import { WdEntityDocsOnly, isEntityPropertyDocs } from '../../wikidata/entities/wd-entity';
import { useState } from 'react';
import { WdPropertyDocsOnly } from '../../wikidata/entities/wd-property';
import { ClassDetail } from './ClassDetail';
import { PropertyDetail } from './PropertyDetail';

export function DetailList({
  detailOpened,
  detailEntity,
  onCloseHandle,
  setNewRootHandle,
}: {
  detailOpened: boolean;
  detailEntity: WdEntityDocsOnly | undefined;
  onCloseHandle: () => void;
  setNewRootHandle: (newRoot: WdClassDocsOnly) => void;
}) {
  const [entitiesList, setEntitiesList] = useState<WdEntityDocsOnly[]>([]);

  let currentEntity = detailEntity as WdEntityDocsOnly;
  if (entitiesList.length !== 0) {
    currentEntity = entitiesList[entitiesList.length - 1];
  }
  const currentEntityIsPropertyDocs = isEntityPropertyDocs(currentEntity);

  function onNewDetailHandle(wdEntityDocs: WdEntityDocsOnly) {
    setEntitiesList([...entitiesList, wdEntityDocs]);
  }

  return (
    <Dialog
      open={detailOpened}
      onClose={onCloseHandle}
      maxWidth='md'
      fullWidth={true}
      PaperProps={{ sx: { height: 400 } }}
    >
      <DialogTitle>
        {currentEntity.labels['en']} (
        {(currentEntityIsPropertyDocs ? 'P' : 'Q') + currentEntity.id.toString()})
        <Button href={currentEntity.iri} target='_blank'>
          Link
        </Button>
      </DialogTitle>
      <DialogContent>
        <div className='flex flex-col'>
          <Typography>{currentEntity.descriptions['en'] ?? 'No description'}</Typography>
        </div>
        {currentEntityIsPropertyDocs ? (
          <PropertyDetail
            entity={currentEntity as WdPropertyDocsOnly}
            onNewDetailHandle={onNewDetailHandle}
          />
        ) : (
          <ClassDetail
            entity={currentEntity as WdClassDocsOnly}
            onNewDetailHandle={onNewDetailHandle}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant='text'
          disabled={entitiesList.length === 0}
          onClick={() => {
            setEntitiesList(entitiesList.slice(0, -1));
          }}
        >
          Back ({entitiesList.length})
        </Button>
        <Button
          variant='text'
          disabled={currentEntityIsPropertyDocs}
          onClick={() => setNewRootHandle(currentEntity as WdClassDocsOnly)}
        >
          Select As root
        </Button>
        <Button variant='text' onClick={onCloseHandle}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
