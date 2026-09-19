import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'로컬랭크 | 업장별 순위 관리',description:'업장과 검색키워드별 순위 기록, 누적 노출일과 목표 달성 관리'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
