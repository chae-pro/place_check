# 로컬랭크 — 업장·검색키워드 순위 관리

## 1. 무엇을 만들었나요?

업장마다 여러 검색키워드를 등록하고, 조회 결과를 날짜별로 저장하는 관리 웹앱입니다. 목표 순위 안에 들어온 **누적 날짜 수**를 세어 D-5부터 경고하고, 목표에 도달하면 완료로 표시합니다. 연속일이 아니며 같은 날 여러 번 성공해도 1일만 더합니다.

## 2. 기능과 검증 범위

- 업장 등록·수정·활성/비활성·삭제
- 검색키워드 추가·수정·활성/비활성·삭제
- 개별 및 전체 순위 조회, 조회 이력 저장
- 오늘 최저 숫자 순위, 날짜별 대표순위·조회횟수·인정 여부
- 시작일 포함 누적일, D-5~D-1, 목표달성, 100% 진행률 상한
- 한국시간 날짜 계산
- Mock / 네이버 지역검색 API 수집 모듈 분리
- 로컬 SQLite 저장 및 테스트 로그인
- Supabase Auth 이메일/비밀번호 로그인과 PostgreSQL 저장 코드
- 사용자별 RLS SQL, 서버 전용 키, Cron 인증
- PC 및 모바일 화면

로컬 모드는 실제 파일 데이터베이스에 저장됩니다. 단 순위는 테스트용입니다. Supabase 실제 계정·RLS 격리, 네이버 실제 호출, Vercel 자동 실행은 각 서비스 연결 후 추가 검증이 필요합니다. 로컬 테스트 로그인을 Supabase 로그인 검증으로 간주하지 않습니다.

## 3. 지금 Mock 모드로 실행하기

**Node.js 24 이상**이 필요합니다. 이 PC에는 이미 설치되어 있습니다.

프로젝트 폴더의 `로컬실행.cmd`를 더블클릭한 뒤 **http://localhost:3000** 에 접속하세요. 또는 터미널에서:

```powershell
cd "C:\Users\idnot\Documents\Codex\2026-09-19\files-pasted-by-the-user-c\outputs\place-rank"
npm run local
```

로그인 화면의 **로컬 테스트 시작**을 누릅니다. 이메일이나 API 키는 필요 없습니다. 처음 실행할 때 `.env.local`에 로컬 세션용 비밀값을 자동 생성합니다. 데이터는 `.local-data/rankings.sqlite`에 저장됩니다. 브라우저를 닫아도 유지됩니다. 실행창을 닫으면 웹서버는 종료됩니다.

로컬 테스트 전용이며 서버는 127.0.0.1에만 열립니다. 외부에 포트를 공개하지 마세요. Vercel에서는 `LOCAL_DEMO=true`여도 로컬 테스트 모드를 허용하지 않습니다.

## 4. Supabase에서 할 일

