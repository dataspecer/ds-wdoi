import { WdEntityDocsOnly } from '../../wikidata/entities/wd-entity';
import {
  ClassWithSurroundingDocs,
  fetchClassWithSurroundingsDocs,
} from '../../wikidata/query/get-entity';
import { WdClassDocsOnly } from '../../wikidata/entities/wd-class';
import { useQuery } from 'react-query';
import { Stack } from '@mui/material';
import { EntityDocsList } from './EntityDocsList';

export function ClassDetail({
  entity,
  onNewDetailHandle,
}: {
  entity: WdClassDocsOnly;
  onNewDetailHandle: (wdEntityDocsOnly: WdEntityDocsOnly) => void;
}) {
  const { isLoading, isError, data, error } = useQuery(['detail', entity.iri], async () => {
    return await fetchClassWithSurroundingsDocs(entity);
  });

  if (isLoading || isError) return <>is loading or error</>;

  const results = data as ClassWithSurroundingDocs;

  return (
    <Stack direction='column'>
      <EntityDocsList
        name='Subclass of'
        idsList={results.entity.subclassOf}
        entityMap={results.classesDocsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
      <EntityDocsList
        name='Instance of'
        idsList={results.entity.instanceOf}
        entityMap={results.classesDocsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
      <EntityDocsList
        name='Domain of'
        idsList={results.entity.subjectOfProperty}
        entityMap={results.propertyDocsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
      <EntityDocsList
        name='Range of '
        idsList={results.entity.valueOfProperty}
        entityMap={results.propertyDocsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
    </Stack>
  );
}
