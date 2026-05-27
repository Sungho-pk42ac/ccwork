---
name: tdd-auto-loop
description: "이슈 1개를 받아 TDD 9단계를 사용자 개입 없이 자율 완주하는 스킬. /tdd-auto-loop {이슈번호}로 실행. 'TDD 자동', 'auto loop', '자동 루프', '자율 주행', 'autopilot', '자동 TDD' 등을 언급하면 이 스킬을 사용한다. 각 단계를 격리된 subagent로 실행하고, 승인 게이트 없이 끝까지 진행하며, 실패 시 자동 수정 루프를 돌리고, 최종 PR을 main으로도 보내 CI를 트리거한다."
---

# TDD Auto Loop v2

이슈 1개를 받아 **9단계 TDD 사이클을 사용자 개입 없이 자율 완주**한다.
v1 대비 변경: E2E 로케이터 프리스캔, AC 실패 자동 수정 루프, spec→main CI 게이트 추가.

## 입력

`$ARGUMENTS` = GitHub 이슈 번호 (예: `8`)

## 핵심 규칙

- **사용자에게 묻지 않는다** — AskUserQuestion 사용 금지, 모든 승인 게이트 자동 통과
- **메인은 코드를 직접 보지 않는다** — subagent 결과 JSON만 읽고 판단
- **모호하면 STOP** — 추측하여 진행하지 않음
- **AC 검증은 Green subagent와 반드시 분리** — 독립 검증 보장
- **E2E 로케이터를 Green 전에 추출** — 구현과 E2E 불일치 사전 방지

---

## 자율 모드 프롬프트 (모든 subagent 공통 접미사)

모든 subagent 호출 시 프롬프트 끝에 아래 블록을 반드시 포함한다:

```
## 자율 모드 규칙
- AskUserQuestion 사용 금지. 모든 승인 게이트는 자동 통과한다.
- 모호하면 즉시 status: "STOP"을 반환하라. 추측 금지.
- 출력은 아래 지정된 JSON schema 한 블록만. 그 외 텍스트 금지.
- JSON 앞뒤에 설명, 요약, 인사 등을 붙이지 마라.
```

---

## 상태 파일

각 단계 완료 시 `.tdd-auto-state.json`을 갱신한다. git에 커밋하지 않는다.

```json
{
  "issue": 8,
  "current_step": "green",
  "completed": ["preflight", "scenarios", "red", "e2e_prescan"],
  "started_at": "2026-05-28T10:00:00Z",
  "last_updated": "2026-05-28T10:05:00Z",
  "stop_reason": null
}
```

---

## 전체 단계 흐름

```
0. preflight → 1. scenarios → 2. red → 2.5. e2e_prescan → 3. green
→ 4. ac_verify (실패 시 → 4.5. ac_fix → 4. 재시도)
→ 5. refactor → 6. security → 7. pr → 8. ci_gate
```

---

## Step 0. 사전 점검 (preflight)

**실행**: 메인이 직접 수행 (subagent 아님)

```bash
gh issue view $ARGUMENTS
git status --porcelain
git branch --show-current
```

이슈 제목에서 슬러그를 추출하여 `feat/issue-{N}-{slug}` 브랜치를 생성하고 체크아웃한다.
브랜치가 이미 존재하면 해당 브랜치로 체크아웃한다 (사용자에게 묻지 않음).

기존 dev 서버가 실행 중이면 종료한다 (포트 5173/3001 점유 프로세스 kill).

**반환 schema**:

```json
{
  "step": "preflight",
  "status": "OK",
  "issue_number": 8,
  "issue_title": "NoteItem에 태그 칩 읽기 전용 표시",
  "ac_count": 4,
  "spec_branch": "feature/tag-spec",
  "work_branch": "feat/issue-8-tag-readonly",
  "stop_reason": null
}
```

**STOP 조건**: 이슈 없음/CLOSED, AC 0개, tracked 변경 있음, 브랜치가 `feature/*` 아님

---

## Step 1. 테스트 시나리오 (scenarios)

**실행**: Agent subagent

**프롬프트 핵심**: 이슈 AC를 읽고, PRD와 기존 코드베이스 패턴을 참조하여 시그니처를 확정하고, 테스트 시나리오를 도출하여 `docs/features/tag/issue-{$ARGUMENTS}.md`에 기록한다.

**반환 schema**:

