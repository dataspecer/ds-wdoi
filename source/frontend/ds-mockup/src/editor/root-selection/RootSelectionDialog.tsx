import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { WdClassDocsOnly } from '../../wikidata/entities/wd-class';
import { SearchList } from './SearchList';

export function RootSelectionDialog({
  setNewRootHandle,
  isOpen,
  onCloseHandle,
}: {
  setNewRootHandle: (newRoot: WdClassDocsOnly) => void;
  isOpen: boolean;
  onCloseHandle: () => void;
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={onCloseHandle}
      maxWidth='lg'
      fullWidth={true}
      PaperProps={{ sx: { height: '90%' } }}
    >
      <DialogTitle>Root selection</DialogTitle>
      <DialogContent>
        <SearchList setNewRootHandle={setNewRootHandle} />
      </DialogContent>
    </Dialog>
  );
}
