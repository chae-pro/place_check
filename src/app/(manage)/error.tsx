'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="panel panel-body"><h1>데이터를 불러오지 못했습니다.</h1><p className="subtitle">Supabase 연결 정보와 데이터베이스 SQL 실행 여부를 확인해주세요.</p><button className="btn mt-5" onClick={reset}>다시 시도</button></section>;}
