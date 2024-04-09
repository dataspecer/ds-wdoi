import { createContext } from 'react';
import { FilterByInstance } from '../../../../wikidata/query/get-filter-by-instance';

export const FilterByInstanceContext = createContext<FilterByInstance | undefined>(undefined);
