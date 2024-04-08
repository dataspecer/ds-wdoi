import { Button, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { WdClassDescOnly } from '../wikidata/entities/wd-class';
import { RootSelectionDialog } from './root-selection/RootSelectionDialog';
import { SelectedProperty } from './surroundings/selected-property';
import { SurroundingsDialog } from './surroundings/SurroundingsDialog';
import ControlPointIcon from '@mui/icons-material/ControlPoint';

export function MainSurface() {
  const [root, setRoot] = useState<WdClassDescOnly | undefined>(undefined);
  const [rootDialogOpened, setRootDialogOpened] = useState<boolean>(false);
  const [propertySelectionDialogOpened, setPropertySelectionDialogOpened] = useState(false);

  function setNewRootHandle(newRoot: WdClassDescOnly): void {
    setRoot(newRoot);
    setRootDialogOpened(false);
  }

  function onSearchDialogCloseHandle(): void {
    setRootDialogOpened(false);
  }

  function onPropertySelectionDialogClose(selectedProperties: SelectedProperty[]) {
    setPropertySelectionDialogOpened(false);
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
        {root != null ? (
          <div className='flex flex-row items-center'>
            <Typography className=' font-bold'>{root.labels['en']}</Typography>
            <IconButton
              onClick={() => {
                setPropertySelectionDialogOpened(true);
              }}
            >
              <ControlPointIcon />
            </IconButton>
          </div>
        ) : (
          <></>
        )}
      </div>
      <>
        {rootDialogOpened && (
          <RootSelectionDialog
            setNewRootHandle={setNewRootHandle}
            isOpen={rootDialogOpened}
            onCloseHandle={onSearchDialogCloseHandle}
          />
        )}
        {propertySelectionDialogOpened && root != null && (
          <SurroundingsDialog
            root={root}
            isOpen={propertySelectionDialogOpened}
            onPropertySelectionDialogClose={onPropertySelectionDialogClose}
          />
        )}
      </>
    </Stack>
  );
}
