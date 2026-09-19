import Link from 'next/link';
export default function NotFound(){return <main className="login"><section className="login-box"><h1>페이지를 찾을 수 없습니다.</h1><p className="subtitle">삭제된 업장이거나 접근 권한이 없을 수 있습니다.</p><Link className="btn primary mt-5" href="/dashboard">대시보드로</Link></section></main>;}
