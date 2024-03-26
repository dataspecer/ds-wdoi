import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { fetchClassWithSurroundingsDocs } from '../../../../wikidata/query/get-entity';
import { WdClass } from '../../../../wikidata/entities/wd-class';

export function FilterByInstanceDialog({
  handleSetInstanceFilter,
  isOpen,
  onDialogClose,
}: {
  handleSetInstanceFilter: (x: string) => void;
  isOpen: boolean;
  onDialogClose: () => void;
}) {
  const [text, setText] = useState<string>('');
  const { isLoading, isError, data, refetch } = useQuery(
    ['instanceFilter', text],
    async () => {
      const _ = await fetchClassWithSurroundingsDocs({ id: 0 } as WdClass);
      return 'ok';
    },
    { refetchOnWindowFocus: false, enabled: false },
  );

  useEffect(() => {
    if (data != null && data !== '' && !isLoading && !isError) {
      setText('');
      handleSetInstanceFilter(data);
      onDialogClose();
    }
  }, [data, handleSetInstanceFilter, onDialogClose, isLoading, isError]);

  return (
    <Dialog
      open={isOpen}
      onClose={onDialogClose}
      maxWidth='md'
      fullWidth={true}
      PaperProps={{ sx: { height: 300 } }}
    >
      <DialogTitle>Input instance URL</DialogTitle>
      <DialogContent className='bg-slate-100 px-0'>
        <div className='m-2 flex flex-col space-y-1'>
          <TextField
            size='small'
            label='Instance URL'
            variant='standard'
            fullWidth
            disabled={isLoading}
            error={isError}
            helperText={isError ? 'Invalid instance, input different one.' : ''}
            onChange={(e) => setText(e.target.value)}
          ></TextField>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant='text'
          disabled={isLoading}
          onClick={() => {
            refetch();
          }}
        >
          Apply
        </Button>
        <Button variant='text' onClick={onDialogClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
