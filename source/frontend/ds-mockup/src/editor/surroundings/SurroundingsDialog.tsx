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
  const { isLoading, isError, data } = useQuery(
    ['surroundings', root.iri, 'constraints'],
    async () => {
      return await fetchClassSurroundings(root, 'constraints');
    },
  );

  const rootSurroundings = data as ClassSurroundings;

  return (
    <Dialog
      open={isOpen}
      onClose={() => onPropertySelectionDialogClose([])}
      maxWidth='lg'
      fullWidth={true}
      PaperProps={{ sx: { height: '90%' } }}
    >
      <DialogTitle>Select interpreted surroundings</DialogTitle>
      <DialogContent className='bg-slate-100 px-0'>
        {isLoading || isError ? (
          isLoading ? (
            'Loading'
          ) : (
            'Error'
          )
        ) : (
          <div className='mx-1 flex  flex-row p-1'>
            <div className='basis-3/12 p-1'>
              <AncestorsDisplay
                rootSurroundings={data as ClassSurroundings}
                setSelectedParentUpper={setSelectedParent}
              />
            </div>
            <div className='basis-9/12 p-1'>
              <AssociationsDisplay
                selectedClass={
                  selectedParent == null
                    ? (rootSurroundings.classesMap.get(rootSurroundings.startClassId) as WdClass)
                    : selectedParent
                }
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
