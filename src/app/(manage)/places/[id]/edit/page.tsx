import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {repository} from '@/lib/repository';
import {PlaceForm} from '@/components/forms';
import {seoulDate} from '@/lib/progress';
export default async function EditPlace({params}:{params:Promise<{id:string}>}){const {id}=await params,user=await requireUser(),data=await (await repository(user.id)).snapshot(),place=data.places.find(p=>p.id===id);if(!place)notFound();return <><div className="heading"><div><Link className="link" href={`/places/${id}`}>← 업장 상세</Link><h1>업장 수정</h1><p className="subtitle">관리 시작일을 변경하면 누적일이 다시 계산됩니다.</p></div></div><section className="panel"><div className="panel-body"><PlaceForm place={place} today={seoulDate()}/></div></section></>;}
