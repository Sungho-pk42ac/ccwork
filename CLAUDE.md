# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반 노트 CRUD 앱. 백엔드는 json-server(포트 3001)로 `db.json`을 파일 DB로 사용한다.

## 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 프론트(Vite) + json-server 동시 실행 |
| `npm run build` | `tsc && vite build` 프로덕션 빌드 |
| `npm run lint` | ESLint (`--fix` 포함) |
| `npm run format` | Prettier 포맷 |
| `npm test` | vitest run (단일 실행) |
| `npm run test:watch` | vitest watch 모드 |
| `npx vitest run src/path/to/file.test.ts` | 단일 테스트 파일 실행 |

## 개발 환경

- 앱: http://localhost:5173
- API: http://localhost:3001/notes
- 테스트: vitest + jsdom + @testing-library/react, 설정은 `vite.config.ts`의 `test` 블록
- 스타일: Tailwind CSS v4 (`@tailwindcss/vite` 플러그인)

## 아키텍처

```
App (selectedNoteId, isCreating 상태 관리)
└── NotesProvider (Context — 전역 notes 상태 + CRUD 액션)
    ├── Layout (헤더 + 사이드바/메인 슬롯 레이아웃)
    │   ├── NoteList (사이드바 — 노트 목록, 선택/삭제)
    │   └── NoteEditor (메인 — 생성/편집 폼)
    └── NoteItem (개별 노트 카드)
```

### 데이터 흐름

1. **API 레이어** (`src/api/notes.ts`): fetch 기반 CRUD 함수. `API_URL`은 `http://localhost:3001`로 하드코딩.
2. **Context** (`src/context/NotesContext.tsx`): `NotesProvider`가 마운트 시 `fetchNotes()`로 초기 로드. `addNote`, `editNote`, `removeNote`는 API 호출 후 로컬 state를 낙관적으로 갱신.
3. **컴포넌트**: `useNotes()` 훅으로 Context 소비. App이 선택/생성 모드를 제어하고 NoteEditor에 전달.

### 핵심 타입

`Note` (`src/types/note.ts`): `id`, `title`, `content`, `createdAt`, `updatedAt`. tags 필드는 미구현 (향후 추가 예정).

## 컴포넌트 구현 패턴

- **named function export**: `export function NoteList() {}` 형태. default export는 `App.tsx`만 예외.
- **Props 인터페이스**: 컴포넌트 파일 상단에 `interface XxxProps`로 정의. 별도 파일 분리 없이 컴포넌트와 같은 파일에 작성.
- **조건부 렌더링 순서**: early return 패턴 사용 — loading → error → empty → 정상 렌더링 순서 (NoteList 참고).
- **슬롯 패턴**: Layout은 `sidebar`, `main`을 `ReactNode`로 받아 배치. 자식 컴포넌트를 직접 import하지 않고 부모(App)가 주입.
- **이벤트 핸들러**: `onXxx` prop으로 콜백 전달, 컴포넌트 내부에서 `handleXxx`로 정의.
- **인라인 스타일**: Tailwind 유틸리티 클래스 직접 사용. CSS 파일은 `index.css`의 테마 변수 정의만 존재. 동적 클래스는 템플릿 리터럴로 조건 분기.

## 상태 관리 패턴

- **UI 상태** (selectedNoteId, isCreating): App에서 `useState`로 관리, props drilling으로 하위 전달.
- **도메인 상태** (notes, loading, error): Context (`NotesProvider`) + `useNotes()` 훅으로 전역 관리.
- **폼 상태** (title, content, saving): 해당 컴포넌트(NoteEditor) 내부 `useState`로 로컬 관리. `useEffect`로 선택 노트 변경 시 폼 동기화.
- **상태 갱신 전략**: API 호출 성공 후 `setNotes`로 로컬 state 직접 갱신 (낙관적 업데이트). 실패 시 alert로 사용자 알림.

## API 호출 패턴

- **함수 시그니처**: 도메인 동사 기반 — `fetchNotes`, `createNote`, `updateNote`, `deleteNote`.
- **반환 타입**: 명시적 `Promise<T>` 타입 어노테이션. void 반환도 `Promise<void>` 명시.
- **입력 타입**: `Omit<Note, 'id' | 'createdAt' | 'updatedAt'>`로 서버 생성 필드 제외.
- **에러 처리**: `res.ok` 체크 후 `throw new Error('Failed to ...')` 패턴. try-catch는 호출측(Context, 컴포넌트)에서 수행. alert 사용 금지 — `console.error`로만 처리.
- **타임스탬프**: `createdAt`, `updatedAt`은 클라이언트에서 `new Date().toISOString()`으로 생성해서 전송.

## 네이밍 패턴

- **파일명**: PascalCase (`NoteEditor.tsx`, `NoteList.tsx`). 타입/API는 소문자 (`note.ts`, `notes.ts`).
- **컴포넌트명**: 파일명과 동일한 PascalCase.
- **Props 인터페이스**: `{컴포넌트명}Props` (예: `NoteEditorProps`, `NoteItemProps`).
- **Context**: `{도메인}Context` + `{도메인}Provider` + `use{도메인}` 훅 (예: `NotesContext`, `NotesProvider`, `useNotes`).
- **API 함수**: `{동사}{도메인}` (예: `fetchNotes`, `createNote`).
- **Context 액션**: `{동사}Note` — API 함수와 동일한 동사 사용 (예: `createNote`, `updateNote`, `deleteNote`).
- **이벤트 핸들러 prop**: `on{동사}` (예: `onSelect`, `onDelete`, `onDone`, `onNewNote`).
- **상태 변수**: camelCase, boolean은 `is`/`has` 접두사 (예: `isCreating`, `isSelected`).
- **CSS 커스텀 속성**: `--color-{역할}`, `--font-{용도}` (예: `--color-muted-foreground`, `--font-display`).

## 일관성 없는 패턴 (주의)

1. **에러 처리 방식 혼재**: Context의 `fetchNotes` 실패는 `error` state로 관리하지만, `createNote`/`updateNote`/`deleteNote` 실패는 error state를 갱신하지 않고 예외를 그대로 throw. 컴포넌트에서 `console.error`로 처리.
3. **App만 default export**: 다른 모든 컴포넌트는 named export인데 `App.tsx`만 `export default`. Vite의 엔트리 관례를 따른 것이나 프로젝트 내 일관성과는 다름.
4. **useEffect 의존성 배열 lint 억제**: NoteEditor의 `useEffect`에서 `selectedNote`를 deps에서 제외하고 `// eslint-disable-line`으로 경고 억제 중. 의도적이나 잠재적 동기화 버그 가능성 있음.
