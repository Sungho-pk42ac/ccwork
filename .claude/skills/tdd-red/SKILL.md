---
name: tdd-red
description: "승인된 테스트 시나리오(issue-{N}.md)를 실패하는 테스트 코드로 작성한다. TDD Red 단계 전용. /tdd-red {이슈번호}로 실행. 'TDD red', '실패 테스트 작성', 'red 단계', '테스트 먼저 작성', 'failing test', 'test first' 등을 언급하면 이 스킬을 사용한다."
---

# TDD Red 스킬

승인된 테스트 시나리오를 **실패하는 테스트 코드**로 변환한다.
구현 코드는 절대 건드리지 않는다 — 오직 테스트 파일만 생성한다.

## 입력

`$ARGUMENTS` = GitHub 이슈 번호 (예: `6`)

## 왜 Red 단계가 중요한가

TDD에서 Red는 "아직 구현이 없으니 테스트가 실패해야 한다"를 증명하는 단계다.
테스트가 실패하지 않으면 테스트가 아무것도 검증하지 않는 것이므로,
모든 테스트는 작성 직후 **반드시 실패**해야 한다.

## 실행 순서

### Step 1. 시나리오 & 시그니처 읽기

`docs/features/tag/issue-{$ARGUMENTS}.md`를 읽어서:

- **확정된 시그니처** 섹션에서 함수/타입/Props 정의를 파악한다
- **테스트 시나리오** 섹션에서 정상/경계/예외 시나리오 목록을 가져온다

### Step 2. 테스트 파일 생성

시나리오를 테스트 코드로 변환한다.

#### 테스트 파일 위치 규칙

테스트 파일은 테스트 대상과 **같은 디렉토리**에 배치한다:

| 대상 파일                      | 테스트 파일                         |
| ------------------------------ | ----------------------------------- |
| `src/types/note.ts`            | `src/types/note.test.ts`            |
| `src/utils/tagUtils.ts`        | `src/utils/tagUtils.test.ts`        |
| `src/hooks/useTags.ts`         | `src/hooks/useTags.test.ts`         |
| `src/components/TagInput.tsx`  | `src/components/TagInput.test.tsx`  |
| `src/components/NoteItem.tsx`  | `src/components/NoteItem.test.tsx`  |
| `src/context/NotesContext.tsx` | `src/context/NotesContext.test.tsx` |

#### 테스트 구조

```typescript
import { describe, it, expect } from 'vitest';

describe('함수명 또는 컴포넌트명', () => {
  describe('정상', () => {
    it('should [기대동작] when [조건]', () => {
      // 시나리오에서 가져온 테스트 이름 그대로 사용
    });
  });

  describe('경계', () => {
    it('should [기대동작] when [조건]', () => {});
  });

  describe('예외', () => {
    it('should [기대동작] when [조건]', () => {});
  });
});
```

#### 테스트 종류별 패턴

**순수 함수 테스트** (tagUtils 등):

```typescript
import { describe, it, expect } from 'vitest';
import { normalizeTag } from './tagUtils';

describe('normalizeTag', () => {
  it('should return "react" when input is "  React  "', () => {
    expect(normalizeTag('  React  ')).toBe('react');
  });
});
```

**커스텀 훅 테스트** (useTags 등):

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTags } from './useTags';

describe('useTags', () => {
  it('should initialize with empty array when no initialTags provided', () => {
    const { result } = renderHook(() => useTags());
    expect(result.current.tags).toEqual([]);
  });
});
```

**컴포넌트 테스트** (TagInput 등):

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('should render tag chips when tags prop is provided', () => {
    render(<TagInput tags={['react']} onAddTag={() => {}} onRemoveTag={() => {}} />);
    expect(screen.getByText('react')).toBeInTheDocument();
  });
});
```

**타입 테스트** (Note 인터페이스 변경 등):

- 타입 존재 여부는 TypeScript 컴파일러가 검증하므로, 런타임 동작 중심으로 테스트한다.
- 폴백 처리(`?? []`), API 호출 body 구조 등을 테스트한다.

#### import 규칙

- 아직 존재하지 않는 모듈을 import한다 — Red 단계에서는 이것이 정상이다.
- import 경로는 시그니처 문서에 명시된 파일 경로를 따른다.
- vitest globals가 설정되어 있으므로 `describe`, `it`, `expect`는 import 없이 사용해도 되지만, 명시적 import를 권장한다.

### Step 3. 시나리오별 실행 & 실패 확인

각 시나리오를 작성한 뒤 **즉시 실행**하여 실패를 확인한다:

```bash
npx vitest run src/path/to/file.test.ts
```

실패 유형은 다음 중 하나여야 한다:

- **모듈 없음**: `Cannot find module './tagUtils'` — 구현 파일이 아직 없으므로 정상
- **함수 없음**: `normalizeTag is not a function` — export가 아직 없으므로 정상
- **assertion 실패**: 기대값과 실제값이 다름 — 구현이 없으므로 정상

다음은 **비정상** 실패이므로 테스트를 수정해야 한다:

- 문법 에러 (SyntaxError)
- import 경로 오타
- 테스트 프레임워크 설정 문제

### Step 4. 전체 실행 & 요약

모든 시나리오를 작성한 뒤 전체 테스트를 실행한다:

```bash
npm test
```

결과를 요약하여 보고한다:

```
## TDD Red 완료 — Issue #{N}

- 테스트 파일: src/xxx/yyy.test.ts
- 전체 시나리오: N개
- 실패 (Red): N개 ✓
- 통과 (의도치 않음): N개 ✗ ← 이 경우 테스트를 점검해야 함
```

모든 테스트가 실패해야 Red 단계가 성공이다.

## 절대 금지

- `src/` 디렉토리의 구현 코드(`.ts`, `.tsx`)를 생성하거나 수정하는 것
- 테스트를 통과시키기 위한 stub/mock 구현체를 만드는 것
- 시나리오 문서에 없는 테스트를 추가하는 것
