export type Place = {id:string;user_id:string;name:string;search_name:string;address:string;start_date:string;is_active:boolean;created_at:string;updated_at:string};
export type Keyword = {id:string;place_id:string;keyword:string;target_rank:number;target_days:number;is_active:boolean;created_at:string;updated_at:string};
export type Check = {id:string;place_keyword_id:string;rank:number|null;matched:boolean;provider:string;check_date:string;checked_at:string;raw_title:string|null;raw_data:unknown;created_at:string};
