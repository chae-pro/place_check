import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import {localDemo,configured} from '@/lib/config';
import {LoginForm} from '@/components/login-form';
export const dynamic='force-dynamic';
export default async function Login(){if(await currentUser())redirect('/dashboard');return <main className="login"><section className="login-box"><div className="brand"><span>↗</span>로컬랭크</div><h1>업장 순위 관리에 로그인</h1><p className="subtitle">검색키워드마다, 목표에 한 걸음 더.</p>{!configured()&&<p className="feedback error">Supabase 연결 정보가 없습니다. README의 설정 안내를 확인해주세요.</p>}<LoginForm local={localDemo()} ready={configured()}/></section></main>;}
