import { useQuery } from 'react-query';
import { WdClass } from '../../../../wikidata/entities/wd-class';
import {
  ClassSurroundings,
  SurroundingsParts,
  fetchClassSurroundings,
} from '../../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../../selected-property';
import { AssociationsList } from './AssociationsList';

export function LoadedAssociationsList({
  selectedClass,
  setSelectedPropertiesUpper,
  surroundingsPart,
}: {
  selectedClass: WdClass;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
  surroundingsPart: SurroundingsParts;
}) {
  const { isLoading, isError, data } = useQuery(
    ['surroundings', selectedClass.iri, surroundingsPart],
    async () => {
      return await fetchClassSurroundings(selectedClass, surroundingsPart);
    },
  );

  if (isLoading) return <>Is loading</>;
  if (isError) return <>Error</>;
  const rootSurroundings = data as ClassSurroundings;

  return (
    <AssociationsList
      rootSurroundings={rootSurroundings}
      setSelectedPropertiesUpper={setSelectedPropertiesUpper}
      surroundingsPart={surroundingsPart}
    />
  );
}
