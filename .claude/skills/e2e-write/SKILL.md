---
name: e2e-write
description: Use when the user asks to write E2E tests for a specific feature (e.g. "태그 기능 e2e 테스트 작성해줘", "e2e-write tag", "e2e 테스트 만들어줘"). Reads docs/features/{feature}/prd.md, extracts user stories, and generates e2e/{feature}.spec.ts following project Playwright conventions.
---

# E2E 테스트 생성 스킬

사용자가 특정 기능의 E2E 테스트 작성을 요청하면 이 스킬이 활성화된다.

## Step 1: 컨텍스트 수집 (반드시 먼저 읽기)

아래 파일을 **순서대로** 읽어 컨텍스트를 확보한다.

```
1. docs/features/{기능명}/prd.md          ← 사용자 스토리 + 인수 조건 원천
2. e2e/helpers.ts                          ← 사용 가능한 테스트 유틸리티
3. playwright.config.ts                    ← baseURL, workers, webServer 설정
4. e2e/notes.spec.ts                       ← 프로젝트 코드 스타일 레퍼런스
```

기능명이 명시되지 않은 경우, `docs/features/` 디렉토리를 확인해 목록을 사용자에게 제시한다.

---

## Step 2: 사용자 스토리 분류

PRD의 "사용자 스토리" 테이블을 읽고 각 스토리를 아래 기준으로 분류한다.

### E2E가 담당하는 것 ✅

- **사용자가 브라우저에서 직접 수행하는 행동과 그 결과**: 클릭, 입력, 화면에 표시되는 텍스트/요소
- **여러 레이어를 통과하는 흐름**: UI 인터랙션 → Context/API → DB 왕복 → UI 반영
- **페이지 간 상태 유지**: 저장 후 새로고침해도 데이터가 남아있는지
- **컴포넌트 간 통합**: 에디터에서 저장한 값이 목록에 반영되는지

### 단위 테스트가 담당하므로 E2E에서 중복하지 않는 것 ❌

| 단위 테스트 대상 | E2E에서 하지 말 것 |
|---|---|
| `tagUtils.ts` 순수 함수 (`normalizeTag`, `isDuplicateTag`) | `"  React  "` → `"react"` 정규화 자체를 검증 |
| `useTags` 훅 내부 상태 (renderHook 테스트) | 훅이 올바른 배열 상태를 갖는지 직접 확인 |
| 컴포넌트 props 렌더링 (Testing Library 단위 테스트) | 특정 prop 값이 DOM에 그대로 노출되는지 |
| API 함수 단위 (`fetchNotes`, `createNote` 반환값) | fetch mock으로 API 응답 형식 검증 |

> **핵심 판단 기준**: "이 검증이 브라우저 없이도 가능한가?" → YES면 단위 테스트로 충분.
> E2E는 "실제 사용자가 이 기능을 쓸 수 있는가?"를 답한다.

---

## Step 3: 테스트 시나리오 설계

분류된 E2E 스토리에서 시나리오를 도출한다.

### 시나리오 도출 규칙

1. **인수 조건(AC)이 곧 시나리오 제목**: "텍스트 입력 후 Enter 시 태그 칩이 추가된다" → 테스트 제목 그대로 사용
2. **Happy path 먼저, 엣지 케이스는 단위 테스트와 겹치지 않는 범위에서**: 사용자가 실수할 수 있는 흐름만 (빈 입력, 취소 등)
3. **전체 흐름(Happy path E2E) 1개 추가**: 기능의 핵심 워크플로우를 처음부터 끝까지 검증하는 통합 시나리오를 마지막에 배치

### 시나리오 그룹 구조 (describe 블록)

PRD 사용자 스토리 번호(US-N) 또는 논리적 흐름 단계로 그룹화한다.

```
test.describe('태그 추가 (US-1)') → Enter/쉼표로 칩 추가
test.describe('태그 삭제 (US-2)') → X 버튼으로 칩 제거
test.describe('목록에서 태그 표시 (US-3)') → NoteItem 칩 렌더링
test.describe('엣지 케이스') → 저장 후 태그 유지, 레거시 노트 폴백
test.describe('전체 흐름') → 추가 → 저장 → 목록 확인 → 삭제
```

---

## Step 4: 코드 작성

### 파일 위치

```
e2e/{기능명}.spec.ts
```

### 필수 보일러플레이트

```typescript
import { test, expect } from '@playwright/test';
import { resetDB, seedNotes } from './helpers';

test.beforeEach(async ({ request }) => {
  await resetDB(request);
});
```

### helpers.ts 활용 방법

```typescript
// DB 초기화 (beforeEach에서 자동 호출됨)
await resetDB(request);

// 노트 사전 생성 (tags 필드도 지원됨)
const [note] = await seedNotes(request, [
  { title: '테스트 노트', content: '내용', tags: ['react', 'typescript'] },
]);
```

