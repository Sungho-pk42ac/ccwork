# Issue #7: 태그를 포함한 노트 저장

## 확정된 시그니처

### 1. NotesContext.createNote 시그니처 변경

```typescript
// src/context/NotesContext.tsx
// Before: createNote(title: string, content: string) => Promise<void>
// After:
createNote: (title: string, content: string, tags?: string[]) => Promise<void>;
```

- `tags` 매개변수를 선택적으로 추가하여 기존 호출부 하위 호환 유지
- 미전달 시 `tags: []`로 폴백

### 2. NotesContextType 인터페이스 변경

```typescript
// src/context/NotesContext.tsx
interface NotesContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (title: string, content: string, tags?: string[]) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}
```

### 3. NoteEditor.handleSave 변경

```typescript
// src/components/NoteEditor.tsx
const handleSave = async () => {
  // ...validation...
  if (isCreating) {
    await createNote(title, content, tags); // tags 추가
  } else if (selectedNoteId) {
    await updateNote(selectedNoteId, { title, content, tags }); // tags 추가
  }
  // ...
};
```

### 변경 불필요한 시그니처

- `api.createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>)` — Note에 tags가 이미 포함되어 있으므로 변경 불필요. Context에서 `{ title, content, tags }` 객체를 전달하면 됨.
- `api.updateNote(id: string, updates: Partial<Note>)` — `Partial<Note>`에 tags가 이미 포함. 변경 불필요.
- `useTags` 훅 — 이미 issue #3에서 구현 완료. 변경 불필요.

## 테스트 시나리오

### 정상 (Happy Path)

- [ ] [정상] NoteEditor — 새 노트 생성 시 입력한 태그가 createNote에 전달된다
  - Given: isCreating=true, 제목 "학습 노트", 태그 ["react", "hooks"]
  - When: 저장 버튼 클릭
  - Then: createNote("학습 노트", "", ["react", "hooks"])가 호출됨

- [ ] [정상] NoteEditor — 기존 노트 수정 시 변경된 태그가 updateNote에 전달된다
  - Given: selectedNoteId="1", 기존 노트(tags: ["react"]), 사용자가 "vue" 태그 추가
  - When: 저장 버튼 클릭
  - Then: updateNote("1", { title, content, tags: ["react", "vue"] })가 호출됨

- [ ] [정상] NoteEditor — 저장 후 다시 노트를 선택하면 저장된 태그가 표시된다
  - Given: 태그 ["react", "hooks"]로 노트 저장 완료
  - When: 해당 노트를 다시 선택
  - Then: TagInput에 ["react", "hooks"] 칩이 렌더링됨

- [ ] [정상] NotesContext.createNote — tags 매개변수가 API 요청 body에 포함된다
  - Given: createNote("제목", "내용", ["react"])
  - When: API 호출 실행
  - Then: api.createNote({ title: "제목", content: "내용", tags: ["react"] })가 호출됨

- [ ] [정상] NotesContext.createNote — 생성된 노트가 로컬 state에 추가된다
  - Given: createNote("제목", "내용", ["react"])
  - When: API 호출 성공
  - Then: notes 배열에 tags: ["react"]가 포함된 노트가 추가됨

- [ ] [정상] NotesContext.updateNote — tags가 포함된 updates가 API에 전달된다
  - Given: updateNote("1", { title: "제목", content: "내용", tags: ["react", "vue"] })
  - When: API 호출 실행
  - Then: api.updateNote("1", { title, content, tags: ["react", "vue"] })가 호출됨

### 경계 (Boundary)

- [ ] [경계] NoteEditor — 태그 없이 새 노트 저장 시 tags: []로 전달된다
  - Given: isCreating=true, 제목 "빈 태그 노트", 태그 입력 없음
  - When: 저장 버튼 클릭
  - Then: createNote("빈 태그 노트", "", [])가 호출됨

- [ ] [경계] NotesContext.createNote — tags 미전달 시 빈 배열로 폴백한다
  - Given: createNote("제목", "내용") (tags 생략)
  - When: API 호출 실행
  - Then: api.createNote({ title: "제목", content: "내용", tags: [] })가 호출됨

- [ ] [경계] NoteEditor — 기존 노트의 태그를 모두 삭제 후 저장하면 tags: []로 전달된다
  - Given: selectedNoteId="1", 기존 노트(tags: ["react"]), 사용자가 "react" 태그 삭제
  - When: 저장 버튼 클릭
  - Then: updateNote("1", { title, content, tags: [] })가 호출됨

- [ ] [경계] NoteEditor — tags 필드가 없는 기존 노트를 열면 빈 태그로 표시된다
  - Given: notes에 tags 필드가 undefined인 노트 존재
  - When: 해당 노트 선택
  - Then: resetTags([])가 호출되어 태그 영역이 비어있음

### 예외 (Exception)

- [ ] [예외] NoteEditor — 저장 중 API 에러 발생 시 태그 상태가 유지된다
  - Given: 태그 ["react", "hooks"] 입력, createNote가 에러를 throw
  - When: 저장 버튼 클릭
  - Then: console.error가 호출되고, 태그 ["react", "hooks"]가 그대로 표시됨

- [ ] [예외] NoteEditor — 제목이 비어있으면 저장되지 않는다 (태그 있어도)
  - Given: 제목 비어있음, 태그 ["react"] 입력
  - When: 저장 버튼 클릭
  - Then: createNote/updateNote가 호출되지 않음
