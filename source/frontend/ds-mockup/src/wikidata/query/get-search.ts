import axios from 'axios';
import { WdClass } from '../entities/wd-class';

export interface GetSearchReplyResults {
  classes: WdClass[];
}

export interface GetSearchReply {
  results: GetSearchReplyResults;
}

export async function fetchSearch(query: string): Promise<GetSearchReply> {
  return (await axios.get(`/api/v3/search?query=${query}&searchClasses=true`))
    .data as GetSearchReply;
}
