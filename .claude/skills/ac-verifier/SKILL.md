---
name: ac-verifier
description: "브라우저에서 실제 앱을 조작하여 GitHub Issue의 AC(Acceptance Criteria)를 하나씩 검증한다. /ac-verifier {이슈번호}로 실행. 'AC 검증', '인수 테스트', 'acceptance criteria', '브라우저 검증', '실제 동작 확인', '수동 테스트', 'QA' 등을 언급하면 이 스킬을 사용한다. TDD Green 이후 최종 검증 단계로, 코드 테스트가 아닌 실제 사용자 관점에서 동작을 확인한다."
---

# AC Verifier 스킬

GitHub Issue의 AC를 검증한다. 환경에 따라 3단계 폴백으로 최선의 검증 수단을 자동 선택한다.

## 입력

`$ARGUMENTS` = GitHub 이슈 번호 (예: `6`)

---

## Step 1. AC 목록 로드

```bash
gh issue view $ARGUMENTS
```

AC 체크리스트(`- [ ]` 항목)를 추출하여 검증할 목록을 만든다.

---

## Step 2. 검증 레벨 결정

3단계 폴백으로 사용 가능한 검증 수단을 판정한다.

### Level 1 판정: 브라우저 자동화

다음을 순서대로 확인한다:

1. `mcp__claude-in-chrome__tabs_context_mcp` 호출로 Chrome 연결 확인
2. http://localhost:5173 접근 가능 여부 확인 (앱 실행 중인지)

둘 다 성공하면 → **Level 1** 으로 진행한다.
하나라도 실패하면 → Level 2 판정으로 넘어간다.

### Level 2 판정: E2E 테스트

해당 기능의 E2E 테스트 파일이 존재하는지 확인한다:

1. `e2e/` 디렉토리에서 관련 스펙 파일을 찾는다 (이슈 제목이나 기능명으로 추론: 예: tag 기능 → `e2e/tag.spec.ts`)
2. 파일이 존재하고 테스트가 1개 이상이면 → **Level 2** 로 진행한다

E2E 파일이 없으면 → **Level 3** 으로 진행한다.

### 레벨 선택 출력

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AC 검증 — Issue #$ARGUMENTS
검증 방법: Level {N} ({레벨 이름})
사유: {Level 1/2를 사용할 수 없는 이유, 해당 시}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Level 1: 브라우저 자동화

사용자가 실제로 앱을 사용하는 관점에서 브라우저를 조작하여 검증한다.

### 1-1. 브라우저 탭 준비

chrome 브라우저 도구를 사용하여:

1. `tabs_context_mcp`로 현재 탭 상태를 확인한다
2. 새 탭을 생성하고 `http://localhost:5173`으로 이동한다

### 1-2. AC별 검증 루프

각 AC 항목에 대해 다음을 수행한다:

**검증 계획 수립** — AC 항목을 읽고, 검증을 위한 구체적인 브라우저 조작 단계를 계획한다.

**브라우저 조작** — chrome 도구를 사용하여 계획한 단계를 실행한다:

- `navigate` — 페이지 이동
- `read_page` — 현재 상태 확인 (Live 모드 권장)
- `form_input` — 입력 필드에 텍스트 입력
- `computer` — 클릭, 키보드 입력 등
- `javascript_tool` — DOM 상태 직접 확인이 필요할 때

**스크린샷 촬영** — 각 AC 검증 후 `computer` 도구의 screenshot 기능으로 현재 화면을 캡처한다.

**결과 기록** — AC별로 PASS/FAIL을 판정한다.

### 1-3. API 상태 확인

데이터가 실제로 저장/변경되었는지 API를 통해 확인한다:

```
javascript_tool로 fetch('http://localhost:3001/notes') 실행
```

→ Step 3(결과 보고)으로 진행한다.

---

## Level 2: E2E 테스트 실행

브라우저 자동화가 불가능할 때, Playwright E2E 테스트로 대체 검증한다.

### 2-1. E2E 테스트 실행

```bash
npx playwright test e2e/{feature}.spec.ts --reporter=list
```

### 2-2. 결과 매핑

E2E 테스트 결과를 AC 항목에 매핑한다. 각 테스트의 이름을 AC와 대조하여 PASS/FAIL을 판정한다.

### 2-3. 실패 시 상세 리포트

실패한 테스트가 있으면:

```bash
npx playwright test e2e/{feature}.spec.ts --reporter=html
```

Trace Viewer 경로를 개발자에게 안내한다.

→ Step 3(결과 보고)으로 진행한다.

---

## Level 3: 수동 체크리스트

브라우저 자동화와 E2E 테스트 모두 사용할 수 없을 때, 개발자가 직접 확인한다.

### 3-1. 체크리스트 출력

AC 항목을 체크리스트 형식으로 출력한다:

```
## AC 수동 검증 — Issue #$ARGUMENTS

다음 항목을 브라우저에서 직접 확인하고 결과를 알려주세요:

- [ ] AC 1: {내용}
- [ ] AC 2: {내용}
...
```

### 3-2. 개발자 응답 수집

AskUserQuestion으로 전체 AC의 PASS/FAIL 여부를 입력받는다.
FAIL 항목에는 구체적인 실패 내용을 함께 입력받는다.

→ Step 3(결과 보고)으로 진행한다.

---

## Step 3. 결과 요약 및 보고

모든 레벨에서 동일한 형식으로 결과를 보고한다:

```
## AC 검증 완료 — Issue #$ARGUMENTS: {제목}

검증 방법: Level {N} ({레벨 이름})

| # | AC | 결과 | 비고 |
|---|-----|:----:|------|
| 1 | AC 내용 | PASS | 정상 동작 |
| 2 | AC 내용 | FAIL | 기대: X, 실제: Y |

### PASS: N개 / FAIL: N개

### FAIL 상세 (해당 시)
- AC #2: 구체적인 실패 내용과 재현 단계
```

---

## Step 4. GitHub Issue 업데이트

모든 AC가 PASS인 경우:

- 개발자에게 이슈 닫기를 제안한다
- `gh issue close $ARGUMENTS`는 개발자 승인 후 실행

FAIL이 있는 경우:

- 실패 항목을 개발자에게 보고하고 수정 방향을 제안한다
- 이슈는 열어둔다

---

## 검증 팁

- **초기 상태부터 시작**: 매 AC 검증 전 페이지를 새로고침하여 깨끗한 상태에서 시작
- **데이터 확인**: UI 표시뿐 아니라 실제 데이터가 저장되었는지 API로 확인
- **에지 케이스**: AC의 Gherkin 시나리오에 명시된 경계 케이스도 검증
- **스크린샷 활용** (Level 1): 시각적 요소는 반드시 스크린샷으로 확인

## 절대 금지

- 코드를 수정하는 것 — 검증만 수행한다
- AC에 없는 항목을 검증하는 것
- 검증 없이 PASS로 판정하는 것