```json
{
  "step": "scenarios",
  "status": "OK",
  "file_path": "docs/features/tag/issue-8.md",
  "signature_count": 2,
  "scenario_count": 10,
  "scenarios": { "normal": 5, "boundary": 3, "exception": 2 },
  "stop_reason": null
}
```

**STOP 조건**: AC에서 시그니처 도출 불가, PRD/코드 참조 불가

---

## Step 2. TDD Red (red)

**실행**: Agent subagent

**프롬프트 핵심**: 시나리오를 실패하는 테스트 코드로 변환. 구현 코드 건드리지 않음. `npm test` 실행하여 새 테스트 실패 + 기존 테스트 통과 확인.

**반환 schema**:

```json
{
  "step": "red",
  "status": "OK",
  "test_files": ["src/components/NoteItem.test.tsx"],
  "test_count": 10,
  "all_failing": true,
  "existing_tests_pass": true,
  "stop_reason": null
}
```

**STOP 조건**: SyntaxError/import 오류 등 비정상 실패, 기존 테스트 회귀

---

## Step 2.5. E2E 로케이터 프리스캔 (e2e_prescan) ★ 신규

**실행**: Agent subagent

**왜 필요한가**: Green subagent가 E2E 로케이터를 모르면 placeholder, CSS class, 텍스트 구조가 E2E 기대와 불일치한다. 이전 루프에서 4건의 수동 개입 중 3건이 이 원인이었다.

**프롬프트 핵심**: `e2e/` 디렉토리에서 관련 E2E 스펙 파일을 찾아 읽고, 구현 시 지켜야 할 로케이터 제약 조건을 추출한다.

추출 대상:

- `getByPlaceholder('...')` → placeholder 텍스트 (정확히 일치해야 함)
- `getByText('...', { exact: true })` → 해당 텍스트가 요소의 유일한 텍스트여야 함 (자식 요소 텍스트 포함 시 실패)
- `getByRole('button', { name: '...' })` → aria-label 또는 버튼 텍스트
- `locator('[class*="chip"]')`, `locator('[class*="tag"]')` → CSS class에 해당 문자열 포함 필수
- `getByTestId('...')` → data-testid 속성

**반환 schema**:

```json
{
  "step": "e2e_prescan",
  "status": "OK",
  "e2e_file": "e2e/tag.spec.ts",
  "constraints": [
    { "type": "placeholder", "value": "태그를 입력하세요...", "source": "line 24" },
    {
      "type": "exact_text",
      "value": "react",
      "note": "칩 텍스트는 별도 요소로 감싸야 함 (부모에 버튼 텍스트 포함 시 exact match 실패)"
    },
    {
      "type": "css_class",
      "selector": "[class*=\"chip\"], [class*=\"tag\"]",
      "note": "칩 요소의 class에 chip 또는 tag 문자열 포함 필수"
    },
    {
      "type": "role_button",
      "context": "chip 내부",
      "note": "삭제 버튼은 chip 내부 button role로 접근"
    }
  ],
  "stop_reason": null
}
```

**STOP 조건**: E2E 스펙 파일이 존재하지 않으면 constraints를 빈 배열로 OK 반환 (STOP 아님 — E2E 없는 이슈도 있을 수 있음)

**Green으로의 전달**: 반환된 `constraints` 배열을 Green subagent 프롬프트에 아래 형식으로 포함한다:

```
## E2E 로케이터 제약 조건 (반드시 준수)
아래 조건을 지키지 않으면 E2E 테스트가 실패한다.
{constraints JSON}
```

---

## Step 3. TDD Green (green) — 최대 3회 재시도

**실행**: Agent subagent (시도마다 새 subagent)

**프롬프트 핵심**: 실패 중인 테스트를 통과시키는 최소 구현. CLAUDE.md 패턴 준수. 디자인 시스템 스킬의 `references/` 토큰 참조.

**★ E2E 제약 조건 포함**: Step 2.5에서 추출한 `constraints`를 프롬프트에 포함한다. Green subagent는 이 제약을 지키며 구현해야 한다.

재시도 시 이전 시도의 에러 출력을 전달한다.

**반환 schema**:

```json
{
  "step": "green",
  "status": "OK",
  "attempt": 1,
  "total_tests": 60,
  "passed": 60,
  "failed": 0,
  "regression": false,
  "implemented_files": ["src/components/NoteItem.tsx"],
  "stop_reason": null
}
```

**재시도 규칙**:

