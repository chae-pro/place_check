import 'server-only';
import {createClient} from '@supabase/supabase-js';
import type {Session} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
export const accessCookie='rank-access';
export const refreshCookie='rank-refresh';
export function publicClient(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});}
export async function writeSession(session:Session){const jar=await cookies(),options={httpOnly:true,sameSite:'lax' as const,secure:process.env.NODE_ENV==='production',path:'/',maxAge:2592000};jar.set(accessCookie,session.access_token,options);jar.set(refreshCookie,session.refresh_token,options);}
export async function clearSession(){const jar=await cookies();jar.delete(accessCookie);jar.delete(refreshCookie);}
export async function supabaseServer(){const access=(await cookies()).get(accessCookie)?.value;return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:access?{Authorization:`Bearer ${access}`}:{}}});}
export async function verifiedUser(){const access=(await cookies()).get(accessCookie)?.value;if(!access)return null;const {data,error}=await publicClient().auth.getUser(access);return error?null:data.user;}
export function supabaseAdmin(){if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('자동조회를 위한 Supabase 서버 키가 없습니다.');return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});}
