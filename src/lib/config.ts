import 'server-only';
export const localDemo=()=>process.env.LOCAL_DEMO==='true'&&!process.env.VERCEL;
export const configured=()=>localDemo()||Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
