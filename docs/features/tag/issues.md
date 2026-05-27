# 태그 기능 이슈 목록

> 수직 슬라이싱 원칙: 각 이슈는 데이터 → 로직 → UI를 관통하며, 단독으로 동작 검증이 가능하다.

> **파일 참조**: `issue-{GH번호}.md` — 내부#1=GH#3, #2=GH#4, #3=GH#5, #4=GH#6, #5=GH#7, #6=GH#8

## 의존 관계

```
#1 데이터 모델
 ├── #2 태그 유틸 (normalizeTag, isDuplicateTag)
 │    └── #3 useTags 훅
 │         └── #4 태그 입력 UI (TagInput + NoteEditor 통합)
 │              └── #5 태그 저장 (NoteEditor handleSave 확장)
 └── #6 태그 목록 표시 (NoteItem)
```

---

## #1. Note 타입에 tags 필드 추가 및 하위 호환 처리

**설명**

`Note` 인터페이스에 `tags: string[]` 필드를 추가하고, db.json 기존 데이터에 `tags: []`를 부여한다. tags 필드가 없는 데이터가 유입되더라도 앱이 정상 동작하도록 폴백 처리한다.

**완료 조건 (AC)**

- [ ] `Note` 인터페이스에 `tags: string[]` 필드가 존재한다
- [ ] db.json의 모든 기존 노트에 `tags: []`가 추가되어 있다
- [ ] tags 필드가 없는 노트 객체를 읽어도 런타임 에러가 발생하지 않는다
- [ ] 기존 테스트가 깨지지 않는다

**시나리오**

```gherkin
Given db.json에 tags 필드가 없는 기존 노트가 존재할 때
When 앱이 해당 노트를 fetch하면
Then note.tags ?? []로 빈 배열이 반환되고 UI 렌더링에 오류가 없다
```

```gherkin
Given Note 타입에 tags 필드가 추가된 후
When 새 노트를 생성하면
Then tags 필드가 빈 배열로 초기화되어 저장된다
```

```gherkin
Given tags: ["react"]인 기존 노트가 존재할 때
When 해당 노트에 "vue" 태그를 추가하여 저장하면
Then tags는 ["react", "vue"]가 되고 기존 태그가 유실되지 않는다
```

---

## #2. 태그 정규화 및 유효성 검증 유틸 구현

**설명**

`src/utils/tagUtils.ts`에 태그 정규화(`normalizeTag`)와 중복 판별(`isDuplicateTag`) 순수 함수를 구현한다. 이 함수들은 UI와 독립적으로 동작하며 단위 테스트로 검증한다.

**완료 조건 (AC)**

- [ ] `normalizeTag(raw)`: 앞뒤 공백 trim + 소문자 변환 결과를 반환한다
- [ ] `normalizeTag("")` 또는 공백만 입력 시 빈 문자열을 반환한다
- [ ] `isDuplicateTag(tag, existingTags)`: 대소문자 무시하고 중복 여부를 반환한다
- [ ] 모든 함수에 대한 단위 테스트가 통과한다

**시나리오**

```gherkin
Given normalizeTag 함수가 존재할 때
When "  React  "를 입력하면
Then "react"가 반환된다
```

```gherkin
Given normalizeTag 함수가 존재할 때
When "   "을 입력하면
Then ""(빈 문자열)가 반환된다
```

```gherkin
Given 기존 태그 목록에 ["react", "typescript"]가 있을 때
When isDuplicateTag("React", existingTags)를 호출하면
Then true가 반환된다
```

```gherkin
Given 기존 태그 목록에 ["react"]가 있을 때
When isDuplicateTag("vue", existingTags)를 호출하면
Then false가 반환된다
```

---

## #3. useTags 커스텀 훅 구현

**설명**

`src/hooks/useTags.ts`에 태그 상태 관리 훅을 구현한다. 내부적으로 `tagUtils`를 사용하여 정규화와 중복 체크를 수행하고, `addTag`, `removeTag`, `resetTags` 액션을 제공한다.

**완료 조건 (AC)**

- [ ] `addTag(raw)`: 정규화 후 유효하면 tags 배열에 추가, 빈 문자열이면 무시
- [ ] `addTag(raw)`: 중복 태그는 추가하지 않는다
- [ ] `removeTag(tag)`: 해당 태그를 배열에서 제거한다
- [ ] `resetTags(next)`: 외부에서 전달된 태그 배열로 state를 교체한다
- [ ] 태그 입력 순서가 유지된다
- [ ] renderHook 기반 단위 테스트가 통과한다

**시나리오**

```gherkin
Given useTags 훅이 빈 배열로 초기화되었을 때
When addTag("React")를 호출하면
Then tags는 ["react"]가 된다
```

```gherkin
Given tags가 ["react"]인 상태에서
When addTag("React")를 호출하면
Then tags는 여전히 ["react"]이다 (중복 무시)
```

```gherkin
Given tags가 ["react", "vue"]인 상태에서
When removeTag("react")를 호출하면
Then tags는 ["vue"]가 된다
```

```gherkin
Given tags가 ["old"]인 상태에서
When resetTags(["new1", "new2"])를 호출하면
Then tags는 ["new1", "new2"]로 교체된다
```

