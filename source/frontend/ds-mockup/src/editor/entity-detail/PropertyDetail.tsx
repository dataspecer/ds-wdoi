import { WdEntityDescOnly } from '../../wikidata/entities/wd-entity';
import { WdPropertyDescOnly } from '../../wikidata/entities/wd-property';
import {
  PropertyWithSurroundingDocs,
  fetchPropertyWithSurroundingsNames,
} from '../../wikidata/query/get-entity';
import { useQuery } from 'react-query';
import { Stack } from '@mui/material';
import { EntityDocsList } from './EntityDocsList';

export function PropertyDetail({
  entity,
  onNewDetailHandle,
}: {
  entity: WdPropertyDescOnly;
  onNewDetailHandle: (wdEntityDocsOnly: WdEntityDescOnly) => void;
}) {
  const { isLoading, isError, data, error } = useQuery(['detail', entity.iri], async () => {
    return await fetchPropertyWithSurroundingsNames(entity);
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
    </Stack>
  );
}
