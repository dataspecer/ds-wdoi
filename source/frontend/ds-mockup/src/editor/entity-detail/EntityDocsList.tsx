import { List, ListItem, ListItemButton, Typography } from '@mui/material';
import { EntityId, EntityIdsList, WdEntityDescOnly } from '../../wikidata/entities/wd-entity';

export function EntityDocsList({
  name,
  idsList,
  entityMap,
  onNewDetailHandle,
}: {
  name: string;
  idsList: EntityIdsList;
  entityMap: Map<EntityId, WdEntityDescOnly>;
  onNewDetailHandle: (wdEntityDocs: WdEntityDescOnly) => void;
}) {
  return (
    <div>
      <h3>{name}</h3>
      <List>
        {idsList.map((entityId, index) => {
          const docsEntity = entityMap.get(entityId) as WdEntityDescOnly;
          return (
            <ListItem key={docsEntity.iri} disablePadding>
              <ListItemButton
                onClick={() => {
                  onNewDetailHandle(docsEntity);
                }}
              >
                <div className='flex flex-col'>
                  <Typography className='font-bold'>{docsEntity.labels['en']} </Typography>
                  <Typography>{docsEntity.descriptions['en'] ?? ''}</Typography>
                </div>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
