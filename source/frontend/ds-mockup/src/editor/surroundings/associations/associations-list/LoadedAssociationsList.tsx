import { useQuery } from 'react-query';
import { WdClassHierarchySurroundingsDescOnly } from '../../../../wikidata/entities/wd-class';
import {
  ClassSurroundings,
  fetchClassSurroundings,
} from '../../../../wikidata/query/get-class-surroundings';
import { SelectedProperty } from '../../selected-property';
import { AssociationsList } from './AssociationsList';
import { CircularProgress } from '@mui/material';

export function LoadedAssociationsList({
  selectedClass,
  setSelectedPropertiesUpper,
}: {
  selectedClass: WdClassHierarchySurroundingsDescOnly;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}) {
  const { isLoading, isError, data } = useQuery(['surroundings', selectedClass.iri], async () => {
    return await fetchClassSurroundings(selectedClass);
  });

  if (isLoading)
    return (
      <div className='flex h-screen justify-center bg-slate-100 px-1'>
        <div className='m-auto flex w-9/12 justify-center'>
          <CircularProgress />
        </div>
      </div>
    );
  if (isError) return <>Error</>;
  const rootSurroundings = data as ClassSurroundings;

  return (
    <AssociationsList
      rootSurroundings={rootSurroundings}
      setSelectedPropertiesUpper={setSelectedPropertiesUpper}
    />
  );
}
