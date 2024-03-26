import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useQuery } from 'react-query';
import { WdProperty } from '../../../../../wikidata/entities/wd-property';
import {
  DomainsOrRanges,
  fetchDomainOrRange,
} from '../../../../../wikidata/query/get-domain-range';
import { DomainOrRangeClassList } from './DomainOrRangeClassList';
import { WdClass } from '../../../../../wikidata/entities/wd-class';
import { PropertyPartsSelectionInput } from '../AssociationsList';

export function DomainAndRangeDialog({
  wdClass,
  wdProperty,
  isOpen,
  onDialogClose,
  domainsOrRanges,
  propertyPartsSelection,
}: {
  wdClass: WdClass;
  wdProperty: WdProperty;
  isOpen: boolean;
  onDialogClose: () => void;
  domainsOrRanges: DomainsOrRanges;
  propertyPartsSelection: PropertyPartsSelectionInput;
}) {
  const { isLoading, isError, data } = useQuery(
    [wdClass.id, wdProperty.iri, domainsOrRanges, propertyPartsSelection],
    async () => {
      return await fetchDomainOrRange(wdClass, wdProperty, domainsOrRanges, propertyPartsSelection);
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
      <DialogTitle>Select {domainsOrRanges}</DialogTitle>
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
