# Search 기능 PRD

## 개요

노트 앱의 사이드바에서 키워드를 입력하면 제목(title)과 본문(content)을 대상으로 실시간 필터링하여 일치하는 노트만 표시하는 기능. 클라이언트 사이드 필터링으로 구현하며, 추가 API 없이 기존 데이터를 활용한다.

## 사용자 스토리

1. 사용자로서, 사이드바 상단의 검색 필드에 키워드를 입력하면 해당 키워드가 제목이나 본문에 포함된 노트만 보고 싶다.
2. 사용자로서, 검색 필드의 X 버튼을 눌러 검색을 초기화하고 전체 목록으로 돌아가고 싶다.
3. 사용자로서, 필터링된 목록에서 노트를 선택하면 정상적으로 편집할 수 있어야 한다.
4. 사용자로서, 검색 중 몇 개의 결과가 있는지 확인하고 싶다.

## 아키텍처 비교 (3안)

### A안: NoteList 로컬 상태

검색 상태를 NoteList 컴포넌트 내부 `useState`로 관리. 필터링도 NoteList 내부 `useMemo`로 수행.

### B안: App 상태 + Props Drilling

검색 상태를 App에서 `useState`로 관리하고, `searchQuery`/`setSearchQuery`를 Layout → NoteList로 전달.

### C안: Context 확장

NotesContext에 `searchQuery`, `setSearchQuery`, `filteredNotes`를 추가. 모든 컴포넌트에서 검색 상태 접근 가능.

### 비교표

| #   | 기준                 | A안 (NoteList 로컬)                                 | B안 (App Props)                                                     | C안 (Context 확장)                                            |
| --- | -------------------- | --------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | 데이터 구조          | 추가 없음. NoteList 내부 string 상태                | App에 string 상태 추가                                              | Context에 string 상태 + getter 추가                           |
| 2   | API 레이어 변경지점  | 없음                                                | 없음                                                                | 없음                                                          |
| 3   | 상태관리 변경지점    | NoteList에 `useState` 1개 추가                      | App에 `useState` 1개, Layout/NoteList Props 확장                    | NotesContext에 상태+함수 추가, Provider value 확장            |
| 4   | 핵심 동작            | `useMemo`로 notes 필터링                            | 동일 (위치만 다름)                                                  | 동일 (Context 내부)                                           |
| 5   | 컴포넌트 구조        | NoteList만 수정                                     | App, Layout, NoteList 수정                                          | NotesContext, NoteList 수정                                   |
| 6   | 기존 패턴과의 일관성 | **높음** — 폼 상태(NoteEditor)와 동일하게 로컬 관리 | 중간 — selectedNoteId처럼 App에서 관리하지만, 검색은 UI 상태라 과잉 | 낮음 — Context는 도메인 상태용인데 UI 필터를 넣으면 역할 혼재 |
| 7   | 테스트 용이성        | **높음** — NoteList만 렌더링하면 검색 테스트 가능   | 중간 — App 또는 Layout까지 렌더링 필요                              | 낮음 — Provider 래핑 + Context 모킹 복잡                      |

## 기술 결정

### 검색 상태 관리 방식: NoteList 로컬 상태 (A안)

**Context** — 검색어는 사이드바의 노트 필터링에만 사용되는 순수 UI 상태다. 현재 코드베이스에서 UI 상태(폼의 title, content)는 해당 컴포넌트 내부에서 로컬로 관리하는 패턴을 따르고 있다. 검색어도 동일한 성격이므로 같은 패턴을 적용해야 한다.

**Decision** — `searchQuery` 상태를 NoteList 내부 `useState`로 관리하고, `useMemo`로 notes를 필터링한다. 검색 입력 UI도 NoteList 내부에 직접 렌더링한다.

**Alternatives**

- B안 (App Props Drilling): 거부 — 검색어는 NoteList 밖에서 사용할 곳이 없다. App까지 끌어올리면 Layout Props까지 확장해야 하고, 불필요한 리렌더링 범위가 넓어진다.
- C안 (Context 확장): 거부 — NotesContext는 도메인 상태(notes, CRUD 액션) 전용이다. UI 필터 상태를 넣으면 도메인/UI 경계가 무너지고, 향후 상태 관리가 복잡해진다.

**Consequences**

- 장점: 변경 범위가 NoteList 1개 파일로 최소화. 기존 패턴과 일관성 유지. 테스트가 단순.
- 단점: 향후 다른 컴포넌트(예: 헤더)에서 검색어에 접근해야 하면 상태를 끌어올려야 한다. 현재 요구사항에서는 해당되지 않으므로 수용.

## Out of Scope

- 서버 사이드 검색 (full-text search API)
- 검색 히스토리 저장
- 정규식 검색
- 검색어 하이라이팅 (결과에서 매칭 부분 강조)
- 디바운스 처리 (로컬 필터링이므로 불필요)
- 태그 대상 검색 (태그 기능 미구현)
- 키보드 단축키 (Ctrl+K 등)

## 용어 정의

spec-fixed.md와 동기화:

| 용어                     | 정의                                                      |
| ------------------------ | --------------------------------------------------------- |
| 검색어(query)            | 사용자가 검색 입력 필드에 입력한 텍스트                   |
| 필터링(filtering)        | 검색어와 일치하는 노트만 목록에 표시하는 동작             |
| 검색 대상(search target) | 검색어가 비교되는 노트 필드 — 제목(title)과 본문(content) |
