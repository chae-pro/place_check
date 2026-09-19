import 'server-only';
import {randomUUID} from 'node:crypto';
import {localDemo,publicAccess} from './config';
import {localDb} from './local-db';
import {supabaseServer,supabaseAdmin} from './supabase/server';
import type {Place,Keyword,Check} from './types';
import type {z} from 'zod';
import type {placeSchema,keywordSchema} from './validation';
type PlaceInput=z.infer<typeof placeSchema>;type KeywordInput=z.infer<typeof keywordSchema>;
type Table='places'|'place_keywords'|'ranking_checks';
const errorMessage=(error:{code?:string}|null)=>error?.code==='23505'?'이미 등록된 검색키워드입니다.':'데이터 저장 또는 조회에 실패했습니다. Supabase 연결 및 SQL 설정을 확인해주세요.';
export async function repository(userId:string|null,admin=false){
 if(!userId&&!admin)throw new Error('로그인이 필요합니다.');
 const local=localDemo(),shared=publicAccess();const client=local?null:admin||shared?supabaseAdmin():await supabaseServer();
 async function all<T>(table:Table):Promise<T[]>{if(local){const rows=localDb().prepare(`SELECT * FROM ${table}`).all();return rows.map(row=>({...row,...('is_active' in row?{is_active:Boolean(row.is_active)}:{}),...('matched' in row?{matched:Boolean(row.matched)}:{})})) as T[];}
 const result:T[]=[];for(let from=0;;from+=1000){const {data,error}=await client!.from(table).select('*').order('id').range(from,from+999);if(error)throw new Error(errorMessage(error));result.push(...data as T[]);if(data.length<1000)break;}return result;}
 async function snapshot(){const allPlaces=await all<Place>('places');const places=allPlaces.filter(p=>admin||p.user_id===userId);const ids=new Set(places.map(p=>p.id));const keywords=(await all<Keyword>('place_keywords')).filter(k=>ids.has(k.place_id));const kids=new Set(keywords.map(k=>k.id));const checks=(await all<Check>('ranking_checks')).filter(c=>kids.has(c.place_keyword_id));return {places,keywords,checks};}
 async function place(id:string){const data=await snapshot();const found=data.places.find(p=>p.id===id);if(!found)throw new Error('업장을 찾을 수 없거나 접근 권한이 없습니다.');return found;}
 async function keyword(id:string){const data=await snapshot();const found=data.keywords.find(k=>k.id===id);if(!found)throw new Error('검색키워드를 찾을 수 없거나 접근 권한이 없습니다.');return {keyword:found,place:data.places.find(p=>p.id===found.place_id)!};}
 async function insert(table:Table,row:Record<string,unknown>){if(local){const keys=Object.keys(row);localDb().prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`).run(...Object.values(row).map(value=>typeof value==='boolean'?Number(value):typeof value==='object'&&value!==null?JSON.stringify(value):value) as (string|number|null)[]);return;}const {error}=await client!.from(table).insert(row);if(error)throw new Error(errorMessage(error));}
 async function update(table:Table,id:string,row:Record<string,unknown>){if(local){localDb().prepare(`UPDATE ${table} SET ${Object.keys(row).map(k=>`${k}=?`).join(',')} WHERE id=?`).run(...Object.values(row).map(v=>typeof v==='boolean'?Number(v):v) as (string|number|null)[],id);return;}const {error}=await client!.from(table).update(row).eq('id',id);if(error)throw new Error(errorMessage(error));}
 async function remove(table:Table,id:string){if(local){localDb().prepare(`DELETE FROM ${table} WHERE id=?`).run(id);return;}const {error}=await client!.from(table).delete().eq('id',id);if(error)throw new Error(errorMessage(error));}
 return {snapshot,place,keyword,
 async createPlace(input:PlaceInput,first:KeywordInput){const id=randomUUID(),now=new Date().toISOString();if(!local&&!shared){const {data,error}=await client!.rpc('create_place_with_keyword',{p_place:input,p_keyword:first});if(error)throw new Error(errorMessage(error));return data as string;}if(shared){await insert('places',{id,user_id:userId!,...input,created_at:now,updated_at:now});try{await insert('place_keywords',{id:randomUUID(),place_id:id,...first,created_at:now,updated_at:now});return id;}catch(e){await remove('places',id);throw e;}}const db=localDb();db.exec('BEGIN');try{await insert('places',{id,user_id:userId!,...input,created_at:now,updated_at:now});await insert('place_keywords',{id:randomUUID(),place_id:id,...first,created_at:now,updated_at:now});db.exec('COMMIT');return id;}catch(e){db.exec('ROLLBACK');throw e;}},
 async updatePlace(id:string,input:PlaceInput){await place(id);await update('places',id,{...input,updated_at:new Date().toISOString()});},
 async deletePlace(id:string){await place(id);await remove('places',id);},
 async addKeyword(placeId:string,input:KeywordInput){await place(placeId);const now=new Date().toISOString();await insert('place_keywords',{id:randomUUID(),place_id:placeId,...input,created_at:now,updated_at:now});},
 async updateKeyword(id:string,input:KeywordInput){await keyword(id);await update('place_keywords',id,{...input,updated_at:new Date().toISOString()});},
 async deleteKeyword(id:string){await keyword(id);await remove('place_keywords',id);},
 async saveCheck(row:Omit<Check,'id'|'created_at'>){await keyword(row.place_keyword_id);await insert('ranking_checks',{...row,id:randomUUID(),created_at:new Date().toISOString()});}
 };
}
