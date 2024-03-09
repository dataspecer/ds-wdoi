import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { WdClass } from '../../../wikidata/entities/wd-class';
import { SurroundingsParts } from '../../../wikidata/query/get-surroundings';
import { SelectedProperty } from '../selected-property';
import { LoadedAssociationsList } from './LoadedAssociationsList';
import { useState } from 'react';

export function AssociationsDisplay({
  selectedClass,
  setSelectedPropertiesUpper,
}: {
  selectedClass: WdClass;
  setSelectedPropertiesUpper: React.Dispatch<React.SetStateAction<SelectedProperty[]>>;
}) {
  const [part, setPart] = useState<SurroundingsParts>('constraints');

  return (
    <div>
      <FormControl>
        <InputLabel id='part-selection-label'>Selection</InputLabel>
        <Select
          labelId='part-selection-label'
          id='part-selection'
          value={part}
          label='Selection'
          size='small'
          onChange={(e) => {
            const value = e.target.value;
            if (value !== 'constraints' && value !== 'usage') setPart('constraints');
            else setPart(value);
          }}
        >
          <MenuItem value={'constraints'}>Constraints</MenuItem>
          <MenuItem value={'usage'}>Usage</MenuItem>
        </Select>
      </FormControl>
      <LoadedAssociationsList
        selectedClass={selectedClass}
        setSelectedPropertiesUpper={setSelectedPropertiesUpper}
        part={part}
      />
    </div>
  );
}
