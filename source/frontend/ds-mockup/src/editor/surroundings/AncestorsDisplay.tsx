import { useMemo, useState } from 'react';
import { WdClass, WdClassDocsOnly } from '../../wikidata/entities/wd-class';
import { ClassSurroundings } from '../../wikidata/query/get-surroundings';
import React from 'react';
import { EntityId, EntityIdsList, WdEntityDocsOnly } from '../../wikidata/entities/wd-entity';
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Button,
  TextField,
  ListItem,
  List,
  ListItemButton,
  IconButton,
  Divider,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import { DetailListDialog } from '../entity-detail/DetailListDialog';

export function AncestorsDisplay({
  rootSurroundings,
  setSelectedParentUpper,
}: {
  rootSurroundings: ClassSurroundings;
  setSelectedParentUpper: React.Dispatch<React.SetStateAction<WdClass | undefined>>;
}) {
  const [selectedParentLocal, setSelectedParentLocal] = useState<WdClass | undefined>(undefined);
  const [searchTextInput, setSearchTextInput] = useState('');
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailEntity, setDetailEntity] = useState<WdClass | undefined>(undefined);

  function handleCloseDetail() {
    setDetailEntity(undefined);
    setDetailOpened(false);
  }

  const classesToDisplay = useMemo<EntityIdsList>(() => {
    const classes = [rootSurroundings.startClassId, ...rootSurroundings.parentsIds];
    if (searchTextInput === '') return classes;
    else {
      return classes.filter((id) => {
        const cls = rootSurroundings.classesMap.get(id) as WdClass;
        return cls.labels['en'].toLowerCase().includes(searchTextInput);
      });
    }
  }, [searchTextInput, rootSurroundings]);

  const refs = useMemo<{ [key: number]: React.RefObject<HTMLDivElement> }>(() => {
    return classesToDisplay.reduce(
      (acc: { [key: EntityId]: React.RefObject<HTMLDivElement> }, value) => {
        acc[value] = React.createRef();
        return acc;
      },
      {},
    );
  }, [classesToDisplay]);

  const scrollToViewClick = (entityId: EntityId) =>
    refs[entityId].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

  return (
    <div className='flex flex-col space-y-2'>
      <div>Ancestors</div>
      <div>
        <TextField
          size='small'
          label='Type to search'
          variant='standard'
          fullWidth
          onChange={(e) => setSearchTextInput(e.target.value)}
        />
      </div>
      <div>
        {classesToDisplay.map((clsId) => {
          const cls = rootSurroundings.classesMap.get(clsId) as WdClass;
          const isSelected =
            (selectedParentLocal != null && selectedParentLocal.id === cls.id) ||
            (rootSurroundings.startClassId === cls.id && selectedParentLocal == null);
          return (
            <div key={cls.iri} ref={refs[cls.id]}>
              <Accordion variant='outlined'>
                <AccordionSummary
                  expandIcon={<ArrowDownwardIcon />}
                  aria-controls='panel1-content'
                  id='panel1-header'
                  className={isSelected ? ' bg-slate-200' : ''}
                >
                  <div className='flex flex-row items-center'>
                    <Typography>{cls.labels['en']}</Typography>
                    <Button
                      onClick={() => {
                        setSelectedParentLocal(cls);
                        setSelectedParentUpper(cls);
                      }}
                    >
                      Select
                    </Button>
                    <IconButton
                      edge='end'
                      aria-label='comments'
                      onClick={() => {
                        setDetailOpened(true);
                        setDetailEntity(cls);
                      }}
                    >
                      <InfoTwoToneIcon />
                    </IconButton>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Children</Typography>
                  <List>
                    {cls.subclassOf.map((subclassId) => {
                      const subclass = rootSurroundings.classesMap.get(subclassId) as WdClass;
                      const isSubclassSelected =
                        (selectedParentLocal != null && selectedParentLocal.id === subclass.id) ||
                        (rootSurroundings.startClassId === subclass.id &&
                          selectedParentLocal == null);
                      return (
                        <ListItem
                          disablePadding
                          key={'subclass' + subclass.iri}
                          className={isSubclassSelected ? ' bg-slate-200' : ''}
                          secondaryAction={
                            <IconButton
                              edge='end'
                              aria-label='comments'
                              onClick={() => {
                                scrollToViewClick(subclass.id);
                              }}
                            >
                              <ExitToAppIcon />
                            </IconButton>
                          }
                        >
                          <ListItemButton
                            onClick={() => {
                              setSelectedParentLocal(subclass);
                              setSelectedParentUpper(subclass);
                            }}
                          >
                            <Typography>{subclass.labels['en']}</Typography>
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            </div>
          );
        })}
      </div>
      {detailOpened ? (
        <DetailListDialog
          detailOpened={detailOpened}
          detailEntity={detailEntity as WdClassDocsOnly}
          confirmButtonText='OK'
          onCloseHandle={handleCloseDetail}
          onConfirmHandle={() => {
            handleCloseDetail();
          }}
          disableConfirmOn={() => false}
        ></DetailListDialog>
      ) : (
        <></>
      )}
    </div>
  );
}
