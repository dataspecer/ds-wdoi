import { useQuery } from 'react-query';
import { WdClassHierarchySurroundingsDescOnly } from '../../../../wikidata/entities/wd-class';
import {
  ClassSurroundings,
  fetchClassSurroundings,
} from '../../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../../selected-property';
import { AssociationsList } from './AssociationsList';

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

  if (isLoading) return <>Is loading</>;
  if (isError) return <>Error</>;
  const rootSurroundings = data as ClassSurroundings;

  return (
    <AssociationsList
      rootSurroundings={rootSurroundings}
      setSelectedPropertiesUpper={setSelectedPropertiesUpper}
    />
  );
}
