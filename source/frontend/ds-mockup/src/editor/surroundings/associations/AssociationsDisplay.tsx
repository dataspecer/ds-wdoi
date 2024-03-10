import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { WdClass } from '../../../wikidata/entities/wd-class';
import { SurroundingsParts } from '../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../selected-property';
import { LoadedAssociationsList } from './associations-list/LoadedAssociationsList';
import { useState } from 'react';

export function AssociationsDisplay({
  selectedClass,
  setSelectedPropertiesUpper,
}: {
  selectedClass: WdClass;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}) {
  const [surroundingsPart, setSurroundingsPart] = useState<SurroundingsParts>('constraints');

  return (
    <div className=' flex-col space-y-3'>
      <div>Associations</div>
      <FormControl>
        <InputLabel id='part-selection-label'>Properties based on</InputLabel>
        <Select
          labelId='part-selection-label'
          id='part-selection'
          value={surroundingsPart}
          label='Properties based on'
          size='small'
          onChange={(e) => {
            const value = e.target.value;
            if (value !== 'constraints' && value !== 'usage') setSurroundingsPart('constraints');
            else setSurroundingsPart(value);
          }}
        >
          <MenuItem value={'constraints'}>Property Constraints</MenuItem>
          <MenuItem value={'usage'}>Usage Statistics</MenuItem>
        </Select>
      </FormControl>
      <LoadedAssociationsList
        selectedClass={selectedClass}
        setSelectedPropertiesUpper={setSelectedPropertiesUpper}
        surroundingsPart={surroundingsPart}
      />
    </div>
  );
}
