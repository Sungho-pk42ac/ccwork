---
name: dev-pipeline
description: "아이디어 한 줄에서 PR 머지까지 전체 개발 파이프라인을 자율 실행한다. /dev-pipeline {아이디어}로 실행. '기능 만들어줘', '이거 개발해줘', '새 기능', 'dev-pipeline', '파이프라인', '처음부터 끝까지', 'end-to-end', '전체 개발' 등을 언급하면 이 스킬을 사용한다. 소크라테스 인터뷰로 암묵지를 추출하고, 모호도 게이트를 통과한 spec을 PRD→이슈→TDD 자율 루프→CI PR까지 완주한다."
---

# Dev Pipeline

아이디어 한 줄을 입력받아 **인터뷰 → Spec → PRD → 이슈 → TDD 구현 → PR → CI**를 자율 완주한다.

```
Phase 1: Discovery (인터뷰 + 모호도 게이트)
Phase 2: Specification (spec.md → spec-fixed.md)
Phase 3: Planning (PRD + ADR + 이슈 분해 + E2E 스펙)
Phase 4: Execution (이슈별 tdd-auto-loop)
Phase 5: Integration (spec→main PR + CI)
```

## 입력

`$ARGUMENTS` = 자연어 아이디어 (예: `"노트에 태그 기능 추가"`)

## 핵심 규칙

- **IntentGate**: 실행 전 사용자 의도를 분석하여 파이프라인 범위를 확정한다
- **모호도 게이트**: Ambiguity ≤ 0.2 이 될 때까지 질문한다 — 숫자로 판단, 감으로 판단하지 않음
- **Immutable Seed**: spec-fixed.md는 확정 후 절대 수정하지 않는다
- **자율 모드**: Phase 4~5는 사용자 개입 없이 완주한다
- **Phase 1~3은 사용자와 대화한다** — 암묵지 추출은 자동화 불가

---

## Phase 1. Discovery — 인터뷰 + 모호도 게이트

### 1.0 IntentGate (Oh-My-OpenAgent 적용)

$ARGUMENTS를 분석하여 진짜 의도를 파악한다. 문자 그대로 해석하지 않는다.

```
입력: "노트에 태그 기능 추가"
IntentGate 분석:
- 표면 의도: 태그 CRUD
- 숨은 의도: 분류/검색이 목적일 수 있음
- 범위 질문: 태그만? 태그+필터링? 태그+자동완성?
→ 첫 질문에 범위 확인 포함
```

AskUserQuestion으로 IntentGate 결과를 확인받는다:

```
당신의 의도를 이렇게 이해했습니다:
- 핵심: {표면 의도}
- 가능한 확장: {숨은 의도}
- 제외 범위: {out of scope 후보}

이 이해가 맞나요?
```

### 1.1 소크라테스 인터뷰 (Ouroboros 적용)

숨은 가정을 드러내는 질문을 한다. **답을 제시하지 않고 질문만 한다.**

#### 모호도 차원 (Ouroboros Ambiguity Scoring)

| 차원               | 가중치 | 평가 기준                    |
| ------------------ | ------ | ---------------------------- |
| Goal Clarity       | 40%    | 무엇을 만드는지 명확한가     |
| Constraint Clarity | 30%    | 기술 제약, 호환성, 성능 요구 |
| Success Criteria   | 30%    | 완료 조건이 검증 가능한가    |

각 차원을 0.0 ~ 1.0으로 점수화한다:

- **1.0**: 명확, 추가 질문 불필요
- **0.5**: 부분적 — 1~2개 질문 필요
- **0.0**: 불명확 — 핵심 질문 필요

**Ambiguity = 1 - (Goal×0.4 + Constraint×0.3 + Success×0.3)**

#### 인터뷰 루프

```
while Ambiguity > 0.2:
    1. 가장 낮은 점수 차원을 식별한다
    2. 해당 차원에 대한 질문 1~2개를 AskUserQuestion으로 묻는다
    3. 답변을 반영하여 점수를 재계산한다
    4. 현재 모호도를 표시한다:
       "모호도: 0.35 → 목표 0.2 [Goal: 0.8 | Constraint: 0.5 | Success: 0.7]"
```

**질문 상한**: 기본 7회. 7회 후에도 0.2 미달이면 현재 점수와 미해결 항목을 보여주고 사용자에게 "진행/추가 질문" 선택을 준다.

#### 질문 예시 (차원별)

**Goal**: "이 기능의 주요 사용자는 누구인가요?", "기존에 이 문제를 어떻게 해결하고 있나요?"
**Constraint**: "기존 코드/API와의 호환성 제약이 있나요?", "성능 요구사항이 있나요?"
**Success**: "이 기능이 '완성'되었다고 판단하는 기준은?", "사용자가 가장 먼저 시도할 동작은?"

### 1.2 모호도 게이트 통과

Ambiguity ≤ 0.2 달성 시:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모호도 게이트 통과 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Goal: 0.9 | Constraint: 0.8 | Success: 0.9
Ambiguity: 0.12 (≤ 0.2)
질문 횟수: 4회
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Phase 2. Specification — Immutable Seed

### 2.1 spec.md 생성

인터뷰 결과를 구조화하여 `docs/features/{feature}/spec.md`를 생성한다:

```markdown
# {Feature Name} Spec

## 의도 (IntentGate)

{표면 의도 + 확인된 범위}

## 핵심 요구사항

{Goal Clarity에서 확정된 내용}

## 제약 조건

{Constraint Clarity에서 확정된 내용}

## 성공 기준

{Success Criteria에서 확정된 내용}

## Out of Scope

{명시적으로 제외한 항목}

## 모호도 점수

Goal: {score} | Constraint: {score} | Success: {score}
Ambiguity: {score}
```

