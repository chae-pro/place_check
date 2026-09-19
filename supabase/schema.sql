-- Supabase SQL Editor에서 한 번 실행하세요. 모든 일반 사용자 접근은 RLS 적용.
create table public.places (
 id uuid primary key default gen_random_uuid(), user_id uuid not null,
 name text not null check(length(trim(name)) between 1 and 100), search_name text not null check(length(trim(search_name)) between 1 and 150),
 address text not null check(length(trim(address)) between 1 and 300), start_date date not null,
 is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.place_keywords (
 id uuid primary key default gen_random_uuid(), place_id uuid not null references public.places(id) on delete cascade,
 keyword text not null check(length(trim(keyword)) between 1 and 100), target_rank integer not null default 5 check(target_rank between 1 and 1000),
 target_days integer not null default 25 check(target_days between 1 and 3650), is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(place_id,keyword)
);
create table public.ranking_checks (
 id uuid primary key default gen_random_uuid(), place_keyword_id uuid not null references public.place_keywords(id) on delete cascade,
 rank integer check(rank > 0), matched boolean not null, provider text not null,
 check_date date not null default (now() at time zone 'Asia/Seoul')::date,
 checked_at timestamptz not null default now(), raw_title text, raw_data jsonb,
 created_at timestamptz not null default now(), check(matched = (rank is not null))
);
create index on public.places(user_id);
create index on public.place_keywords(place_id);
create index on public.ranking_checks(place_keyword_id,check_date);
alter table public.places enable row level security;
alter table public.place_keywords enable row level security;
alter table public.ranking_checks enable row level security;
create policy places_owner on public.places for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy keywords_owner on public.place_keywords for all to authenticated
 using(exists(select 1 from public.places p where p.id=place_id and p.user_id=(select auth.uid())))
 with check(exists(select 1 from public.places p where p.id=place_id and p.user_id=(select auth.uid())));
create policy checks_read on public.ranking_checks for select to authenticated
 using(exists(select 1 from public.place_keywords k join public.places p on p.id=k.place_id where k.id=place_keyword_id and p.user_id=(select auth.uid())));
create policy checks_insert on public.ranking_checks for insert to authenticated
 with check(exists(select 1 from public.place_keywords k join public.places p on p.id=k.place_id where k.id=place_keyword_id and p.user_id=(select auth.uid())));
revoke all on public.places,public.place_keywords,public.ranking_checks from anon;
grant select,insert,update,delete on public.places,public.place_keywords to authenticated;
grant select,insert on public.ranking_checks to authenticated;
create function public.update_timestamp() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create trigger places_timestamp before update on public.places for each row execute function public.update_timestamp();
create trigger keywords_timestamp before update on public.place_keywords for each row execute function public.update_timestamp();
create function public.check_date_seoul() returns trigger language plpgsql set search_path='' as $$ begin new.check_date=(new.checked_at at time zone 'Asia/Seoul')::date; return new; end $$;
create trigger checks_date before insert on public.ranking_checks for each row execute function public.check_date_seoul();
create function public.create_place_with_keyword(p_place jsonb,p_keyword jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
 declare new_id uuid;
 begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.places(user_id,name,search_name,address,start_date,is_active)
 values(auth.uid(),p_place->>'name',p_place->>'search_name',p_place->>'address',(p_place->>'start_date')::date,(p_place->>'is_active')::boolean) returning id into new_id;
 insert into public.place_keywords(place_id,keyword,target_rank,target_days,is_active)
 values(new_id,p_keyword->>'keyword',(p_keyword->>'target_rank')::int,(p_keyword->>'target_days')::int,(p_keyword->>'is_active')::boolean);
 return new_id;
 end $$;
revoke all on function public.create_place_with_keyword(jsonb,jsonb) from public;
grant execute on function public.create_place_with_keyword(jsonb,jsonb) to authenticated;
