import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  WdClassDescOnly,
  WdClassHierarchySurroundingsDescOnly,
} from '../../wikidata/entities/wd-class';
import { SelectedProperty } from './selected-property';
import { useQuery } from 'react-query';
import {
  ClassSurroundings,
  fetchClassSurroundings,
} from '../../wikidata/query/get-class-surroundings';
import { useState } from 'react';
import { AncestorsDisplay } from './AncestorsDisplay';
import { AssociationsDisplay } from './associations/AssociationsDisplay';

export function SurroundingsDialog({
  root,
  isOpen,
  onPropertySelectionDialogClose,
}: {
  root: WdClassDescOnly;
  isOpen: boolean;
  onPropertySelectionDialogClose: (selectedProperties: SelectedProperty[]) => void;
}) {
  const [selectedParent, setSelectedParent] = useState<
    WdClassHierarchySurroundingsDescOnly | undefined
  >(undefined);
  const [selectedProperties, setSelectedProperties] = useState<SelectedProperty[]>([]);
  const { isLoading, isError, data } = useQuery(['surroundings', root.iri], async () => {
    return await fetchClassSurroundings(root);
  });

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
            <div className='flex h-screen justify-center bg-slate-100 px-1'>
              <div className='m-auto flex w-9/12 justify-center'>
                <CircularProgress />
              </div>
            </div>
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
                    ? (rootSurroundings.classesMap.get(
                        rootSurroundings.startClassId,
                      ) as WdClassHierarchySurroundingsDescOnly)
                    : selectedParent
                }
                setSelectedPropertiesUpper={setSelectedProperties}
                rootSurroundings={rootSurroundings}
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
