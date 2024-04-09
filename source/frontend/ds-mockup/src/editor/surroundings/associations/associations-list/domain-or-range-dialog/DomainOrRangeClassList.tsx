import { List, ListItem, IconButton, ListItemButton, Typography, TextField } from '@mui/material';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { DetailListDialog } from '../../../../entity-detail/DetailListDialog';
import { useMemo, useState } from 'react';
import { WdClassDescOnly } from '../../../../../wikidata/entities/wd-class';
import { EntityId, WdEntityDescOnly } from '../../../../../wikidata/entities/wd-entity';
import InfiniteScroll from 'react-infinite-scroll-component';

function textFilter(wdClasses: WdClassDescOnly[], text: string): WdClassDescOnly[] {
  if (text != null && text !== '') {
    return wdClasses.filter((cls) => cls.labels['en'].toLowerCase().includes(text));
  } else return wdClasses;
}

const CLASSES_PER_PAGE = 50;

export function DomainOrRangeClassList({
  classes,
  closeDialog,
}: {
  classes: WdClassDescOnly[];
  closeDialog: () => void;
}) {
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailEntity, setDetailEntity] = useState<WdEntityDescOnly | undefined>(undefined);
  const [searchTextInput, setSearchTextInput] = useState<string>('');
  const [listLength, setListLength] = useState<number>(CLASSES_PER_PAGE);

  function handleCloseDetail() {
    setDetailEntity(undefined);
    setDetailOpened(false);
  }

  const filteredClasses = useMemo<WdClassDescOnly[]>(() => {
    return textFilter(classes, searchTextInput);
  }, [classes, searchTextInput]);

  const len = filteredClasses.length < listLength ? filteredClasses.length : listLength;

  return (
    <div className='m-2 flex flex-col space-y-1'>
      <div>Classes: {filteredClasses.length}</div>
      <div>
        <TextField
          size='small'
          label='Type to search'
          variant='standard'
          fullWidth
          onChange={(e) => {
            setSearchTextInput(e.target.value);
            setListLength(CLASSES_PER_PAGE);
          }}
        ></TextField>
      </div>
      <List>
        <InfiniteScroll
          dataLength={len}
          next={() => {
            let newListLength = listLength + CLASSES_PER_PAGE;
            if (newListLength > filteredClasses.length) newListLength = filteredClasses.length;
            setListLength(newListLength);
          }}
          hasMore={true}
          scrollableTarget='scrollableDivId'
          loader={<p>Loading...</p>}
        >
          {filteredClasses.slice(0, len).map((value, index) => {
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
        </InfiniteScroll>
      </List>
      {detailOpened && (
        <DetailListDialog
          detailOpened={detailOpened}
          detailEntity={detailEntity}
          onCloseHandle={handleCloseDetail}
          onConfirmHandle={handleCloseDetail}
          disableConfirmOn={() => false}
          confirmButtonText='OK'
        />
      )}
    </div>
  );
}
