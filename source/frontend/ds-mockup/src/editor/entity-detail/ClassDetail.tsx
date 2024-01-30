import axios from 'axios';
import { EntityId, WdEntityDocsOnly } from '../../wikidata/entities/wd-entity';
import { WdPropertyDocsOnly } from '../../wikidata/entities/wd-property';
import { GetClassWithSurroundingNamesReply } from '../../wikidata/query-types/get-entity';
import { buildEntityMap } from '../utils/build-entity-map';
import { WdClass, WdClassDocsOnly } from '../../wikidata/entities/wd-class';
import { useQuery } from 'react-query';
import { Divider, Stack } from '@mui/material';
import { EntityDocsList } from './EntityDocsList';

interface ClassWithSurroundingDocs {
  entity: WdClass;
  classesDocsMap: Map<EntityId, WdClassDocsOnly>;
  propertyDocsMap: Map<EntityId, WdPropertyDocsOnly>;
}

async function fetchClassWithSurroundingNames(
  cls: WdClassDocsOnly,
): Promise<ClassWithSurroundingDocs> {
  const reply = (await axios.get(`/api/v2/classes/${cls.id}`))
    .data as GetClassWithSurroundingNamesReply;
  const classesDocsMap = buildEntityMap(reply.results.surroundingClassNames);
  const propertyDocsMap = buildEntityMap(reply.results.surroundingPropertyNames);
  return { entity: reply.results.classes[0], classesDocsMap, propertyDocsMap };
}

export function ClassDetail({
  entity,
  onNewDetailHandle,
}: {
  entity: WdClassDocsOnly;
  onNewDetailHandle: (wdEntityDocsOnly: WdEntityDocsOnly) => void;
}) {
  const { isLoading, isError, data, error } = useQuery(['detail', entity.iri], async () => {
    return await fetchClassWithSurroundingNames(entity);
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
