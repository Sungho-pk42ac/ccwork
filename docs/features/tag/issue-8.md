# Issue #8: NoteItem에 태그 칩 읽기 전용 표시

## 확정된 시그니처

### 1. NoteItem 컴포넌트 (변경 불필요 — 이미 구현됨)

```typescript
// src/components/NoteItem.tsx
interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NoteItem({ note, isSelected, onSelect, onDelete }: NoteItemProps): JSX.Element;
```

- Props 변경 없음. `Note.tags: string[]`가 이미 타입에 포함되어 있으므로 `note.tags`로 접근
- 태그 칩 렌더링 로직이 issue #7 작업에서 이미 구현됨 (line 37-48)

### 2. 태그 칩 렌더링 조건 (기존 구현)

```typescript
// src/components/NoteItem.tsx (line 37-48)
// 태그가 있을 때만 태그 영역을 렌더링
{note.tags && note.tags.length > 0 && (
  <div className="flex flex-wrap gap-[0.35rem] mt-2">
    {note.tags.map((tag) => (
      <span
        key={tag}
        className="note-label inline-flex items-center bg-[#dbe4e7] text-[#586064] rounded-full px-[0.5rem] py-[0.1rem] text-[0.65rem]"
      >
        <span>{tag}</span>
      </span>
    ))}
  </div>
)}
```

- 읽기 전용: X 버튼 없음, onClick 이벤트 없음
- 조건부 렌더링: `note.tags && note.tags.length > 0`으로 빈 배열/undefined 시 미렌더링

### 변경 불필요한 시그니처

- `NoteItemProps` — `Note` 타입에 `tags: string[]`이 이미 포함되어 있으므로 별도 props 추가 불필요
- `Note` 인터페이스 — issue #3에서 `tags: string[]` 필드 추가 완료
- `NoteList` — NoteItem에 `note` prop을 그대로 전달하므로 변경 불필요

## 테스트 시나리오

### 정상 (Happy Path)

- [ ] [정상] NoteItem — 태그가 있는 노트에 태그 칩이 표시된다
  - Given: note.tags = ["react", "hooks"]
  - When: NoteItem을 렌더링
  - Then: "react", "hooks" 텍스트가 각각 칩으로 표시됨

- [ ] [정상] NoteItem — 태그 칩은 읽기 전용이다 (X 버튼 없음)
  - Given: note.tags = ["react"]
  - When: NoteItem을 렌더링
  - Then: 태그 칩 내부에 삭제 버튼(X, ×, 삭제 등)이 존재하지 않음

- [ ] [정상] NoteItem — 태그 칩에 클릭 이벤트가 없다
  - Given: note.tags = ["react"]
  - When: 태그 칩을 클릭
  - Then: 칩 자체에 onClick 핸들러가 없으며 이벤트가 NoteItem의 onSelect로 버블링됨

- [ ] [정상] NoteItem — 여러 개의 태그가 모두 표시된다
  - Given: note.tags = ["react", "hooks", "typescript"]
  - When: NoteItem을 렌더링
  - Then: 3개의 태그 칩이 모두 표시됨

- [ ] [정상] NoteItem — 태그 칩이 제목, 내용 미리보기, 날짜와 함께 올바른 순서로 표시된다
  - Given: note = { title: "학습", content: "내용", tags: ["react"], updatedAt: "2026-01-01" }
  - When: NoteItem을 렌더링
  - Then: 제목 → 내용 → 태그 칩 → 날짜 순서로 렌더링됨

### 경계 (Boundary)

- [ ] [경계] NoteItem — 태그가 빈 배열이면 태그 영역이 렌더링되지 않는다
  - Given: note.tags = []
  - When: NoteItem을 렌더링
  - Then: 태그 칩 컨테이너(flex-wrap div)가 DOM에 존재하지 않음

- [ ] [경계] NoteItem — tags가 undefined이면 태그 영역이 렌더링되지 않는다
  - Given: note.tags = undefined (기존 노트 폴백 케이스)
  - When: NoteItem을 렌더링
  - Then: 태그 칩 컨테이너가 DOM에 존재하지 않고 에러 없음

- [ ] [경계] NoteItem — 태그가 1개만 있어도 정상 표시된다
  - Given: note.tags = ["react"]
  - When: NoteItem을 렌더링
  - Then: 1개의 태그 칩이 표시됨

- [ ] [경계] NoteItem — 태그가 있는 노트와 없는 노트가 혼재해도 레이아웃이 깨지지 않는다
  - Given: notes = [{ tags: ["react", "hooks"] }, { tags: [] }, { tags: ["vue"] }]
  - When: NoteList를 렌더링
  - Then: 각 NoteItem이 독립적으로 렌더링되고 레이아웃이 유지됨

- [ ] [경계] NoteItem — 긴 태그 텍스트가 칩 내에서 표시된다
  - Given: note.tags = ["very-long-tag-name-example"]
  - When: NoteItem을 렌더링
  - Then: 태그 텍스트가 칩 내에 표시되고 레이아웃이 깨지지 않음

### 예외 (Exception)

- [ ] [예외] NoteItem — note.tags가 null이어도 에러 없이 렌더링된다
  - Given: note.tags = null (비정상 데이터)
  - When: NoteItem을 렌더링
  - Then: 태그 영역이 표시되지 않고 에러가 발생하지 않음 (falsy 가드로 처리)

- [ ] [예외] NoteItem — 중복 태그가 있는 배열이 전달되어도 각각 렌더링된다
  - Given: note.tags = ["react", "react"] (정규화 미적용 데이터)
  - When: NoteItem을 렌더링
  - Then: React key 경고가 발생할 수 있으나 렌더링 자체는 정상 (NoteItem은 표시 책임만)
