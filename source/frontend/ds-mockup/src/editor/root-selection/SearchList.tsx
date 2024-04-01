import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { WdClassDescOnly } from '../../wikidata/entities/wd-class';
import { useQuery } from 'react-query';
import { useState, useEffect } from 'react';
import { fetchSearch } from '../../wikidata/query/get-search';
import { WdEntityDescOnly, isEntityPropertyDocs } from '../../wikidata/entities/wd-entity';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { DetailListDialog } from '../entity-detail/DetailListDialog';

export function SearchList({
  setNewRootHandle,
}: {
  setNewRootHandle: (newRoot: WdClassDescOnly) => void;
}) {
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailEntity, setDetailEntity] = useState<WdEntityDescOnly | undefined>(undefined);
  const [textInput, setTextInput] = useState<string>('');
  const { data, refetch, isError, isRefetching } = useQuery(
    ['search', textInput],
    async () => {
      return await fetchSearch(textInput);
    },
    { refetchOnWindowFocus: false, enabled: false },
  );

  useEffect(() => {
    if (textInput !== '') {
      refetch();
    }
  }, [textInput, refetch]);

  let classesCount = 0;
  let itemsToRender: WdClassDescOnly[] = [];
  if (!isRefetching && data != null && textInput !== '') {
    classesCount = data.results.classes.length;
    itemsToRender = data.results.classes;
  }

  return (
    <>
      <Stack direction='column' spacing={4}>
        <div>
          <TextField
            size='small'
            label='Type to search'
            variant='standard'
            fullWidth
            onChange={(e) => setTextInput(e.target.value)}
          ></TextField>
        </div>
        <Stack spacing={10} direction='row' justifyContent='center' alignItems='center'>
          <Button variant={'outlined'}>Classes ({classesCount})</Button>
        </Stack>
        <List>
          {itemsToRender.map((value, index) => {
            return (
              <ListItem
                key={value.iri}
                secondaryAction={
                  <IconButton
                    edge='end'
                    aria-label='comments'
                    onClick={() => {
                      setDetailOpened(true);
                      setDetailEntity(value);
                    }}
                  >
                    <InfoTwoToneIcon />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton
                  onClick={() => {
                    setNewRootHandle(value as WdClassDescOnly);
                  }}
                >
                  <div className='flex flex-col'>
                    <div className='flex flex-row space-x-2'>
                      <Typography className='font-bold'>{value.labels['en']} </Typography>
                      <Typography>{'Q' + value.id.toString()}</Typography>
                    </div>
                    <Typography>{value.descriptions['en'] ?? ''}</Typography>
                  </div>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Stack>
      {detailOpened ? (
        <DetailListDialog
          detailOpened={detailOpened}
          detailEntity={detailEntity}
          onCloseHandle={() => {
            setDetailOpened(false);
            setDetailEntity(undefined);
          }}
          onConfirmHandle={(newRoot: WdClassDescOnly) => {
            setDetailOpened(false);
            setDetailEntity(undefined);
            // Assuming it is never activated with invalid condition.
            setNewRootHandle(newRoot as WdClassDescOnly);
          }}
          disableConfirmOn={(wdEntityDocs: WdEntityDescOnly) => {
            return isEntityPropertyDocs(wdEntityDocs);
          }}
          confirmButtonText='Select as root'
        />
      ) : (
        <></>
      )}
    </>
  );
}
