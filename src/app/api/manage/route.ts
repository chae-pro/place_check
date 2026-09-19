import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {currentUser} from '@/lib/auth';
import {repository} from '@/lib/repository';
import {placeSchema,keywordSchema,idSchema} from '@/lib/validation';
import {checkKeyword} from '@/lib/check-service';
import {currentProviderId} from '@/lib/ranking';
import {localDemo} from '@/lib/config';
import {seoulDate} from '@/lib/progress';
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('createPlace'),place:placeSchema,keyword:keywordSchema}),
 z.object({action:z.literal('updatePlace'),id:idSchema,place:placeSchema}),
 z.object({action:z.literal('deletePlace'),id:idSchema}),
 z.object({action:z.literal('addKeyword'),placeId:idSchema,keyword:keywordSchema}),
 z.object({action:z.literal('updateKeyword'),id:idSchema,keyword:keywordSchema}),
 z.object({action:z.literal('deleteKeyword'),id:idSchema}),
 z.object({action:z.literal('check'),id:idSchema,mockRank:z.number().int().min(1).max(5).nullable().optional()}),
 z.object({action:z.literal('seedHistory'),id:idSchema,days:z.number().int().min(1).max(30)})
]);
export async function POST(request:NextRequest){if(request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'허용되지 않은 요청입니다.'},{status:403});const user=await currentUser();if(!user)return NextResponse.json({error:'로그인이 필요합니다.'},{status:401});try{const parsed=command.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:'입력값을 확인해주세요. 이름·주소·날짜와 목표 숫자는 필수입니다.'},{status:400});const c=parsed.data,repo=await repository(user.id);switch(c.action){
 case 'createPlace':return NextResponse.json({id:await repo.createPlace(c.place,c.keyword)});
 case 'updatePlace':await repo.updatePlace(c.id,c.place);break;
 case 'deletePlace':await repo.deletePlace(c.id);break;
 case 'addKeyword':await repo.addKeyword(c.placeId,c.keyword);break;
 case 'updateKeyword':await repo.updateKeyword(c.id,c.keyword);break;
 case 'deleteKeyword':await repo.deleteKeyword(c.id);break;
 case 'check':{const result=await checkKeyword(repo,c.id,currentProviderId()==='mock'?c.mockRank:undefined);return NextResponse.json({message:result.rank===null?'현재 조회범위에서는 확인되지 않았습니다.':`현재 조회 결과는 ${result.rank}위입니다.`,rank:result.rank});}
 case 'seedHistory':{if(!localDemo()||currentProviderId()!=='mock')return NextResponse.json({error:'로컬 Mock 모드에서만 가능합니다.'},{status:403});const {place}=await repo.keyword(c.id);for(let i=1;i<=c.days;i++){const at=new Date(`${seoulDate()}T09:00:00+09:00`);at.setUTCDate(at.getUTCDate()-i);const date=seoulDate(at);if(date<place.start_date)continue;await repo.saveCheck({place_keyword_id:c.id,rank:3,matched:true,provider:'mock',check_date:date,checked_at:at.toISOString(),raw_title:null,raw_data:{test:true,seeded:true}});}break;}
 }return NextResponse.json({message:'저장되었습니다.'});}catch(e){return NextResponse.json({error:e instanceof Error&& !e.message.includes('SQLITE')?e.message:'저장에 실패했습니다. 중복 키워드인지 확인해주세요.'},{status:400});}}
