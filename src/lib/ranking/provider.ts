import type {Place} from '../types';
export type RankingInput={place:Place;keyword:string;mockRank?:number|null};
export type RankingResult={rank:number|null;matched:boolean;checkedAt:string;provider:string;rawTitle?:string;rawData?:unknown};
export interface RankingProvider {id:string;getRanking(input:RankingInput):Promise<RankingResult>}
export const providerLabels:Record<string,string>={'mock':'테스트 순위 · Mock','naver-local':'네이버 지역검색 API 기준'};
export const providerLabel=(id:string)=>providerLabels[id]??id;
