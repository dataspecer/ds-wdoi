import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { WdClassDescOnly } from '../../wikidata/entities/wd-class';
import { WdEntityDescOnly, isEntityPropertyDocs } from '../../wikidata/entities/wd-entity';
import { useState } from 'react';
import { WdPropertyDescOnly } from '../../wikidata/entities/wd-property';
import { ClassDetail } from './ClassDetail';
import { PropertyDetail } from './PropertyDetail';

export function DetailListDialog({
  detailOpened,
  detailEntity,
  onCloseHandle,
  onConfirmHandle,
  disableConfirmOn,
  confirmButtonText,
}: {
  detailOpened: boolean;
  detailEntity: WdEntityDescOnly | undefined;
  onCloseHandle: () => void;
  onConfirmHandle: (newRoot: WdEntityDescOnly) => void;
  disableConfirmOn: (wdEntityDocs: WdEntityDescOnly) => boolean;
  confirmButtonText: string;
}) {
  const [entitiesList, setEntitiesList] = useState<WdEntityDescOnly[]>([]);

  let currentEntity = detailEntity as WdEntityDescOnly;
  if (entitiesList.length !== 0) {
    currentEntity = entitiesList[entitiesList.length - 1];
  }
  const currentEntityIsPropertyDocs = isEntityPropertyDocs(currentEntity);

  function onNewDetailHandle(wdEntityDocs: WdEntityDescOnly) {
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
            entity={currentEntity as WdPropertyDescOnly}
            onNewDetailHandle={onNewDetailHandle}
          />
        ) : (
          <ClassDetail
            entity={currentEntity as WdClassDescOnly}
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
          disabled={disableConfirmOn(currentEntity)}
          onClick={() => onConfirmHandle(currentEntity)}
        >
          {confirmButtonText}
        </Button>
        <Button variant='text' onClick={onCloseHandle}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
