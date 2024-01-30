import axios from 'axios';
import { EntityId, WdEntityDocsOnly } from '../../wikidata/entities/wd-entity';
import { WdProperty, WdPropertyDocsOnly } from '../../wikidata/entities/wd-property';
import { GetPropertyWithSurroundingNamesReply } from '../../wikidata/query-types/get-entity';
import { buildEntityMap } from '../utils/build-entity-map';
import { WdClassDocsOnly } from '../../wikidata/entities/wd-class';
import { useQuery } from 'react-query';
import { Stack, Typography } from '@mui/material';
import { EntityDocsList } from './EntityDocsList';

interface PropertyWithSurroundingDocs {
  entity: WdProperty;
  classesDocsMap: Map<EntityId, WdClassDocsOnly>;
  propertyDocsMap: Map<EntityId, WdPropertyDocsOnly>;
}

async function fetchPropertyWithSurroundingNames(
  property: WdPropertyDocsOnly,
): Promise<PropertyWithSurroundingDocs> {
  const reply = (await axios.get(`/api/v2/properties/${property.id}`))
    .data as GetPropertyWithSurroundingNamesReply;
  const classesDocsMap = buildEntityMap(reply.results.surroundingClassNames);
  const propertyDocsMap = buildEntityMap(reply.results.surroundingPropertyNames);
  return { entity: reply.results.properties[0], classesDocsMap, propertyDocsMap };
}

export function PropertyDetail({
  entity,
  onNewDetailHandle,
}: {
  entity: WdPropertyDocsOnly;
  onNewDetailHandle: (wdEntityDocsOnly: WdEntityDocsOnly) => void;
}) {
  const { isLoading, isError, data, error } = useQuery(['detail', entity.iri], async () => {
    return await fetchPropertyWithSurroundingNames(entity);
  });

  if (isLoading || isError) return <> Loading or error </>;

  const results = data as PropertyWithSurroundingDocs;

  return (
    <Stack direction='column'>
      <EntityDocsList
        name='Subproperty of'
        idsList={results.entity.subpropertyOf}
        entityMap={results.propertyDocsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
      <EntityDocsList
        name='Subproperties'
        idsList={results.entity.subproperties}
        entityMap={results.propertyDocsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
      <EntityDocsList
        name='Domain'
        idsList={[
          ...results.entity.generalConstraints.subjectType.instanceOf,
          ...results.entity.generalConstraints.subjectType.subclassOfInstanceOf,
        ]}
        entityMap={results.classesDocsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
    </Stack>
  );
}
