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
import {
  GetFilterByInstanceResults,
  fetchFilterByInstance,
} from '../../../../wikidata/query/get-filter-by-instance';
import CircularProgress from '@mui/material/CircularProgress';

export function FilterByInstanceDialog({
  handleSetInstanceFilter,
  isOpen,
  onDialogClose,
}: {
  handleSetInstanceFilter: (f: GetFilterByInstanceResults) => void;
  isOpen: boolean;
  onDialogClose: () => void;
}) {
  const [text, setText] = useState<string>('');
  const [wasApplied, setWasApplied] = useState(false);
  const { isLoading, isError, data, refetch } = useQuery(
    ['instanceFilter', text],
    async () => {
      return await fetchFilterByInstance(text);
    },
    { refetchOnWindowFocus: false, enabled: false },
  );

  useEffect(() => {
    if (data != null && !isLoading && !isError) {
      if (data.instanceOfIds.length !== 0) {
        setText('');
        handleSetInstanceFilter(data);
        onDialogClose();
      }
    }
  }, [data, handleSetInstanceFilter, onDialogClose, isLoading, isError]);

  const wasError =
    (wasApplied && isError) || (wasApplied && data != null && data.instanceOfIds.length === 0);

  return (
    <Dialog
      open={isOpen}
      onClose={onDialogClose}
      maxWidth='md'
      fullWidth={true}
      PaperProps={{ sx: { height: 300 } }}
    >
      <DialogTitle>Input instance URL</DialogTitle>
      <DialogContent className='flex h-screen justify-center bg-slate-100 px-1'>
        <div className='m-auto flex w-9/12 justify-center'>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <TextField
              size='small'
              label='Paste or type instance URL'
              variant='standard'
              fullWidth
              disabled={isLoading}
              error={wasError}
              helperText={
                wasError &&
                'Invalid instance: instance does not exists, or the class is not part of the ontology, or it lacks instance of property.'
              }
              onChange={(e) => setText(e.target.value)}
            ></TextField>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant='text'
          disabled={isLoading}
          onClick={() => {
            refetch();
            setWasApplied(true);
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
