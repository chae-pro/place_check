import {NextRequest,NextResponse} from 'next/server';
import {timingSafeEqual} from 'node:crypto';
import {repository} from '@/lib/repository';
import {checkKeyword} from '@/lib/check-service';
export const maxDuration=300;
export async function GET(request:NextRequest){const expected=process.env.CRON_SECRET;const token=request.headers.get('authorization');const target=`Bearer ${expected}`;if(!expected||!token||token.length!==target.length||!timingSafeEqual(Buffer.from(token),Buffer.from(target)))return NextResponse.json({error:'인증이 필요합니다.'},{status:401});
 try{const repo=await repository(null,true),data=await repo.snapshot(),places=new Set(data.places.filter(p=>p.is_active).map(p=>p.id));const items=data.keywords.filter(k=>k.is_active&&places.has(k.place_id));let success=0;const failed:string[]=[];const began=Date.now();for(const item of items){if(Date.now()-began>240000){failed.push(item.id);continue;}try{await checkKeyword(repo,item.id);success++;}catch{failed.push(item.id);}await new Promise(r=>setTimeout(r,150));}return NextResponse.json({total:items.length,success,failed:failed.length,failedIds:failed},{status:failed.length?503:200});}catch{return NextResponse.json({error:'자동조회 설정 또는 데이터베이스 연결을 확인해주세요.'},{status:500});}}
