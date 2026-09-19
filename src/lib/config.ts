import 'server-only';
export const localDemo=()=>process.env.LOCAL_DEMO==='true'&&!process.env.VERCEL;
export const publicAccess=()=>process.env.PUBLIC_ACCESS==='true';
export const configured=()=>localDemo()||publicAccess()||Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