### 2.2 spec-fixed.md 확정 (Immutable Seed)

spec.md를 사용자에게 보여주고 AskUserQuestion으로 최종 승인을 받는다.

승인 시 `docs/features/{feature}/spec-fixed.md`로 복사한다.

**spec-fixed.md는 이후 절대 수정하지 않는다.** PRD, 이슈, 구현은 모두 이 문서를 기준으로 한다. 변경이 필요하면 새 파이프라인을 시작한다.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Immutable Seed 확정 ✓
docs/features/{feature}/spec-fixed.md
이 문서는 수정되지 않습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Phase 3. Planning — PRD + 이슈 분해

### 3.1 PRD + ADR 생성

spec-fixed.md를 기반으로 Agent subagent가 PRD를 생성한다:

- `docs/features/{feature}/prd.md` — 사용자 스토리, AC, 기술 결정(ADR)
- 기존 코드베이스를 분석하여 아키텍처 결정을 ADR 형식으로 포함
- spec-fixed.md의 Out of Scope를 PRD에도 명시

### 3.2 수직 슬라이싱 이슈 분해

PRD를 기반으로 수직 슬라이스로 이슈를 분해한다:

- 각 이슈는 데이터 → 로직 → UI를 관통
- 의존성 그래프 작성 (`issues.md`)
- `gh issue create`로 GitHub 이슈 자동 등록

### 3.3 E2E 스펙 생성

PRD의 사용자 스토리를 기반으로 E2E 테스트 스펙을 생성한다:

- `e2e/{feature}.spec.ts` — Playwright E2E 테스트
- 이 시점에서 E2E가 존재해야 tdd-auto-loop의 e2e_prescan이 작동

### 3.4 feature 브랜치 생성

```bash
git checkout -b feature/{feature}-spec
git add docs/features/{feature}/ e2e/{feature}.spec.ts
git commit -m "docs({feature}): spec, prd, issues, e2e spec"
git push origin feature/{feature}-spec
```

### 3.5 Phase 3 승인 게이트

PRD + 이슈 목록 + E2E 스펙을 사용자에게 보여주고 최종 승인을 받는다.
이 게이트가 Phase 1~3의 마지막 사용자 상호작용이다.

승인 후 Phase 4는 **완전 자율 모드**로 진행한다.

---

## Phase 4. Execution — 자율 TDD 루프

### 4.1 이슈 의존성 순서 결정

`docs/features/{feature}/issues.md`의 의존성 그래프를 읽어 실행 순서를 결정한다.
선행 이슈가 머지된 후에만 다음 이슈를 시작한다.

### 4.2 이슈별 tdd-auto-loop 실행

각 이슈에 대해 `/tdd-auto-loop {이슈번호}`를 순차 실행한다:

```
for issue in sorted_issues:
    1. 이전 이슈 PR이 spec 브랜치에 머지되었는지 확인
    2. 머지 안 됐으면 gh pr merge (squash)
    3. feature/{feature}-spec에서 pull
    4. /tdd-auto-loop {issue.number} 실행
    5. 결과가 COMPLETE면 다음 이슈로
    6. STOP이면 전체 파이프라인 STOP
```

### 4.3 진행 상태 출력

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 4: Execution — {feature}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[#3] Note 타입 tags 추가        COMPLETE
[#4] 태그 정규화 유틸           COMPLETE
[#5] useTags 훅                 COMPLETE
[#6] TagInput + NoteEditor      RUNNING...
[#7] 태그 저장                  PENDING
[#8] NoteItem 태그 표시         PENDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Phase 5. Integration — CI 게이트

### 5.1 spec→main PR

모든 이슈가 COMPLETE되면:

```bash
gh pr create --base main --head feature/{feature}-spec \
  --title "feat({feature}): {feature} 기능 통합" \
  --body "{전체 이슈 요약 + 테스트 결과}"
```

### 5.2 CI 확인

PR 생성 후 CI 상태를 확인한다. 완료까지 기다리지 않고 URL을 보고한다.

### 5.3 완료 리포트

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dev Pipeline 완료 — {feature}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
입력: "{아이디어}"
인터뷰: {N}회 질문, 모호도 {score}
Spec: docs/features/{feature}/spec-fixed.md
PRD: docs/features/{feature}/prd.md
이슈: {N}개 생성, {N}개 완료
테스트: {N}개 단위 + {N}개 E2E
PR: {main PR URL}
CI: {상태}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STOP 처리

어느 Phase에서든 STOP 시:

1. 현재까지 완료된 산출물 목록 출력
2. STOP 원인과 재개 방법 안내
3. `gh issue comment`로 관련 이슈에 상태 기록

---

## 적용된 외부 하네스 강점

| 출처                | 적용 내용                                 | 위치               |
| ------------------- | ----------------------------------------- | ------------------ |
| **Ouroboros**       | 모호도 정량화 (3차원 × 가중치)            | Phase 1.1          |
| **Ouroboros**       | Immutable Seed (확정 후 수정 불가)        | Phase 2.2          |
| **Ouroboros**       | 소크라테스 인터뷰 (질문만, 답 제시 안 함) | Phase 1.1          |
| **Oh-My-OpenAgent** | IntentGate (의도 분석 선행)               | Phase 1.0          |
| **Superpowers**     | 스킬 자동 트리거 (mandatory)              | description 트리거 |
| **Superpowers**     | Brainstorming 필수 전제                   | Phase 1 전체       |
