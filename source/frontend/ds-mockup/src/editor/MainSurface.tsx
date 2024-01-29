import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { WdClassDocsOnly } from '../wikidata/entities/wd-class';
import { RootSelectionDialog } from './root-selection/RootSelectionDialog';

export function MainSurface() {
  const [root, setRoot] = useState<WdClassDocsOnly | undefined>(undefined);
  const [rootDialogOpened, setRootDialogOpened] = useState<boolean>(false);

  function setNewRootHandle(newRoot: WdClassDocsOnly): void {
    setRoot(newRoot);
    setRootDialogOpened(false);
  }

  function onCloseHandle(): void {
    console.log('closed');
    setRootDialogOpened(false);
  }

  return (
    <Stack direction='column' spacing={2} margin={2}>
      <div className='flex justify-end'>
        <Button
          variant='contained'
          onClick={() => {
            setRootDialogOpened(true);
          }}
        >
          Set root element
        </Button>
      </div>
      <div>
        <Typography>{root != null ? root.labels['en'] : 'Nothing to see'}</Typography>
      </div>
      {rootDialogOpened ? (
        <RootSelectionDialog
          setNewRootHandle={setNewRootHandle}
          isOpen={rootDialogOpened}
          onCloseHandle={onCloseHandle}
        />
      ) : (
        <></>
      )}
    </Stack>
  );
}
