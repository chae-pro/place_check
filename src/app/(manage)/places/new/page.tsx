import Link from 'next/link';
import {requireUser} from '@/lib/auth';
import {PlaceForm} from '@/components/forms';
import {seoulDate} from '@/lib/progress';
export default async function NewPlace(){await requireUser();return <><div className="heading"><div><Link className="link" href="/dashboard">← 대시보드</Link><h1>새 업장 등록</h1><p className="subtitle">관리할 업장과 첫 검색키워드를 입력하세요.</p></div></div><section className="panel"><div className="panel-body"><PlaceForm today={seoulDate()}/></div></section></>;}
