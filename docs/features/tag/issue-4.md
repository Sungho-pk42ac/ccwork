# Issue #2: 태그 정규화 및 유효성 검증 유틸 구현

> GitHub Issue: #4
> 파일: `src/utils/tagUtils.ts` (신규)
> 의존성: #1 (Note 타입에 tags 필드 추가)

## 확정된 시그니처

### 함수 시그니처

```ts
export function normalizeTag(raw: string): string;
```

- 앞뒤 공백 trim + 소문자 변환
- 빈 문자열/공백만 입력 시 빈 문자열 반환

```ts
export function isDuplicateTag(tag: string, existingTags: string[]): boolean;
```

- 대소문자 무시하고 중복 여부 판별

### 에러 케이스

- `normalizeTag`는 에러를 던지지 않는다. 모든 입력에 문자열 반환.
- `isDuplicateTag`는 에러를 던지지 않는다. 모든 입력에 boolean 반환.

---

## 테스트 시나리오

### 정상 (Happy Path)

- [x] [정상] normalizeTag — should return "react" when input is "React"
- [x] [정상] normalizeTag — should return "react" when input is " React "
- [x] [정상] normalizeTag — should return "typescript" when input is "TypeScript"
- [x] [정상] isDuplicateTag — should return true when tag "React" exists as "react" in existingTags
- [x] [정상] isDuplicateTag — should return true when tag "react" exactly matches in existingTags
- [x] [정상] isDuplicateTag — should return false when tag "vue" does not exist in ["react", "typescript"]

### 경계 (Boundary)

- [x] [경계] normalizeTag — should return "" when input is ""
- [x] [경계] normalizeTag — should return "" when input is " " (whitespace only)
- [x] [경계] normalizeTag — should return "a" when input is " a " (single character with spaces)
- [x] [경계] isDuplicateTag — should return false when existingTags is empty array
- [x] [경계] isDuplicateTag — should return false when tag is "" and existingTags is ["react"]

### 예외 (Exception)

- [x] [예외] normalizeTag — should return "" when input contains only tabs and newlines "\t\n"
- [x] [예외] isDuplicateTag — should return false when tag is " " (whitespace only) and existingTags is ["react"]

---

## AC 커버리지

| AC                                                           | 시나리오                                                       | 커버 여부 |
| ------------------------------------------------------------ | -------------------------------------------------------------- | --------- |
| `normalizeTag(raw)`: 앞뒤 공백 trim + 소문자 변환            | [정상] "React" → "react", " React " → "react"                  | O         |
| `normalizeTag("")` 또는 공백만 입력 시 빈 문자열 반환        | [경계] "" → "", " " → ""                                       | O         |
| `isDuplicateTag(tag, existingTags)`: 대소문자 무시 중복 판별 | [정상] "React" vs ["react"] → true, "vue" vs ["react"] → false | O         |
| 모든 함수에 대한 단위 테스트가 통과한다                      | 위 전체 시나리오가 테스트로 전환                               | O         |
