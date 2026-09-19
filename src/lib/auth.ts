import 'server-only';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {localDemo,publicAccess,configured} from './config';
import {verifiedUser} from './supabase/server';
const cookieName='place-rank-local';
function signature(value:string){const key=process.env.LOCAL_SESSION_SECRET;if(!key)throw new Error('LOCAL_SESSION_SECRET을 설정해주세요.');return createHmac('sha256',key).update(value).digest('hex');}
export async function localLogin(){const expires=String(Date.now()+86400000);(await cookies()).set(cookieName,`${expires}.${signature(expires)}`,{httpOnly:true,sameSite:'strict',secure:false,path:'/',maxAge:86400});}
export async function localLogout(){(await cookies()).delete(cookieName);}
export async function currentUser(){if(!configured())return null;if(publicAccess())return {id:'00000000-0000-4000-8000-000000000002',email:'공개 사용자'};if(localDemo()){const token=(await cookies()).get(cookieName)?.value;if(!token)return null;const [expires,sig]=token.split('.');if(!expires||!sig||!/^\d+$/.test(expires)||Number(expires)<Date.now())return null;const expected=signature(expires);if(!/^[a-f0-9]{64}$/.test(sig)||!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;return {id:'00000000-0000-4000-8000-000000000001',email:'local@test.local'};}return verifiedUser();}
export async function requireUser(){const user=await currentUser();if(!user)redirect('/login');return user;}
