'use server';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {localDemo,configured} from '@/lib/config';
import {localLogin,localLogout} from '@/lib/auth';
import {publicClient,writeSession,clearSession} from '@/lib/supabase/server';
export async function login(_state:{error:string},form:FormData){if(!configured())return {error:'먼저 Supabase 환경변수를 설정해주세요.'};if(localDemo()){await localLogin();redirect('/dashboard');}const email=String(form.get('email')??'').trim(),password=String(form.get('password')??'');if(!email||!password)return {error:'이메일과 비밀번호를 입력해주세요.'};try{const {data,error}=await publicClient().auth.signInWithPassword({email,password});if(error||!data.session)return {error:'로그인하지 못했습니다. 이메일과 비밀번호를 확인해주세요.'};await writeSession(data.session);}catch{return {error:'로그인 서버에 연결할 수 없습니다. Supabase 설정을 확인해주세요.'};}redirect('/dashboard');}
export async function logout(){if(localDemo())await localLogout();else{const jar=await cookies(),access=jar.get('rank-access')?.value,refresh=jar.get('rank-refresh')?.value;if(access&&refresh){const client=publicClient();await client.auth.setSession({access_token:access,refresh_token:refresh});await client.auth.signOut();}await clearSession();}redirect('/login');}
