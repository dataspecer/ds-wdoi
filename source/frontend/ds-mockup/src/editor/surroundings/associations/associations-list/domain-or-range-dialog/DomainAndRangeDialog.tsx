import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useQuery } from 'react-query';
import { WdProperty } from '../../../../../wikidata/entities/wd-property';
import { SurroundingsParts } from '../../../../../wikidata/query/get-surroundings';
import { fetchDomainOrRange } from '../../../../../wikidata/query/get-domain-range';
import { DomainOrRangeClassList } from './DomainOrRangeClassList';
import { WdClass } from '../../../../../wikidata/entities/wd-class';

type DomainOrRangeType = 'domain' | 'range';

export function DomainAndRangeDialog({
  wdProperty,
  isOpen,
  onDialogClose,
  surroundingsPart,
  domainOrRange,
}: {
  wdProperty: WdProperty;
  isOpen: boolean;
  onDialogClose: () => void;
  surroundingsPart: SurroundingsParts;
  domainOrRange: DomainOrRangeType;
}) {
  const { isLoading, isError, data } = useQuery(
    [wdProperty.iri, domainOrRange, surroundingsPart],
    async () => {
      return await fetchDomainOrRange(wdProperty, domainOrRange, surroundingsPart);
    },
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onDialogClose}
      maxWidth='md'
      fullWidth={true}
      PaperProps={{ sx: { height: '90%' } }}
    >
      <DialogTitle>Select {domainOrRange}</DialogTitle>
      <DialogContent className='bg-slate-100 px-0'>
        {isLoading || isError ? (
          isLoading ? (
            'Loading'
          ) : (
            'Error'
          )
        ) : (
          <DomainOrRangeClassList classes={data as WdClass[]} closeDialog={onDialogClose} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onDialogClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
