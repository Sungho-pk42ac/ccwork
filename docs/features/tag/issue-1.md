# Issue #1: Note 타입에 tags 필드 추가 및 하위 호환 처리

> GitHub Issue: #3

## 확정된 시그니처

### 타입 변경

```diff
// src/types/note.ts
 export interface Note {
   id: string;
   title: string;
   content: string;
+  tags: string[];
   createdAt: string;
   updatedAt: string;
 }
```

### 함수 시그니처

#### src/api/notes.ts — 시그니처 변경 없음

- `createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>`
  - `Omit` 결과에 `tags`가 자동 포함됨. 호출부에서 `tags`를 전달해야 한다.
- `fetchNotes(): Promise<Note[]>` — 변경 없음

#### src/context/NotesContext.tsx — 시그니처 변경 없음

- `createNote(title: string, content: string): Promise<void>`
  - 이 이슈에서는 유지. 내부에서 `api.createNote({ title, content, tags: [] })` 로 빈 배열 전달.
- `fetchNotes` 후처리에서 폴백: `note.tags ?? []`

### 폴백 처리 패턴

- **위치**: `NotesProvider` 내부 `fetchNotes` 결과 처리부
- **패턴**: `note.tags ?? []` — nullish coalescing 인라인 사용
- 별도 유틸 함수 없음

### 에러 케이스

- `tags` 필드가 `undefined`인 노트 → `?? []`로 빈 배열 폴백 (에러 안 던짐)
- `tags` 필드가 `null`인 노트 → `?? []`로 빈 배열 폴백 (에러 안 던짐)
- db.json에 tags 필드 누락된 레코드 → fetch 시 폴백 적용

---

## 테스트 시나리오

### 정상 (Happy Path)

- [x] [정상] Note 인터페이스 — should have `tags` field of type `string[]` when interface is defined
- [x] [정상] fetchNotes 폴백 — should return notes with `tags` as empty array when db note has `tags: []`
- [x] [정상] createNote — should include `tags: []` in request body when creating a new note
- [x] [정상] db.json — should have `tags: []` on all existing notes when data migration is applied

### 경계 (Boundary)

- [x] [경계] fetchNotes 폴백 — should fallback to empty array when note.tags is `undefined`
- [x] [경계] fetchNotes 폴백 — should fallback to empty array when note.tags is `null`
- [x] [경계] fetchNotes 폴백 — should preserve existing tags when note has `tags: ["react"]`
- [x] [경계] createNote — should send `tags: []` when tags parameter is an empty array

### 예외 (Exception)

- [x] [예외] fetchNotes — should not throw runtime error when iterating over notes without tags field
- [x] [예외] 기존 테스트 — should pass all existing test suites without modification after Note type change

---

## AC 커버리지

| AC                                                                | 시나리오                                                                                   | 커버 여부 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------- |
| `Note` 인터페이스에 `tags: string[]` 필드가 존재한다              | [정상] Note 인터페이스 — should have tags field of type string[]                           | O         |
| db.json의 모든 기존 노트에 `tags: []`가 추가되어 있다             | [정상] db.json — should have tags: [] on all existing notes when data migration is applied | O         |
| tags 필드가 없는 노트 객체를 읽어도 런타임 에러가 발생하지 않는다 | [경계] fetchNotes 폴백 undefined/null + [예외] fetchNotes should not throw runtime error   | O         |
| 기존 테스트가 깨지지 않는다                                       | [예외] 기존 테스트 — should pass all existing test suites without modification             | O         |
