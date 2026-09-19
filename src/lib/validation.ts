import {z} from 'zod';
export const dateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'올바른 날짜를 입력해주세요.');
export const placeSchema=z.object({name:z.string().trim().min(1).max(100),search_name:z.string().trim().min(1).max(150),address:z.string().trim().min(1).max(300),start_date:dateSchema,is_active:z.boolean()});
export const keywordSchema=z.object({keyword:z.string().trim().min(1).max(100),target_rank:z.coerce.number().int().min(1).max(1000),target_days:z.coerce.number().int().min(1).max(3650),is_active:z.boolean()});
export const idSchema=z.string().uuid();