---

## #4. TagInput 컴포넌트 구현 및 NoteEditor 통합

**설명**

`src/components/TagInput.tsx` 프레젠테이션 컴포넌트를 구현한다. 텍스트 입력 + Enter/쉼표로 태그를 추가하고, 칩 형태로 나열하며, X 버튼으로 개별 삭제할 수 있다. NoteEditor의 textarea 아래, 버튼 영역 위에 배치한다.

**완료 조건 (AC)**

- [ ] 입력 필드에 텍스트 입력 후 Enter 키로 태그가 추가된다
- [ ] 입력 필드에 쉼표(`,`) 입력 시 태그가 추가된다
- [ ] 추가된 태그는 칩 형태로 나열된다
- [ ] 각 칩에 X 버튼이 있고, 클릭 시 해당 태그가 삭제된다
- [ ] 태그 추가 후 입력 필드가 비워진다
- [ ] NoteEditor에서 노트 선택 변경 시 해당 노트의 태그가 로드된다
- [ ] 새 노트 생성 모드에서는 태그가 빈 상태로 시작한다

**시나리오**

```gherkin
Given NoteEditor에서 기존 노트를 편집 중일 때
When 태그 입력 필드에 "javascript"를 입력하고 Enter를 누르면
Then "javascript" 칩이 나타나고 입력 필드가 비워진다
```

```gherkin
Given 태그 입력 필드에 "react, vue"를 입력할 때
When 쉼표가 입력되면
Then "react" 칩이 추가되고 입력 필드에 " vue"가 남는다
```

```gherkin
Given "react" 칩이 표시된 상태에서
When 해당 칩의 X 버튼을 클릭하면
Then "react" 칩이 사라진다
```

```gherkin
Given 노트 A(tags: ["react"])를 편집 중일 때
When 노트 B(tags: ["vue", "typescript"])를 선택하면
Then 태그 영역이 "vue", "typescript" 칩으로 교체된다
```

```gherkin
Given 아무 노트도 선택하지 않은 상태에서
When "새 노트" 버튼을 클릭하면
Then 태그 영역이 비어 있다
```

---

## #5. 태그를 포함한 노트 저장

**설명**

NoteEditor의 저장 흐름에 tags 배열을 포함시킨다. 새 노트 생성 시 `createNote`에, 기존 노트 수정 시 `updateNote`에 tags를 함께 전송한다. 태그만 별도 즉시 저장하지 않으며, 기존 저장 버튼 클릭 시 title/content/tags가 일괄 저장된다.

**완료 조건 (AC)**

- [ ] 새 노트 생성 시 입력한 태그가 함께 저장된다
- [ ] 기존 노트 수정 시 변경된 태그가 함께 저장된다
- [ ] 저장 후 다시 해당 노트를 선택하면 저장된 태그가 표시된다
- [ ] API 요청 body에 `tags` 배열이 포함된다
- [ ] 태그 없이 저장해도 `tags: []`로 정상 저장된다

**시나리오**

```gherkin
Given 새 노트에 제목 "학습 노트", 태그 ["react", "hooks"]를 입력한 후
When 저장 버튼을 클릭하면
Then API에 { title: "학습 노트", content: "...", tags: ["react", "hooks"] }가 전송되고
And 노트 목록에 해당 노트가 추가된다
```

```gherkin
Given 기존 노트(tags: ["react"])를 열고 "vue" 태그를 추가한 후
When 저장 버튼을 클릭하면
Then API에 { tags: ["react", "vue"], ... }가 전송되고
And 다시 해당 노트를 선택하면 ["react", "vue"] 칩이 표시된다
```

```gherkin
Given 태그를 입력하지 않은 새 노트에서
When 저장 버튼을 클릭하면
Then API에 { tags: [], ... }가 전송되고 정상 저장된다
```

---

## #6. NoteItem에 태그 칩 읽기 전용 표시

**설명**

노트 목록의 NoteItem 컴포넌트에 해당 노트의 태그를 칩 형태로 읽기 전용 표시한다. 태그가 없는 노트는 태그 영역을 렌더링하지 않는다.

**완료 조건 (AC)**

- [ ] NoteItem에 태그가 칩 형태로 표시된다
- [ ] 칩은 읽기 전용이다 (X 버튼 없음, 클릭 이벤트 없음)
- [ ] 태그가 없는 노트는 태그 영역이 렌더링되지 않는다
- [ ] 태그가 있는 노트와 없는 노트가 혼재해도 레이아웃이 깨지지 않는다

**시나리오**

```gherkin
Given tags: ["react", "hooks"]인 노트가 목록에 있을 때
When NoteList를 렌더링하면
Then 해당 NoteItem에 "react", "hooks" 칩이 읽기 전용으로 표시된다
```

```gherkin
Given tags: []인 노트가 목록에 있을 때
When NoteList를 렌더링하면
Then 해당 NoteItem에 태그 영역이 표시되지 않는다
```

```gherkin
Given 태그가 있는 노트와 없는 노트가 섞여 있을 때
When NoteList를 렌더링하면
Then 각 NoteItem의 높이가 태그 유무에 따라 자연스럽게 조절되고 레이아웃이 깨지지 않는다
```
