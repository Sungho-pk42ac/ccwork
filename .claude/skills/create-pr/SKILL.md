---
name: create-pr
description: "PR 생성을 자동화한다. /create-pr로 명시 호출하거나, 'PR 만들어줘', 'PR 올려줘', 'PR 보내줘', '이거 머지하자', 'create-pr' 등을 언급하면 이 스킬을 사용한다. 현재 브랜치의 변경사항을 요약해 PR 초안을 생성하고 개발자에게 승인받은 뒤, E2E 테스트를 실행한다. 통과 시 gh pr create로 PR을 생성하고, 실패 시 TDD 루프 안내를 출력한다."
---

# Create PR 스킬

현재 브랜치의 변경사항을 분석해 PR 초안을 만들고, E2E 게이트를 통과한 뒤 PR을 생성한다.

## 입력 (선택)

- `$BASE_BRANCH`: PR base 브랜치. tdd-loop에서 호출 시 `$SPEC_BRANCH`가 전달된다. 미지정 시 기본값 `main`.

---

## Step 1. 브랜치 컨텍스트 수집

base 브랜치를 결정한다: `$BASE_BRANCH`가 전달되었으면 해당 값, 없으면 `main`.

```bash
# 현재 브랜치 확인
git branch --show-current

# base 대비 커밋 목록
git log {base}..HEAD --oneline

# 변경 파일 요약
git diff {base}..HEAD --stat

# 변경된 코드 전체 diff (컨텍스트 파악용)
git diff {base}..HEAD
```

브랜치 이름이 `feature/tag-xxx` 형태면 관련 GitHub 이슈 번호를 추론한다:

```bash
# 연결 가능한 오픈 이슈 확인
gh issue list --state open --limit 20
```

---

## Step 2. PR 초안 생성

수집한 컨텍스트(커밋 목록, diff, 이슈 정보)를 바탕으로 PR 초안을 작성한다.

### 제목 규칙

Conventional Commits 포맷을 따른다:

```
feat(tag): 태그 추가/삭제 기능 구현 (closes #N)
fix(editor): 태그 입력 필드 포커스 버그 수정
refactor(hooks): useTags 상태 관리 분리
```

- `type(scope): 한국어 요약 (closes #N)` — 관련 이슈가 있으면 `closes #N` 포함
- 제목은 50자 이내, 명령형 현재 시제

### 본문 구조

````markdown
## 개요

{변경의 목적과 배경을 2–3문장으로 요약}

## 변경 사항

- {핵심 변경 항목 1}
- {핵심 변경 항목 2}
- {핵심 변경 항목 3}

## 기술 결정 (해당 시)

{설계 결정, 트레이드오프, 대안을 선택하지 않은 이유}

## 테스트 방법

```bash
npm run test:e2e   # E2E 전체
npm test           # 단위 테스트 전체
```
````

## 관련 이슈

closes #{N}

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

