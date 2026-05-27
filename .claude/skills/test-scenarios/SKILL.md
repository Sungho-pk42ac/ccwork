---
name: test-scenarios
description: "이슈 단위로 함수/컴포넌트 시그니처를 확정하고 테스트 시나리오를 도출한다. /test-scenarios {이슈번호}로 실행. GitHub 이슈 AC 기반으로 정상/경계/예외 시나리오를 분류하여 docs/features/tag/issue-{N}.md에 기록한다. '테스트 시나리오', 'test scenarios', '시그니처 확정', 'AC 검증', '시나리오 도출' 등을 언급하면 이 스킬을 사용한다."
---

# Test Scenarios 스킬

이슈 번호를 입력받아 **시그니처 확정 → 테스트 시나리오 도출**을 순서대로 처리한다.
구현 코드나 테스트 코드는 절대 작성하지 않는다. 이후 TDD 단계에서 이 시나리오를 기반으로 테스트를 작성한다.

## 입력

`$ARGUMENTS` = GitHub 이슈 번호 (예: `3`)

## 실행 순서

아래 7단계를 **순서대로** 진행한다. 각 승인 게이트를 통과하기 전까지 다음 단계로 넘어가지 않는다.

---

### Step 1. 시그니처 확정

다음 3가지 소스를 읽고 해당 이슈에 필요한 시그니처를 도출한다:

1. **GitHub 이슈**: `gh issue view $ARGUMENTS` 로 이슈 설명과 AC를 읽는다
2. **PRD**: `docs/features/tag/prd.md`의 기술 결정 섹션을 참고한다
3. **기존 코드베이스**: 아래 패턴을 따른다

#### 기존 패턴 참조 가이드

| 대상           | 참조 파일                          | 패턴                                                |
| -------------- | ---------------------------------- | --------------------------------------------------- |
| 타입 정의      | `src/types/note.ts`                | `export interface Note { ... }`                     |
| API 함수       | `src/api/notes.ts`                 | `export async function 동사Note(...): Promise<T>`   |
| Context 액션   | `src/context/NotesContext.tsx`     | `interface NotesContextType` 내 메서드 시그니처     |
| 컴포넌트 Props | `src/components/NoteEditor.tsx` 등 | `interface XxxProps { ... }` + named export         |
| 커스텀 훅      | (신규 패턴)                        | `export function useXxx(): { state; actions }`      |
| 순수 유틸      | (신규 패턴)                        | `export function funcName(param: Type): ReturnType` |

#### 도출 항목

이슈 성격에 따라 해당하는 항목만 도출한다:

- **타입/인터페이스 변경**: 변경 전후 diff 형태로 표시
- **함수 시그니처**: 이름, 파라미터 타입, 반환 타입
- **컴포넌트 Props**: interface 정의
- **훅 반환 타입**: `{ state, actions }` 구조
- **에러 케이스**: 어떤 상황에서 에러를 던지거나 무시하는지

**금지 사항**: 함수 body, JSX, 구현 로직은 절대 작성하지 않는다. 시그니처(껍데기)만 정의한다.

---

### Step 2. 시그니처 검토 요청

Step 1에서 도출한 시그니처를 개발자에게 보여주고 AskUserQuestion으로 승인을 받는다.

표시 형식:

```
## 시그니처 확정 — Issue #{N}: {이슈 제목}

### 타입 변경
(해당 시 diff 표시)

### 함수 시그니처
- `functionName(param: Type): ReturnType`

### Props 인터페이스
- `interface XxxProps { ... }`

### 에러 케이스
- 조건 → 동작
```

AskUserQuestion으로 "승인/수정 요청" 중 선택을 받는다.
수정 요청 시 피드백을 반영하여 Step 1부터 다시 진행한다.

---

### Step 3. 시그니처 기록

승인된 시그니처를 `docs/features/tag/issue-{N}.md` 파일 상단에 기록한다.
N은 이슈 문서 내부 번호(issues.md의 #1~#6)이며, $ARGUMENTS의 GitHub 이슈 번호와 매핑한다.

파일이 없으면 새로 생성한다. 형식:

```markdown
# Issue #{N}: {이슈 제목}

## 확정된 시그니처

(Step 2에서 승인된 내용)
```

---

### Step 4. 테스트 시나리오 도출

승인된 시그니처를 기반으로 테스트 시나리오를 도출한다.

#### 분류 기준

| 분류 | 설명                        | 예시                       |
| ---- | --------------------------- | -------------------------- |
| 정상 | 주요 성공 경로 (happy path) | 유효한 입력으로 정상 동작  |
| 경계 | 경계값, 빈 값, 극단적 입력  | 빈 문자열, 공백만, 빈 배열 |
| 예외 | 에러 상황, 실패 케이스      | 네트워크 에러, 잘못된 ID   |

#### 시나리오 형식

```
[분류] 함수명/컴포넌트명 — should 기대동작 when 조건
```

예시:

```
[정상] normalizeTag — should return "react" when input is "  React  "
[경계] normalizeTag — should return "" when input is "   "
[정상] isDuplicateTag — should return true when tag exists with different case
[예외] useTags.addTag — should not add tag when input is empty string
```

#### 도출 원칙

- 각 시그니처(함수, Props, 훅 액션)마다 최소 정상 1개 + 경계 또는 예외 1개
- GitHub Issue의 AC에 명시된 동작은 반드시 시나리오에 포함
- 테스트 코드는 작성하지 않는다 — 시나리오 문장만 나열

---

### Step 5. 시나리오 기록

도출된 시나리오를 `docs/features/tag/issue-{N}.md` 하단에 추가한다.

```markdown
## 테스트 시나리오

### 정상 (Happy Path)

- [정상] funcName — should ... when ...

### 경계 (Boundary)

- [경계] funcName — should ... when ...

### 예외 (Exception)

- [예외] funcName — should ... when ...
```

---

### Step 6. AC 커버리지 검증

GitHub Issue의 AC 항목과 시나리오를 대조한다.

1. `gh issue view $ARGUMENTS`로 AC 목록을 읽는다
2. 각 AC 항목에 대응하는 시나리오가 있는지 확인한다
3. 커버되지 않는 AC가 있으면 시나리오를 추가한다
4. 대조표를 작성한다:

```markdown
## AC 커버리지

| AC      | 시나리오      | 커버 여부 |
| ------- | ------------- | --------- |
| AC 내용 | 대응 시나리오 | O / X     |
```

모든 AC가 최소 1개 이상의 시나리오로 커버되어야 한다.

---

### Step 7. 시나리오 검토 요청

Step 4~6에서 도출한 전체 시나리오와 AC 커버리지 대조표를 개발자에게 보여주고
AskUserQuestion으로 승인을 받는다.

승인 시: `docs/features/tag/issue-{N}.md`에 최종 기록하고 완료를 알린다.
수정 요청 시: 피드백을 반영하여 Step 4부터 다시 진행한다.

**승인 전까지 절대 다음 작업(테스트 코드 작성, 구현 등)으로 넘어가지 않는다.**