1. [Supabase](https://supabase.com/dashboard)에 로그인 → **New project**.
2. 프로젝트 이름과 데이터베이스 비밀번호를 정하고 가까운 지역을 선택 → 생성.
3. 왼쪽 **SQL Editor** → **New query**.
4. 이 프로젝트의 `supabase/schema.sql` 파일 내용을 전부 붙여넣기 → **Run**. 새 프로젝트에서 한 번 실행하는 SQL입니다.
5. **Authentication → Users → Add user → Create new user**에서 관리자 이메일·비밀번호를 입력하고 이메일 확인 옵션을 활성화합니다.
6. **Project Settings → API / API Keys**에서 Project URL, anon 키(또는 publishable 키), service_role 키를 확인합니다. 서비스 화면에 따라 메뉴 위치가 조금 다를 수 있습니다.
7. 아래 환경변수를 `.env.local`에 넣고 서버를 다시 시작합니다. `LOCAL_DEMO=false`로 바꾸면 이메일 로그인 화면이 나옵니다.
8. 실제 운영 시 공개 회원가입이 필요 없다면 Supabase의 신규 가입 허용을 끕니다.

RLS는 로그인한 사용자의 `places.user_id`를 기준으로 자식 키워드와 조회기록까지 접근을 제한합니다. 일반 웹 요청은 사용자 토큰을 사용하고, service_role 키는 인증된 Cron에서만 사용합니다.

실제 연결 후 별도 사용자 두 명을 만들어 A가 만든 업장·키워드·기록을 B가 조회·수정할 수 없는지 확인하세요. SQL 검증 예시는 `supabase/verify-rls.sql`에 있습니다.

## 5. 환경변수

실제 서비스 모드의 `.env.local` 예시입니다. 값은 본인의 프로젝트에서 가져오세요. 비밀값을 채팅이나 GitHub에 올리지 마세요.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RANKING_PROVIDER=mock
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
CRON_SECRET=
LOCAL_DEMO=false
LOCAL_SESSION_SECRET=
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 공개 API 키. 데이터 권한은 RLS가 제한합니다.
- `SUPABASE_SERVICE_ROLE_KEY`: **서버 전용**. Cron에서만 필요합니다.
- `RANKING_PROVIDER`: `mock` 또는 `naver-local`. 운영에서는 명시적으로 설정해야 합니다.
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`: 네이버 조회에만 필요합니다.
- `CRON_SECRET`: 자동조회 호출 인증용 긴 임의의 문자열.
- `LOCAL_SESSION_SECRET`: 로컬 테스트 로그인에만 사용합니다. 실행 도구가 자동 생성합니다.

비밀값 생성 예:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env.local`, `.local-data`, 빌드 결과, node_modules는 `.gitignore`에 포함되어 있습니다.

## 6. 네이버 API 설정

1. [네이버 개발자센터](https://developers.naver.com/apps/#/register) 로그인.
2. **Application → 애플리케이션 등록**에서 검색 API 사용 권한을 선택합니다.
3. 발급된 Client ID와 Client Secret을 `.env.local`의 해당 항목에 입력합니다.
4. `RANKING_PROVIDER=naver-local`로 변경 → 실행창 종료 후 다시 실행.
5. 업장 검색용 이름과 주소를 실제 결과와 동일하게 입력 → 지금 순위 체크.

공식 API의 결과 최대 5개를 조회합니다. 이름에서 HTML과 공백·문장부호 등을 정규화하고, 이름 및 도로명/지번주소의 전체 일치를 요구합니다. 층·호수, 주소 약칭 등이 다르면 미일치로 나올 수 있습니다. 잘못된 다른 업장을 매칭하지 않기 위한 보수적인 기준입니다. 결과 없음은 실제 전체 검색에서 6위라는 뜻이 아니라 **조회한 범위에서 찾지 못했다는 뜻**입니다.

## 7. 중요한 주의사항

**네이버 지역검색 API 결과 순서와 실제 네이버 플레이스 화면의 노출 순위는 같다고 보장되지 않습니다.** 화면에도 조회 기준을 표시합니다.

Mock 기록도 누적일 계산에 포함됩니다. 테스트를 마친 뒤에는 테스트 업장을 삭제하고 실제 업장을 새로 등록하세요. 목표순위·시작일을 수정하면 기존 기록을 새 기준으로 재계산합니다.

현재 실행 환경의 외부 npm 연결이 실패하여, 로컬에 확보된 Next.js **16.1.6** 및 고정된 패키지로 구성했습니다. 최신 안정 버전 사용 요구는 아직 충족하지 못했습니다. 공개 배포 전에는 네트워크가 되는 환경에서 최신 안정 버전과 보안 업데이트를 적용하고 빌드를 재검증해야 합니다.

## 8. 로컬 실행 명령

이미 설치된 이 PC:

```powershell
npm run local
```

다른 PC에서 처음 실행:

```powershell
npm ci
npm run local
```

Supabase 모드로 개발 실행:

```powershell
npm run dev
```

빌드와 실행:

```powershell
npm test
npm run build
npm start
```

3000번 포트를 다른 프로그램이 사용하면 해당 실행창을 닫거나 `npx next dev --hostname 127.0.0.1 --port 3001`을 사용하세요.

## 9. 직접 테스트하기

1. 로그인 → **업장 등록**.
2. 관리용 이름 `ABC치과`, 검색용 이름 `ABC치과 목동점`, 주소를 입력합니다.
3. 관리 시작일을 오늘보다 30일 이전으로 설정합니다.
4. 첫 키워드 `목동 치과`, 목표 5위·25일 → 저장.
5. **3위 → 지금 순위 체크** → 1/25일 확인.
6. 같은 날 5위 밖, 5위, 1위를 차례로 체크 → 오늘 대표순위 1위, 누적은 여전히 1일 확인.
7. 페이지 새로고침 또는 서버 재시작 → 기록 유지 확인.
8. 업장 상세의 **누적일 테스트 도구** 펼치기 → 과거 19일 추가 → 총 20일, D-5.
9. 과거 23일 추가 → 중복 날짜는 한 번만 계산되어 총 24일, D-1.
10. 과거 24일 추가 → 25일, 목표달성. 과거 29일 추가 → 30일, 진행률은 100%.
11. 키워드를 비활성화 → 개별 조회 버튼 비활성 및 전체 조회 대상 제외 확인.
12. 키워드를 하나 더 추가하고 목표를 다르게 설정 → 서로 다른 누적 집계 확인.

과거 기록 도구는 로컬 Mock 모드에서만 제공됩니다. 일반 조회에서는 서버가 한국시간 날짜를 정하므로 사용자가 임의 날짜를 제출할 수 없습니다.

자동 단위 테스트는 요청한 10가지 계산 사례 외에 한국 자정 경계, 미래일 제외, 다른 목표값, 주소 오매칭 방지 등을 검사합니다.

## 10. Vercel 배포 준비

현재 요청에 따라 **로컬 실행**을 우선 제공하며 외부 배포는 하지 않았습니다.

1. 최신 Next.js 안정 버전 업데이트 후 `npm test`, `npm run build`를 통과시킵니다.
2. GitHub에서 **New repository** → 비공개 저장소 생성. 이 프로젝트 소스와 `package-lock.json`을 올립니다. `.env.local`, `.local-data`, `node_modules`, `.next`는 제외합니다.
3. [Vercel](https://vercel.com/new) 로그인 → **Add New → Project** → 해당 저장소 **Import**.
4. Framework Preset은 **Next.js**, Node.js는 **24.x**를 선택합니다.
5. **Environment Variables**에 위 환경변수 입력. `LOCAL_DEMO=false`, 실제 Supabase 정보 및 긴 `CRON_SECRET`을 설정합니다.
6. **Deploy** 클릭 → 완료되면 제공된 웹주소 접속.
7. Supabase **Authentication → URL Configuration**에서 Site URL에 배포 주소를 넣습니다.
8. 실제 이메일 로그인 → 업장 등록 → 수동조회 → Supabase Table Editor에서 기록 확인.
9. Vercel 프로젝트 **Settings → Cron Jobs**와 실행 로그에서 자동조회 확인.

`vercel.json`의 `0 0 * * *`는 UTC 00:00, 한국시간 오전 9시입니다. `/api/cron/check-rankings`는 `Authorization: Bearer CRON_SECRET`이 맞아야 실행됩니다. 비활성 항목은 건너뛰며 순차 처리합니다. 개별 실패를 집계하고 일부 실패 시 503을 반환합니다. 작업시간이 240초를 넘으면 나머지는 실패 목록에 포함됩니다. 대규모 계정은 별도 작업 큐가 필요합니다.

Vercel Hobby Cron은 정확한 분 단위 호출을 보장하지 않아 오전 9시대에 지연될 수 있습니다. 정확한 시각이 필요하면 이용 플랜과 스케줄러를 검토하세요. 로컬 서버에는 자동 스케줄러가 상주하지 않습니다.

## 개발 구조

```text
src/lib/ranking/provider.ts         # 조회 입출력 계약과 표시 문구
src/lib/ranking/providers/mock.ts   # 테스트 조회
src/lib/ranking/providers/naverLocal.ts # 네이버 지역검색 API
src/lib/ranking/index.ts            # provider 선택
src/lib/progress.ts                 # 순위·누적·상태 계산
src/lib/check-service.ts            # 조회 → 날짜 결정 → 저장
src/lib/repository.ts               # Supabase / 로컬 저장 분리
src/lib/auth.ts                     # 서버 인증
src/app/api/manage/route.ts         # 인증된 관리 요청
src/app/api/cron/check-rankings/route.ts # 인증된 자동조회
supabase/schema.sql                # 테이블·RLS·원자적 등록
```

실제 플레이스 수집 방식이 생기면 `RankingProvider`를 구현하는 `naverPlaceReal.ts`를 추가하고 `ranking/index.ts`의 providers에 등록하며 `providerLabels`에 표시 이름을 추가합니다. 저장·누적일·대시보드는 그대로 사용합니다.

Supabase 로그인은 서버 전용 HttpOnly 쿠키로 토큰을 보관하고 서버에서 `getUser`로 신원을 검증합니다. proxy가 만료 토큰을 갱신합니다. 직접 API 요청은 인증, 소유권, 입력값, Origin을 검사합니다.

## 공식 참고문서

- [네이버 지역검색 API](https://developers.naver.com/docs/serviceapi/search/local/local.md)
- [Supabase Next.js 시작 안내](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Supabase 사용자 관리](https://supabase.com/docs/guides/auth/managing-user-data)
- [Vercel Git 배포](https://vercel.com/docs/git)
- [Vercel Cron 제한](https://vercel.com/docs/cron-jobs/usage-and-pricing)

실제 검증 결과는 `VALIDATION.md`를 확인하세요.