- `failed > 0` 이고 `attempt < 3` 이고 `regression == false` → 재시도
- `attempt == 3` 이고 `failed > 0` → STOP
- `regression == true` → 즉시 STOP

---

## Step 4. AC 검증 (ac_verify) — Green과 반드시 별도 subagent

**실행**: Agent subagent (Step 3과 다른 독립 subagent)

**검증 방법**: E2E 테스트 (Level 2) 고정.

```bash
npx playwright test e2e/{feature}.spec.ts --reporter=list
```

**반환 schema**:

```json
{
  "step": "ac_verify",
  "status": "OK",
  "level": 2,
  "e2e_file": "e2e/tag.spec.ts",
  "total_e2e": 12,
  "passed_e2e": 12,
  "failed_e2e": 0,
  "ac_results": [{ "ac": "AC 내용", "passed": true }],
  "ac_passed": true,
  "failed_details": [],
  "stop_reason": null
}
```

**실패 시 처리 (★ 자동 수정 루프)**:

- `ac_passed == false` → Step 4.5 (ac_fix) 실행
- E2E 파일 없음 → STOP
- Playwright 실행 불가 → STOP

---

## Step 4.5. AC 실패 자동 수정 (ac_fix) ★ 신규 — 최대 2회

**실행**: Agent subagent

**왜 필요한가**: 단위 테스트가 통과해도 E2E가 실패할 수 있다 (로케이터 불일치, 통합 동작 차이 등). 이전에는 STOP 후 사람이 수정했지만, 이제 자동으로 수정을 시도한다.

**프롬프트 핵심**: ac_verify에서 반환된 `failed_details`를 읽고, E2E 에러 메시지를 분석하여 **구현 코드만** 수정한다.

```
## E2E 실패 정보
{failed_details JSON — 에러 메시지, expected, actual, locator 등}

## 수정 규칙
- E2E 테스트 코드(e2e/*.spec.ts)는 절대 수정 금지
- 단위 테스트 코드(*.test.ts/tsx)도 수정 금지
- 구현 코드(src/)만 수정한다
- 수정 후 npm test 통과 확인 필수
```

**반환 schema**:

```json
{
  "step": "ac_fix",
  "status": "OK",
  "attempt": 1,
  "fixes": [{ "file": "src/components/TagInput.tsx", "description": "placeholder 변경" }],
  "unit_tests_pass": true,
  "stop_reason": null
}
```

**루프**:

1. ac_fix 실행 → 구현 수정
2. ac_verify 재실행
3. 여전히 실패 → ac_fix 재실행 (attempt 2)
4. ac_verify 재실행
5. 여전히 실패 → STOP

**STOP 조건**: 2회 수정 시도 후에도 E2E 실패

---

## Step 5. TDD Refactor (refactor)

**실행**: Agent subagent

**프롬프트 핵심**: CLAUDE.md 컨벤션 대조 후 개선점 식별. 변경마다 `npm test`. 깨지면 롤백.

**반환 schema**:

```json
{
  "step": "refactor",
  "status": "OK",
  "changes": [{ "file": "path", "description": "change" }],
  "skipped": [],
  "tests_passed": true,
  "stop_reason": null
}
```

**STOP 조건**: 롤백 후에도 테스트 깨진 상태

---

## Step 6. Security Review (security)

**실행**: Agent subagent

**프롬프트 핵심**: tsc --noEmit, npm audit, 환경변수 노출 검사.

**반환 schema**:

```json
{
  "step": "security",
  "status": "OK",
  "tsc_pass": true,
  "audit_vulnerabilities": 0,
  "critical_count": 0,
  "high_count": 0,
  "env_exposure": false,
  "stop_reason": null
}
```

**STOP 조건**: critical/high > 0, tsc 실패, env 노출

---

## Step 7. PR 생성 (pr)

**실행**: Agent subagent

**프롬프트 핵심**:

1. `npm test` 전체 통과 확인
2. E2E 테스트 실행 (ci.yml e2e job 범위)
3. Conventional Commits 커밋 (소문자 subject, commitlint 통과)
4. `git push origin HEAD`
5. `gh pr create --base {spec_branch}` — body에 `Closes #$ARGUMENTS`
6. `gh issue comment $ARGUMENTS --body "PR: {url}"`

**반환 schema**:

