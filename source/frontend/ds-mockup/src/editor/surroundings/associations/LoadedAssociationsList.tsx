import { useQuery } from 'react-query';
import { WdClass, WdClassDocsOnly } from '../../../wikidata/entities/wd-class';
import {
  ClassSurroundings,
  fetchClassSurroundings,
} from '../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../selected-property';
import { AssociationsList } from './AssociationsList';

export function LoadedAssociationsList({
  selectedClass,
  setSelectedPropertiesUpper,
}: {
  selectedClass: WdClass;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}) {
  const { isLoading, isError, data, error } = useQuery(
    ['surroundings', selectedClass.iri],
    async () => {
      return await fetchClassSurroundings(selectedClass);
    },
  );

  if (isLoading || isError) return <>Is loading or is error</>;

  const rootSurroundings = data as ClassSurroundings;
  return (
    <AssociationsList
      rootSurroundings={rootSurroundings}
      setSelectedPropertiesUpper={setSelectedPropertiesUpper}
    />
  );
}
