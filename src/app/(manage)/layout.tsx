import Link from 'next/link';
import {requireUser} from '@/lib/auth';
import {localDemo} from '@/lib/config';
import {currentProviderId} from '@/lib/ranking';
import {providerLabel} from '@/lib/ranking/provider';
import {seoulDate} from '@/lib/progress';
import {logout} from '@/app/login/actions';
export const dynamic='force-dynamic';
export default async function ManageLayout({children}:{children:React.ReactNode}){const user=await requireUser(),provider=currentProviderId();return <div className="shell"><aside className="sidebar"><Link href="/dashboard" className="brand"><span>↗</span>로컬랭크</Link><nav><Link className="navlink active" href="/dashboard">▦ 관리 대시보드</Link><Link className="navlink" href="/places/new">＋ 업장 등록</Link></nav><div className="sidefoot">업장별 · 키워드별<br/>누적 노출일 관리<form action={logout}><button>로그아웃</button></form></div></aside><div className="workspace"><header className="topbar"><p>{seoulDate()} · 한국시간 기준</p><div className="actions"><span className="badge">{localDemo()?'로컬 테스트':user.email}</span><form action={logout}><button className="btn small">로그아웃</button></form></div></header><main className="content">{provider==='mock'?<div className="notice"><strong>테스트 모드</strong> · 표시되는 순위는 Mock 테스트 결과이며 실제 검색 순위가 아닙니다.{localDemo()?' 데이터는 이 PC에 저장됩니다.':''}</div>:<div className="notice"><strong>{providerLabel(provider)}</strong> · 네이버 플레이스 화면의 실제 노출 순위와 동일하다고 보장되지 않습니다.</div>}{children}</main></div></div>;}
