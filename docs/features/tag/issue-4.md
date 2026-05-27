# Issue #4: TagInput 컴포넌트 구현 및 NoteEditor 통합

## 확정된 시그니처

### Props 인터페이스

```typescript
// src/components/TagInput.tsx
interface TagInputProps {
  tags: string[];
  onAddTag: (raw: string) => void;
  onRemoveTag: (tag: string) => void;
}
```

### 컴포넌트

```typescript
// src/components/TagInput.tsx
export function TagInput({ tags, onAddTag, onRemoveTag }: TagInputProps): JSX.Element;
```

### NoteEditor 통합

- `useTags` 훅을 사용하여 태그 상태 관리
- `useEffect`에서 노트 선택 변경 시 `resetTags(selectedNote.tags ?? [])` 호출
- `isCreating` 모드에서 `resetTags([])` 호출
- `handleSave`에서 `createNote`/`updateNote`에 tags 전달
- TagInput을 textarea 아래, 버튼 영역 위에 배치

### 에러 케이스

- 빈 문자열/공백만 입력 → onAddTag가 호출되나 useTags가 무시
- 중복 태그 입력 → onAddTag가 호출되나 useTags가 무시

## 테스트 시나리오

### 정상 (Happy Path)

- [x] [정상] TagInput — should render tag chips when tags prop is provided
- [x] [정상] TagInput — should call onAddTag when Enter key is pressed with input value
- [x] [정상] TagInput — should call onAddTag when comma is typed and clear input after comma
- [x] [정상] TagInput — should call onRemoveTag when chip X button is clicked
- [x] [정상] TagInput — should clear input field after Enter key adds a tag
- [x] [정상] NoteEditor — should render TagInput component with useTags integration
- [x] [정상] NoteEditor — should reset tags when selected note changes
- [x] [정상] NoteEditor — should start with empty tags when in creating mode

### 경계 (Boundary)

- [x] [경계] TagInput — should not call onAddTag when Enter is pressed with empty input
- [x] [경계] TagInput — should not call onAddTag when Enter is pressed with whitespace-only input
- [x] [경계] TagInput — should render no chip area when tags array is empty

### 예외 (Exception)

- [x] [예외] TagInput — should not submit form when Enter is pressed in tag input

## AC 커버리지

| AC                          | 시나리오                                              | 커버 |
| --------------------------- | ----------------------------------------------------- | ---- |
| Enter 키로 태그 추가        | should call onAddTag when Enter key is pressed        | O    |
| 쉼표 입력 시 태그 추가      | should call onAddTag when comma is typed              | O    |
| 칩 형태로 나열              | should render tag chips when tags prop is provided    | O    |
| X 버튼 클릭 시 삭제         | should call onRemoveTag when chip X button is clicked | O    |
| 태그 추가 후 입력 필드 비움 | should clear input field after Enter key adds a tag   | O    |
| 노트 선택 변경 시 태그 로드 | should reset tags when selected note changes          | O    |
| 새 노트 생성 시 빈 태그     | should start with empty tags when in creating mode    | O    |
