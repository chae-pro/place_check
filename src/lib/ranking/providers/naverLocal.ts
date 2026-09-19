import 'server-only';
import {z} from 'zod';
import {cleanTitle,matches} from '../matching';
import type {RankingProvider} from '../provider';
const responseSchema=z.object({items:z.array(z.object({title:z.string(),address:z.string(),roadAddress:z.string()})).max(5)});
export const naverLocalProvider:RankingProvider={id:'naver-local',async getRanking({place,keyword}) {
 const id=process.env.NAVER_CLIENT_ID,secret=process.env.NAVER_CLIENT_SECRET;
 if(!id||!secret)throw new Error('네이버 API Client ID와 Client Secret을 설정해주세요.');
 let response:Response;
 try {response=await fetch(`https://openapi.naver.com/v1/search/local.json?${new URLSearchParams({query:keyword,display:'5',start:'1',sort:'random'})}`,{headers:{'X-Naver-Client-Id':id,'X-Naver-Client-Secret':secret},cache:'no-store',signal:AbortSignal.timeout(10000)});}catch {throw new Error('네이버 API 연결 시간이 초과되었거나 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');}
 if(!response.ok)throw new Error(response.status===429?'네이버 API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.':'네이버 API 연결에 실패했습니다. Client ID와 Client Secret 및 검색 API 권한을 확인해주세요.');
 const parsed=responseSchema.safeParse(await response.json());if(!parsed.success)throw new Error('네이버 API 응답 형식을 확인할 수 없습니다.');
 const items=parsed.data.items;const index=items.findIndex(item=>matches(place.search_name,place.address,item));
 return {rank:index<0?null:index+1,matched:index>=0,checkedAt:new Date().toISOString(),provider:'naver-local',rawTitle:index>=0?cleanTitle(items[index].title):undefined,rawData:parsed.data};
}};
