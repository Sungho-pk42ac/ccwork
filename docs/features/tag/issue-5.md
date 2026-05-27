# Issue #3: useTags 커스텀 훅 구현

> GitHub Issue: #5
> 파일: `src/hooks/useTags.ts` (신규)
> 의존성: #2 (태그 유틸)

## 확정된 시그니처

### 훅 시그니처

```ts
interface UseTagsReturn {
  tags: string[];
  addTag: (raw: string) => void;
  removeTag: (tag: string) => void;
  resetTags: (next: string[]) => void;
}

export function useTags(initialTags?: string[]): UseTagsReturn;
```

### 에러 케이스

- `addTag("")` / `addTag("   ")` → 빈 문자열로 정규화되므로 무시
- `addTag("React")` (이미 "react" 존재) → 중복으로 무시
- `removeTag("nonexistent")` → 배열 변경 없음 (에러 안 던짐)

---

## 테스트 시나리오

### 정상 (Happy Path)

- [x] [정상] useTags — should initialize with empty array when no initialTags provided
- [x] [정상] useTags — should initialize with given tags when initialTags is provided
- [x] [정상] useTags.addTag — should add normalized tag "react" when input is "React"
- [x] [정상] useTags.addTag — should add multiple tags in insertion order when called sequentially
- [x] [정상] useTags.removeTag — should remove "react" from tags when tags is ["react", "vue"]
- [x] [정상] useTags.resetTags — should replace tags with ["new1", "new2"] when called with that array
- [x] [정상] useTags.resetTags — should replace tags with empty array when called with []

### 경계 (Boundary)

- [x] [경계] useTags.addTag — should not add tag when input is empty string ""
- [x] [경계] useTags.addTag — should not add tag when input is whitespace only " "
- [x] [경계] useTags.addTag — should not add duplicate when "React" is added and "react" already exists
- [x] [경계] useTags.addTag — should not add duplicate when same tag is added twice consecutively
- [x] [경계] useTags.removeTag — should not change tags when removing a tag that does not exist

### 예외 (Exception)

- [x] [예외] useTags.addTag — should not modify tags array when normalizeTag returns empty string
- [x] [예외] useTags.addTag — should not modify tags array when isDuplicateTag returns true

---

## AC 커버리지

| AC                                                  | 시나리오                                        | 커버 여부 |
| --------------------------------------------------- | ----------------------------------------------- | --------- |
| addTag: 정규화 후 유효하면 추가, 빈 문자열이면 무시 | [정상] addTag "React" + [경계] addTag "" / " "  | O         |
| addTag: 중복 태그는 추가하지 않는다                 | [경계] "React" vs "react" 중복 + 연속 중복      | O         |
| removeTag: 해당 태그를 배열에서 제거                | [정상] removeTag "react"                        | O         |
| resetTags: 외부 배열로 state 교체                   | [정상] resetTags ["new1","new2"] + resetTags [] | O         |
| 태그 입력 순서가 유지된다                           | [정상] addTag 순서대로 추가                     | O         |
| renderHook 기반 단위 테스트 통과                    | 모든 시나리오가 renderHook 기반                 | O         |
