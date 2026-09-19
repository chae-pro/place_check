import 'server-only';
import {repository} from './repository';
import {getProvider} from './ranking';
import {seoulDate} from './progress';
export async function checkKeyword(repo:Awaited<ReturnType<typeof repository>>,id:string,mockRank?:number|null){const {place,keyword}=await repo.keyword(id);if(!place.is_active||!keyword.is_active)throw new Error('비활성 업장 또는 검색키워드는 조회할 수 없습니다.');const result=await getProvider().getRanking({place,keyword:keyword.keyword,mockRank});await repo.saveCheck({place_keyword_id:id,rank:result.rank,matched:result.matched,provider:result.provider,check_date:seoulDate(new Date(result.checkedAt)),checked_at:result.checkedAt,raw_title:result.rawTitle??null,raw_data:result.rawData??null});return result;}
