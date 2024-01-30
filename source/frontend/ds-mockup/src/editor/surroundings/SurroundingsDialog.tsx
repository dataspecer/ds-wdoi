import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { WdClass, WdClassDocsOnly } from '../../wikidata/entities/wd-class';
import { SelectedProperty } from './selected-property';
import { useQuery } from 'react-query';
import { ClassSurroundings, fetchClassSurroundings } from '../../wikidata/query/get-surroundings';
import { useState } from 'react';
import { AncestorsDisplay } from './AncestorsDisplay';
import { AssociationsDisplay } from './associations/AssociationsDisplay';

export function SurroundingsDialog({
  root,
  isOpen,
  onPropertySelectionDialogClose,
}: {
  root: WdClassDocsOnly;
  isOpen: boolean;
  onPropertySelectionDialogClose: (selectedProperties: SelectedProperty[]) => void;
}) {
  const [selectedParent, setSelectedParent] = useState<WdClass | undefined>(undefined);
  const [selectedProperties, setSelectedProperties] = useState<SelectedProperty[]>([]);
  const { isLoading, isError, data } = useQuery(['surroundings', root.iri], async () => {
    return await fetchClassSurroundings(root);
  });

  return (
    <Dialog
      open={isOpen}
      onClose={() => onPropertySelectionDialogClose([])}
      maxWidth='md'
      fullWidth={true}
      PaperProps={{ sx: { height: 500 } }}
    >
      <DialogTitle>Select interpreted surroundings</DialogTitle>
      <DialogContent className='bg-slate-100 px-0'>
        {isLoading || isError ? (
          'Loading or error'
        ) : (
          <div className='flex flex-row '>
            <div className='basis-2/6'>
              <AncestorsDisplay
                rootSurroundings={data as ClassSurroundings}
                setSelectedParentUpper={setSelectedParent}
              />
            </div>
            <div className='basis-4/6'>
              {selectedParent != null ? selectedParent.labels['en'] : 'I am still root'}
              <AssociationsDisplay
                rootSurroundings={data as ClassSurroundings}
                selectedClass={selectedParent}
                setSelectedPropertiesUpper={setSelectedProperties}
              />
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onPropertySelectionDialogClose([])}>Cancel</Button>
        <Button
          onClick={() => onPropertySelectionDialogClose(selectedProperties)}
          disabled={selectedProperties.length === 0}
        >
          Confirm ({selectedProperties.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
