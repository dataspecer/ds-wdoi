import { useQuery } from 'react-query';
import { WdClass } from '../../../wikidata/entities/wd-class';
import {
  ClassSurroundings,
  SurroundingsParts,
  fetchClassSurroundings,
} from '../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../selected-property';
import { AssociationsList } from './AssociationsList';

export function LoadedAssociationsList({
  selectedClass,
  setSelectedPropertiesUpper,
  part,
}: {
  selectedClass: WdClass;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
  part: SurroundingsParts;
}) {
  const { isLoading, isError, data } = useQuery(
    ['surroundings', selectedClass.iri, part],
    async () => {
      return await fetchClassSurroundings(selectedClass, part);
    },
  );

  if (isLoading) return <>Is loading</>;
  if (isError) return <>Error</>;
  const rootSurroundings = data as ClassSurroundings;

  return (
    <AssociationsList
      rootSurroundings={rootSurroundings}
      setSelectedPropertiesUpper={setSelectedPropertiesUpper}
      part={part}
    />
  );
}