> **중요**: `seedNotes`는 현재 `{ title, content }` 타입으로 정의되어 있다.
> 태그 기능 구현 후 `{ title, content, tags? }` 형태로 타입을 업데이트해야 한다.
> 스킬 실행 시 helpers.ts를 확인해 타입이 맞는지 검증한다.

### 로케이터 우선순위 (Playwright best practices)

```typescript
// ✅ 1순위: 역할 + 이름 (접근성 기반)
page.getByRole('button', { name: '저장' })
page.getByRole('textbox', { name: '태그 입력' })

// ✅ 2순위: placeholder / label
page.getByPlaceholder('태그를 입력하세요...')

// ✅ 3순위: 텍스트 (exact 명시)
page.getByText('react', { exact: true })

// ⚠️ 4순위: CSS 클래스 (시각적 상태 검증 시만 허용)
page.locator('[class*="rounded-2xl"]').filter({ hasText: '노트 제목' })

// ❌ 금지: data-testid (이 프로젝트는 testid를 사용하지 않음)
// ❌ 금지: nth-child, 인덱스 기반 접근
```

### `getByText` strict mode 주의 사항

헤더 버튼(예: `+ 새 노트`)과 에디터 라벨(예: `새 노트`)처럼 부분 일치로 두 요소가 매칭될 경우 반드시 `{ exact: true }` 사용:

```typescript
// ❌ strict mode violation — "새 노트" 버튼 + 라벨 두 개 매칭
await expect(page.getByText('새 노트')).toBeVisible();

// ✅
await expect(page.getByText('새 노트', { exact: true })).toBeVisible();
```

### 부모 요소 탐색 패턴

`NoteItem`처럼 텍스트의 **조상 요소**에 CSS 클래스가 있는 경우:

```typescript
// h3 텍스트 → 부모(flex div) → 부모(NoteItem 최상위 div)
const noteCard = page.getByText('노트 제목').locator('..').locator('..');

// 또는 더 명확하게: 카드 컨테이너를 필터로 찾기
const noteCard = page.locator('[class*="rounded-2xl"]').filter({ hasText: '노트 제목' });
```

### 네트워크 지연으로 UI 상태 포착

비동기 저장 중 버튼 상태 등 일시적 UI 상태를 테스트할 때:

```typescript
await page.route('**/notes/**', async (route) => {
  await new Promise((r) => setTimeout(r, 300));
  await route.continue();
});
await page.getByRole('button', { name: '저장' }).click();
await expect(page.getByRole('button', { name: '저장 중...' })).toBeDisabled();
```

### 금지 패턴

```typescript
// ❌ 절대 금지: 고정 대기
await page.waitForTimeout(1000);

// ✅ 대신: 상태 기반 대기 (Playwright 자동 retry)
await expect(page.getByText('태그 추가됨')).toBeVisible();

// ❌ 금지: 구현 세부 사항 검증 (내부 state, props)
// → 이건 단위 테스트의 영역

// ❌ 금지: 여러 독립 시나리오를 하나의 test()에 묶기
// → 각 인수 조건은 독립 test()로 분리
```

---

## Step 5: 완성 후 체크리스트

코드 작성 후 스스로 검토한다.

- [ ] `test.beforeEach`에서 `resetDB` 호출하는가?
- [ ] 각 테스트가 `seedNotes`로 필요한 사전 데이터를 설정하는가?
- [ ] 단위 테스트와 중복 검증이 없는가? (순수 로직 → unit, 브라우저 흐름 → E2E)
- [ ] `getByText` 충돌 가능성 있는 문자열에 `{ exact: true }` 붙였는가?
- [ ] `waitForTimeout` 없이 assertion 기반 대기를 사용하는가?
- [ ] PRD의 모든 E2E-담당 인수 조건이 커버되었는가?
- [ ] 전체 흐름(happy path) 시나리오가 마지막 describe에 있는가?
- [ ] `helpers.ts` 타입과 실제 시드 데이터 구조가 일치하는가?

---

## 참고: 프로젝트 Playwright 설정 요약

- **baseURL**: `http://localhost:5173`
- **테스트 서버**: `npm run dev:test` (Vite + `db.test.json`)
- **테스트 DB**: `db.test.json` (main `db.json`과 분리)
- **브라우저**: Chromium만 (단일 브라우저)
- **병렬 실행**: `workers: 1` (DB 상태 공유 → 순차 실행)
- **트레이스**: 첫 번째 재시도 시 자동 캡처
- **테스트 실행**: `npm run test:e2e`
- **UI 모드**: `npm run test:e2e:ui`
