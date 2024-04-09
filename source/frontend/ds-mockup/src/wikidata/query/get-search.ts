import axios from 'axios';
import { WdClassDescOnly } from '../entities/wd-class';

export interface GetSearchResults {
  classes: WdClassDescOnly[];
}

export interface GetSearchReply {
  results: GetSearchResults;
}

export async function fetchSearch(query: string): Promise<GetSearchResults> {
  return (
    (await axios.get(`/api/v3/search?query=${query}&searchClasses=true`)).data as GetSearchReply
  ).results;
}
