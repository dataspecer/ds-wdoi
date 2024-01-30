import { WdClass } from '../../../wikidata/entities/wd-class';
import { ClassSurroundings } from '../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../selected-property';
import { AssociationsList } from './AssociationsList';
import { LoadedAssociationsList } from './LoadedAssociationsList';

export function AssociationsDisplay({
  rootSurroundings,
  selectedClass,
  setSelectedPropertiesUpper,
}: {
  rootSurroundings: ClassSurroundings;
  selectedClass: WdClass | undefined;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}) {
  const isRootSelected =
    (selectedClass != null && selectedClass.id === rootSurroundings.startClassId) ||
    selectedClass == null;

  return (
    <div>
      {isRootSelected ? (
        <AssociationsList
          rootSurroundings={rootSurroundings}
          setSelectedPropertiesUpper={setSelectedPropertiesUpper}
        />
      ) : (
        <LoadedAssociationsList
          selectedClass={selectedClass as WdClass}
          setSelectedPropertiesUpper={setSelectedPropertiesUpper}
        />
      )}
    </div>
  );
}
