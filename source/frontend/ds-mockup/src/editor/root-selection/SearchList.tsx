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
import { WdClassDocsOnly } from '../../wikidata/entities/wd-class';
import { useQuery } from 'react-query';
import { useState, useEffect } from 'react';
import { fetchSearch } from '../../wikidata/query/get-search';
import {
  WdEntity,
  WdEntityDocsOnly,
  isEntityPropertyDocs,
} from '../../wikidata/entities/wd-entity';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { DetailListDialog } from '../entity-detail/DetailListDialog';

export function SearchList({
  setNewRootHandle,
}: {
  setNewRootHandle: (newRoot: WdClassDocsOnly) => void;
}) {
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailEntity, setDetailEntity] = useState<WdEntityDocsOnly | undefined>(undefined);
  const [textInput, setTextInput] = useState<string>('');
  // const [displayingClasses, setDisplayingClasses] = useState(true);
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
  //let propertiesCount = 0;
  let itemsToRender: WdEntity[] = [];
  if (!isRefetching && data != null && textInput !== '') {
    classesCount = data.results.classes.length;
    //propertiesCount = data.results.properties.length;
    //displayingClasses ? data.results.classes : data.results.properties;
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
          <Button
            variant={'outlined'}

            //variant={displayingClasses ? 'outlined' : 'text'}
            //onClick={() => setDisplayingClasses(true)}
          >
            Classes ({classesCount})
          </Button>
          {/* <Button
            variant={displayingClasses ? 'text' : 'outlined'}
            onClick={() => setDisplayingClasses(false)}
          >
            Properties ({propertiesCount})
          </Button> */}
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
                  onClick={
                    () => {
                      setNewRootHandle(value as WdClassDocsOnly);
                    }
                    // displayingClasses
                    //   ? () => {
                    //       setNewRootHandle(value as WdClassDocsOnly);
                    //     }
                    //   : () => {}
                  }
                >
                  <div className='flex flex-col'>
                    <div className='flex flex-row space-x-2'>
                      <Typography className='font-bold'>{value.labels['en']} </Typography>
                      <Typography>
                        {
                          'Q' + value.id.toString()
                          /* ({displayingClasses ? 'Q' + value.id.toString() : 'P' + value.id.toString()}
                        ) */
                        }
                      </Typography>
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
          onConfirmHandle={(newRoot: WdEntityDocsOnly) => {
            setDetailOpened(false);
            setDetailEntity(undefined);
            // Assuming it is never activated with invalid condition.
            setNewRootHandle(newRoot as WdClassDocsOnly);
          }}
          disableConfirmOn={(wdEntityDocs: WdEntityDocsOnly) => {
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
