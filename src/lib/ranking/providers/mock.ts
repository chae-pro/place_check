import type {RankingProvider} from '../provider';
export const mockProvider:RankingProvider={id:'mock',async getRanking({mockRank}) {const rank=mockRank===undefined?3:mockRank;return {rank,matched:rank!==null,checkedAt:new Date().toISOString(),provider:'mock',rawData:{test:true}};}};