```

> PR 본문 마지막 줄은 항상 `🤖 Generated with [Claude Code](https://claude.com/claude-code)` 로 끝난다.

---

## Step 3. 개발자 승인 요청

초안을 아래 형식으로 출력하고 확인을 요청한다:

```

────────────────────────────────────────
📋 PR 초안
────────────────────────────────────────
제목: feat(tag): useTags 훅 및 태그 유틸 구현 (closes #5)

본문:
{생성된 본문 전체}
────────────────────────────────────────
이 내용으로 PR을 생성할까요?
① 승인 — E2E 테스트 실행 후 PR 생성
② 제목 수정
③ 본문 수정
④ 취소

````

- **② 또는 ③** 선택 시: 수정 내용을 입력받아 초안을 업데이트한 뒤 다시 Step 3을 반복한다.
- **④ 취소** 시: 즉시 종료. 작업한 내용은 변경하지 않는다.
- **①** 선택 시: Step 4로 진행한다.

---

## Step 4. E2E 테스트 실행

CI와 동일한 범위를 로컬에서 실행한다.
실행 전 `.github/workflows/ci.yml`의 e2e job `run:` 커맨드를 읽어 현재 CI 범위를 확인하고, 그대로 사용한다.

```bash
# ci.yml e2e job의 run: 값을 그대로 실행 (현재 예시)
npx playwright test e2e/notes.spec.ts
````

> **왜 ci.yml을 읽는가**: Red 상태(UI 미구현)인 스펙 파일이 있을 경우, CI는 해당 파일을 제외하고 안정된 테스트만 실행한다. 로컬 게이트도 CI와 동일 범위여야 "CI 통과 = 로컬 게이트 통과"가 일관된다. 태그 UI 구현 완료 후 ci.yml에서 파일 지정을 제거하면 이 스킬도 자동으로 전체 범위를 실행하게 된다.

### 4-A. 테스트 통과 → Step 5로 진행

모든 테스트가 통과하면 바로 PR 생성 단계로 넘어간다.

### 4-B. 테스트 실패 → PR 생성 중단

다음 안내를 출력하고 **스킬을 종료**한다. PR은 생성하지 않는다.

```
────────────────────────────────────────
❌ E2E 실패 — PR 생성이 중단되었습니다
────────────────────────────────────────

실패한 테스트를 수정한 뒤 /create-pr을 다시 실행하세요.
⚠ E2E 테스트 코드를 수정해서 통과시키는 것은 금지입니다.
   근본 원인(프로덕션 코드)을 수정해야 합니다.

──── 디버깅 순서 ────

① Trace Viewer로 실패 지점 확인
   npx playwright test --reporter=html && npx playwright show-report
   → 어떤 단계에서 요소를 못 찾거나 assertion이 깨졌는지 확인

② 실패 레이어 판별
   ┌──────────────────────┬──────────────────────────────┐
   │ 증상                 │ 해당 레이어                  │
   ├──────────────────────┼──────────────────────────────┤
   │ 요소가 DOM에 없음     │ 렌더링 레이어 (컴포넌트)     │
   │ 요소 있지만 동작 안함│ 이벤트/상태 로직 레이어      │
   │ DB/API 응답 이상     │ API 레이어 (notes.ts, DB)    │
   │ 데이터 형식 오류     │ 타입/유틸 레이어             │
   └──────────────────────┴──────────────────────────────┘

③ 해당 레이어의 단위 테스트에 실패 케이스 추가 (Red)
   /tdd-red {이슈번호}

④ 프로덕션 코드 수정으로 단위 테스트 통과 (Green)
   /tdd-green {이슈번호}

⑤ 리팩토링 후 커밋 전 보안 점검
   /tdd-refactor {이슈번호}
   /security-review {이슈번호}

⑥ 다시 PR 생성 시도
   /create-pr
────────────────────────────────────────
```

---

## Step 5. git push 및 PR 생성

```bash
# 현재 브랜치를 origin에 푸시
git push origin HEAD
```

push 성공 후 PR을 생성한다:

```bash
gh pr create \
  --title "{승인된 PR 제목}" \
  --body "{승인된 PR 본문}" \
  --base {base}
```

### 성공 보고

```
────────────────────────────────────────
✅ PR 생성 완료
────────────────────────────────────────
제목 : feat(tag): useTags 훅 및 태그 유틸 구현 (closes #5)
URL  : https://github.com/owner/repo/pull/N
브랜치: feature/tag-xxx → {base}
────────────────────────────────────────
```

---

## 프로젝트 규칙 (자동 적용)

| 항목           | 규칙                                                              |
| -------------- | ----------------------------------------------------------------- |
| PR base 브랜치 | `$BASE_BRANCH` (기본값: `main`, tdd-loop에서 전달 시 해당 브랜치) |
| 본문 마지막 줄 | `🤖 Generated with [Claude Code](https://claude.com/claude-code)` |
| E2E 게이트     | `npm run test:e2e` — 실패 시 PR 생성 금지                         |
| E2E 코드 수정  | **절대 금지** — 테스트 코드로 실패를 우회하는 것은 근본 원인 회피 |
| 커밋 형식      | Conventional Commits (`feat/fix/refactor/docs/chore/test/style`)  |
| 이슈 연결      | 제목 또는 본문에 `closes #N` 포함                                 |

## 절대 금지

- E2E가 실패한 상태로 PR을 생성하는 것
- E2E 테스트 코드를 수정해서 실패를 통과로 바꾸는 것
- 개발자 승인 없이 push하거나 PR을 생성하는 것
- `main` 브랜치에서 직접 실행하는 것 (브랜치 확인 후 main이면 중단하고 안내)
