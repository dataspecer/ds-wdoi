import { List, ListItem, IconButton, ListItemButton, Typography, TextField } from '@mui/material';
import { WdClass } from '../../../../../wikidata/entities/wd-class';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { DetailListDialog } from '../../../../entity-detail/DetailListDialog';
import { useMemo, useState } from 'react';
import { WdEntityDocsOnly } from '../../../../../wikidata/entities/wd-entity';

function textFilter(wdClasses: WdClass[], text: string): WdClass[] {
  if (text != null && text !== '') {
    return wdClasses.filter((cls) => cls.labels['en'].toLowerCase().includes(text));
  } else return wdClasses;
}

export function DomainOrRangeClassList({
  classes,
  closeDialog,
}: {
  classes: WdClass[];
  closeDialog: () => void;
}) {
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailEntity, setDetailEntity] = useState<WdEntityDocsOnly | undefined>(undefined);
  const [searchTextInput, setSearchTextInput] = useState<string>('');

  function handleCloseDetail() {
    setDetailEntity(undefined);
    setDetailOpened(false);
  }

  const filteredClasses = useMemo<WdClass[]>(() => {
    return textFilter(classes, searchTextInput);
  }, [classes, searchTextInput]);

  return (
    <div className='m-2 flex flex-col space-y-1'>
      <div>Classes: {filteredClasses.length}</div>
      <div>
        <TextField
          size='small'
          label='Type to search'
          variant='standard'
          fullWidth
          onChange={(e) => setSearchTextInput(e.target.value)}
        ></TextField>
      </div>
      <List>
        {filteredClasses.map((value, index) => {
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
              <ListItemButton onClick={closeDialog}>
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
      {detailOpened ? (
        <DetailListDialog
          detailOpened={detailOpened}
          detailEntity={detailEntity}
          onCloseHandle={handleCloseDetail}
          onConfirmHandle={handleCloseDetail}
          disableConfirmOn={() => false}
          confirmButtonText='OK'
        />
      ) : (
        <></>
      )}
    </div>
  );
}
