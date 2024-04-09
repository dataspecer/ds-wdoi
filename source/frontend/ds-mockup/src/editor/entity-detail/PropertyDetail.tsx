import { WdEntityDescOnly } from '../../wikidata/entities/wd-entity';
import { WdPropertyDescOnly } from '../../wikidata/entities/wd-property';
import { useQuery } from 'react-query';
import { Stack } from '@mui/material';
import { EntityDocsList } from './EntityDocsList';
import {
  PropertyWithSurroundingDecs,
  fetchPropertyWithSurroundingsDecs,
} from '../../wikidata/query/get-property';

export function PropertyDetail({
  prop,
  onNewDetailHandle,
}: {
  prop: WdPropertyDescOnly;
  onNewDetailHandle: (wdEntityDocsOnly: WdEntityDescOnly) => void;
}) {
  const { isLoading, isError, data, error } = useQuery(['detail', prop.iri], async () => {
    return await fetchPropertyWithSurroundingsDecs(prop);
  });

  if (isLoading || isError) return <> Loading or error </>;

  const results = data as PropertyWithSurroundingDecs;

  return (
    <Stack direction='column'>
      <EntityDocsList
        name='Subproperty of'
        idsList={results.property.subpropertyOf}
        entityMap={results.surroundingPropertiesDecsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
      <EntityDocsList
        name='Subproperties'
        idsList={results.property.subproperties}
        entityMap={results.surroundingPropertiesDecsMap}
        onNewDetailHandle={onNewDetailHandle}
      />
    </Stack>
  );
}