```json
{
  "step": "pr",
  "status": "OK",
  "commit_sha": "abc1234",
  "pr_url": "https://github.com/owner/repo/pull/16",
  "pr_base": "feature/tag-spec",
  "e2e_passed": true,
  "stop_reason": null
}
```

**STOP 조건**: commitlint 실패, E2E 실패, push/PR 생성 실패

---

## Step 8. CI 게이트 (ci_gate) ★ 신규

**실행**: 메인이 직접 수행 (subagent 아님)

**왜 필요한가**: feature→spec PR은 CI가 돌지 않을 수 있다. spec→main PR을 생성/업데이트하여 CI를 트리거한다.

**실행 순서**:

1. feature→spec PR이 머지 가능한지 확인
2. spec→main PR이 이미 존재하는지 확인:
   ```bash
   gh pr list --base main --head {spec_branch} --json number,url --jq '.[0]'
   ```
3. **없으면**: spec→main PR 생성
   ```bash
   gh pr create --base main --head {spec_branch} \
     --title "feat(tag): 태그 기능 통합 (spec→main)" \
     --body "태그 기능 구현 통합 PR. 개별 이슈 PR이 spec 브랜치에 머지된 후 main으로 통합.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)"
   ```
4. **있으면**: 이미 최신 커밋이 반영됨 (feature PR 머지 시 자동). URL만 기록.
5. CI 실행 상태를 확인하되 완료까지 기다리지 않음 (비동기).

**반환 schema**:

```json
{
  "step": "ci_gate",
  "status": "OK",
  "spec_to_main_pr": "https://github.com/owner/repo/pull/13",
  "ci_triggered": true,
  "stop_reason": null
}
```

**STOP 조건**: spec→main PR 생성 실패 (권한 문제 등). CI 실패 자체는 STOP이 아님 (비동기 확인).

---

## 재시도 규칙

| 단계               | 재시도        | 조건                                    |
| ------------------ | ------------- | --------------------------------------- |
| green              | 최대 3회      | `failed > 0` 이고 `regression == false` |
| ac_verify + ac_fix | 최대 2 사이클 | E2E 실패 시 수정 → 재검증               |
| 그 외              | 최대 1회      | JSON schema 위반 시에만                 |

---

## STOP 처리 프로토콜

어느 단계에서든 `status: "STOP"` 시:

1. `.tdd-auto-state.json` 갱신
2. 이슈 코멘트:
   ```bash
   gh issue comment $ARGUMENTS --body "🛑 tdd-auto-loop STOP at [${step}]
   Reason: ${stop_reason}
   Branch: ${work_branch}
   State: .tdd-auto-state.json"
   ```
3. 진행 로그 출력
4. 루프 종료 — 사용자에게 묻지 않음

---

## 진행 메시지 형식

```
[preflight] OK
[scenarios] OK (10 scenarios)
[red] OK (10 tests, all failing)
[e2e_prescan] OK (4 constraints)
[green] OK (attempt 1, 60/60 passed)
[ac_verify] OK (Level 2, 12/12 E2E passed)
[refactor] OK (1 change)
[security] OK (tsc ✓, audit 0)
[pr] OK (https://github.com/owner/repo/pull/16)
[ci_gate] OK (spec→main PR: https://github.com/owner/repo/pull/13)
```

---

## 완료 출력

```json
{
  "result": "COMPLETE",
  "issue": 8,
  "steps": {
    "preflight": "OK",
    "scenarios": "OK",
    "red": "OK",
    "e2e_prescan": "OK",
    "green": "OK",
    "ac_verify": "OK",
    "refactor": "OK",
    "security": "OK",
    "pr": "OK",
    "ci_gate": "OK"
  },
  "pr_url": "https://github.com/owner/repo/pull/16",
  "ci_pr_url": "https://github.com/owner/repo/pull/13",
  "total_tests": 60
}
```

---

## 절대 금지

- **AskUserQuestion 호출** — 메인도 subagent도 사용 금지
- **메인이 src/ 파일을 직접 읽거나 수정하는 것** — subagent만 코드 접근
- **Green subagent가 AC 검증을 겸하는 것** — 반드시 별도 subagent
- **E2E 테스트 코드를 수정하는 것** — ac_fix는 구현 코드만 수정
- **STOP 후 사용자에게 "계속할까요?" 묻는 것** — 즉시 종료
- **JSON schema 외 텍스트 출력** — subagent는 JSON 한 블록만 반환
- **추측하여 진행하는 것** — 확실하지 않으면 STOP
