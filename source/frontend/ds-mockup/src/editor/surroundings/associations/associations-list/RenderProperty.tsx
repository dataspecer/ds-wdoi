import { ListItem, IconButton, ListItemButton, Typography } from '@mui/material';
import { WdClass } from '../../../../wikidata/entities/wd-class';
import { WdEntityDocsOnly } from '../../../../wikidata/entities/wd-entity';
import { WdProperty, UnderlyingType } from '../../../../wikidata/entities/wd-property';
import { ClassSurroundings } from '../../../../wikidata/query/get-surroundings';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';

export function RenderProperty({
  rootClass,
  rootSurroundings,
  wdProperty,
  handleOpenDetail,
}: {
  rootClass: WdClass;
  rootSurroundings: ClassSurroundings;
  wdProperty: WdProperty;
  handleOpenDetail: (wdEntityDocs: WdEntityDocsOnly) => void;
}) {
  return (
    <ListItem
      key={wdProperty.iri}
      disablePadding
      secondaryAction={
        <IconButton
          edge='end'
          aria-label='comments'
          onClick={() => {
            handleOpenDetail(wdProperty);
          }}
        >
          <InfoTwoToneIcon />
        </IconButton>
      }
    >
      <ListItemButton>
        <div className='flex flex-col'>
          <div className='flex flex-row items-center space-x-2'>
            <Typography className='font-bold'>{wdProperty.labels['en']} </Typography>
            <Typography>({'P' + wdProperty.id.toString()})</Typography>
            <Typography className='text-sm text-slate-400'>
              Wikidata Datatype:
              {UnderlyingType[wdProperty.underlyingType]}
            </Typography>
          </div>
          <Typography>{wdProperty.descriptions['en'] ?? ''}</Typography>
        </div>
      </ListItemButton>
    </ListItem>
  );
}
