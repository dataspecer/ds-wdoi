import axios from 'axios';
import { WdClassHierarchyDescOnly } from '../entities/wd-class';

export interface GetSearchResults {
  classes: WdClassHierarchyDescOnly[];
}

export interface GetSearchReply {
  results: GetSearchResults;
}

export async function fetchSearch(query: string): Promise<GetSearchResults> {
  return (
    (await axios.get(`/api/v3/search?query=${query}&searchClasses=true`)).data as GetSearchReply
  ).results;
}
