-- 실제 Supabase 테스트 프로젝트에서 실행하세요. 끝의 ROLLBACK으로 검증용 데이터는 모두 취소됩니다.
-- 먼저 Authentication에서 사용자 2명을 만드세요. 이 스크립트는 임의의 첫 두 사용자를 고릅니다.
begin;
do $$ begin if (select count(*) from auth.users)<2 then raise exception '검증용 사용자를 2명 생성하세요'; end if; end $$;
create temporary table test_users as select id,row_number() over(order by created_at,id) as n from auth.users limit 2;
grant select on test_users to authenticated;
select set_config('request.jwt.claim.sub',(select id::text from test_users where n=1),true);
set local role authenticated;
select public.create_place_with_keyword('{"name":"RLS 검증 업장","search_name":"검증","address":"검증 주소","start_date":"2026-01-01","is_active":true}'::jsonb,'{"keyword":"RLS 검증","target_rank":5,"target_days":25,"is_active":true}'::jsonb);
reset role;
create temporary table test_place as select id from public.places where name='RLS 검증 업장' and user_id=(select id from test_users where n=1);
grant select on test_place to authenticated;
select set_config('request.jwt.claim.sub',(select id::text from test_users where n=2),true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.places where id in(select id from test_place)) then raise exception 'RLS 실패: 다른 사용자 업장 노출'; end if;
 if exists(select 1 from public.place_keywords where place_id in(select id from test_place)) then raise exception 'RLS 실패: 다른 사용자 키워드 노출'; end if;
 begin
 insert into public.place_keywords(place_id,keyword) select id,'침입 시도' from test_place;
 raise exception 'RLS 실패: 다른 사용자 업장에 키워드 삽입 가능';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
rollback;
