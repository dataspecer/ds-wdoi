import { useCallback, useMemo, useState } from 'react';
import { WdClass } from '../../wikidata/entities/wd-class';
import { ClassSurroundings } from '../../wikidata/query/get-surroundings';
import React from 'react';
import { EntityId, EntityIdsList } from '../../wikidata/entities/wd-entity';
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
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export function AncestorsDisplay({
  rootSuroundings,
  setSelectedParentUpper,
}: {
  rootSuroundings: ClassSurroundings;
  setSelectedParentUpper: React.Dispatch<React.SetStateAction<WdClass | undefined>>;
}) {
  const [selectedParentLocal, setSelectedParentLocal] = useState<WdClass | undefined>(undefined);
  const [searchTextInput, setSearchTextInput] = useState('');

  const classesToDisplay = useMemo<EntityIdsList>(() => {
    const classes = [rootSuroundings.startClass, ...rootSuroundings.parents];
    if (searchTextInput === '') return classes;
    else {
      return classes.filter((id) => {
        const cls = rootSuroundings.classesMap.get(id) as WdClass;
        return cls.labels['en'].toLowerCase().includes(searchTextInput);
      });
    }
  }, [searchTextInput, rootSuroundings]);

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
          const cls = rootSuroundings.classesMap.get(clsId) as WdClass;
          const isSelected =
            (selectedParentLocal != null && selectedParentLocal.id === cls.id) ||
            (rootSuroundings.startClass === cls.id && selectedParentLocal == null);
          return (
            <div key={cls.iri} ref={refs[cls.id]}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ArrowDownwardIcon />}
                  aria-controls='panel1-content'
                  id='panel1-header'
                  className={isSelected ? ' bg-slate-200' : ''}
                >
                  <Typography>{cls.labels['en']}</Typography>
                  <Button
                    onClick={() => {
                      setSelectedParentLocal(cls);
                      setSelectedParentUpper(cls);
                    }}
                  >
                    Select
                  </Button>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {cls.subclassOf.map((subclassId) => {
                      const subclass = rootSuroundings.classesMap.get(subclassId) as WdClass;
                      const isSubclassSelected =
                        (selectedParentLocal != null && selectedParentLocal.id === subclass.id) ||
                        (rootSuroundings.startClass === subclass.id && selectedParentLocal == null);
                      return (
                        <ListItem
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
    </div>
  );
}
