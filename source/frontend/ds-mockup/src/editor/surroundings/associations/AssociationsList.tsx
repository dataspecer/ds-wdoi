import { ClassSurroundings } from '../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../selected-property';

export function AssociationsList({
  rootSurroundings,
  setSelectedPropertiesUpper,
}: {
  rootSurroundings: ClassSurroundings;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}) {
  return <div></div>;
}
