# Search 기능 이슈 분해

## 이슈 목록

검색 기능은 변경 범위가 NoteList 1개 파일이고, 클라이언트 사이드 필터링이므로 2개 수직 슬라이스로 분해한다.

---

### Issue #1: 검색 필터링 핵심 로직 구현

**설명**: NoteList에 검색어 상태와 필터링 로직을 추가한다. 검색어를 입력하면 제목(title)과 본문(content)을 대소문자 무시로 매칭하여 일치하는 노트만 표시한다.

**변경 파일**: `src/components/NoteList.tsx`

**Acceptance Criteria**:

- [ ] Given 노트 3개가 있을 때, When 검색 필드에 "리액트"를 입력하면, Then 제목 또는 본문에 "리액트"가 포함된 노트만 표시된다
- [ ] Given 검색어가 "USESTATE"(대문자)일 때, When 필터링하면, Then "useState"가 포함된 노트도 매칭된다 (case-insensitive)
- [ ] Given 검색어가 공백만일 때, When 필터링하면, Then 전체 노트가 표시된다
- [ ] Given 검색 결과가 0건일 때, When 화면에 표시하면, Then "검색 결과가 없습니다" 메시지가 나타난다
- [ ] Given 검색 중일 때, When 결과 카운트를 보면, Then "검색 결과 N개"로 표시된다
- [ ] Given 검색어가 없을 때, When 카운트를 보면, Then "노트 N개"로 표시된다

**의존성**: 없음

---

### Issue #2: 검색 입력 UI 및 초기화

**설명**: 검색 입력 필드 UI를 구현한다. 돋보기 아이콘, placeholder, 검색어 초기화(X) 버튼을 포함한다. 디자인 시스템의 기존 색상과 둥근 모서리 패턴을 따른다.

**변경 파일**: `src/components/NoteList.tsx`

**Acceptance Criteria**:

- [ ] Given NoteList가 렌더링되면, When 사이드바 상단을 보면, Then 검색 입력 필드와 돋보기 아이콘이 표시된다
- [ ] Given 검색어를 입력한 상태에서, When X 버튼을 클릭하면, Then 검색어가 비워지고 전체 노트 목록으로 복원된다
- [ ] Given 노트가 0개일 때, When NoteList를 보면, Then 검색 입력 필드는 표시되지 않고 "노트가 없습니다" 메시지만 나타난다
- [ ] Given 검색 입력 필드가 표시될 때, When 디자인을 확인하면, Then 기존 디자인 시스템의 색상(foreground, muted-foreground, card, border)과 둥근 모서리(rounded-xl)를 사용한다

**의존성**: Issue #1 (필터링 로직 위에 UI를 얹는 구조)

---

## 구현 순서

```
Issue #1 (필터링 로직) → Issue #2 (검색 UI + 초기화)
```

실제로는 두 이슈 모두 같은 파일(NoteList.tsx)을 수정하므로, 하나의 PR로 묶어서 구현해도 무방하다. 이슈를 분리한 것은 TDD 사이클을 논리적으로 나누기 위함이다:

- Issue #1: 로직 테스트 먼저 (필터링 동작 검증)
- Issue #2: UI 테스트 (렌더링, 클릭 이벤트 검증)
