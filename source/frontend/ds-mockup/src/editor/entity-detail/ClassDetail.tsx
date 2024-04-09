import { WdEntityDescOnly } from '../../wikidata/entities/wd-entity';
import { WdClassDescOnly } from '../../wikidata/entities/wd-class';
import { useQuery } from 'react-query';
import { Stack } from '@mui/material';
import { EntityDocsList } from './EntityDocsList';
import {
  ClassWithSurroundingsDesc,
  fetchClassWithSurroundingsDecs,
} from '../../wikidata/query/get-class';

export function ClassDetail({
  cls,
  onNewDetailHandle,
}: {
  cls: WdClassDescOnly;
  onNewDetailHandle: (wdEntityDocsOnly: WdEntityDescOnly) => void;
}) {
  const { isLoading, isError, data, error } = useQuery(['detail', cls.iri], async () => {
    return await fetchClassWithSurroundingsDecs(cls);
  });

  if (isLoading || isError) return <>is loading or error</>;

  const results = data as ClassWithSurroundingsDesc;

  return (
    <Stack direction='column'>
      <EntityDocsList
        key='Subclass of'
        name='Subclass of'
        idsList={results.class.subclassOf}
        entityMap={results.surroundingClassesDecsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
      <EntityDocsList
        key='Domain of'
        name='Domain of'
        idsList={results.class.subjectOfProperty}
        entityMap={results.surroundingPropertiesDecsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
      <EntityDocsList
        key='Range of'
        name='Range of'
        idsList={results.class.valueOfProperty}
        entityMap={results.surroundingPropertiesDecsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
    </Stack>
  );
}
