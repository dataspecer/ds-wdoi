import { WdClassHierarchySurroundingsDescOnly } from '../../../wikidata/entities/wd-class';
import { SelectedProperty } from '../selected-property';
import { LoadedAssociationsList } from './associations-list/LoadedAssociationsList';
import { ClassSurroundings } from '../../../wikidata/query/get-surroundings';
import { AssociationsList } from './associations-list/AssociationsList';

export function AssociationsDisplay({
  selectedClass,
  setSelectedPropertiesUpper,
  rootSurroundings,
}: {
  selectedClass: WdClassHierarchySurroundingsDescOnly;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
  rootSurroundings: ClassSurroundings;
}) {
  return (
    <div className=' flex-col space-y-3'>
      <div>Associations</div>
      {selectedClass.id === rootSurroundings.startClassId ? (
        <AssociationsList
          rootSurroundings={rootSurroundings}
          setSelectedPropertiesUpper={setSelectedPropertiesUpper}
        />
      ) : (
        <LoadedAssociationsList
          selectedClass={selectedClass}
          setSelectedPropertiesUpper={setSelectedPropertiesUpper}
        />
      )}
    </div>
  );
}
