---
name: src-structure
description: "src 디렉토리의 계층 구조와 파일 네이밍 규칙을 점검하고, 도메인별 디렉토리 정리를 제안한다. /src-structure로 실행. '디렉토리 구조', '파일 구조', '폴더 정리', 'src 구조', '네이밍 규칙', '네이밍 점검', '도메인 디렉토리', 'file structure', 'directory review' 등을 언급하면 이 스킬을 사용한다. 리팩토링 전 구조 파악이나, 새 기능 추가 시 파일 배치 결정에 활용한다."
---

# src-structure 스킬

src 디렉토리의 파일/폴더 구조를 분석하여 **현재 상태 보고 → 문제 진단 → 개선안 제시**를 수행한다.

## 왜 구조 점검인가

프로젝트가 성장하면 components/ 아래에 무관한 파일이 섞이고, utils/와 hooks/가 도메인 없이 평탄해진다. 기능 추가 시 "이 파일은 어디에 놓지?"라는 고민이 발생하면 구조를 점검할 때다.

---

## 실행 순서

### Step 1. 현재 구조 수집

```bash
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | sort
```

결과를 트리 형태로 정리하여 보여준다.

### Step 2. CLAUDE.md 컨벤션 대조

CLAUDE.md의 네이밍 패턴 섹션을 읽고, 현재 파일들이 규칙을 따르는지 대조한다:

| 규칙     | 대상          | 기대 패턴                        |
| -------- | ------------- | -------------------------------- |
| 파일명   | 컴포넌트      | PascalCase (.tsx)                |
| 파일명   | 타입/API/유틸 | camelCase 또는 소문자 (.ts)      |
| 파일명   | 훅            | camelCase, use 접두사 (.ts)      |
| 파일명   | 테스트        | 대상파일명.test.ts(x)            |
| 디렉토리 | 기능 도메인   | 소문자 kebab-case 또는 camelCase |

### Step 3. 도메인 분석

각 파일의 import 관계를 분석하여 **도메인 클러스터**를 식별한다:

- 서로 많이 import하는 파일군 = 같은 도메인
- 특정 기능에만 사용되는 유틸/훅 = 해당 도메인 소속

### Step 4. 문제 진단

다음 관점에서 문제를 진단한다:

| 문제 유형     | 설명                           | 예시                              |
| ------------- | ------------------------------ | --------------------------------- |
| 평탄 구조     | 한 디렉토리에 무관한 파일 혼재 | components/에 Note + Tag 컴포넌트 |
| 네이밍 불일치 | 컨벤션과 다른 파일명           | utils/TagUtils.ts (PascalCase)    |
| 테스트 분리   | 테스트가 대상과 다른 위치      | tests/ 디렉토리에 모음            |
| 순환 의존     | A→B→A 순환 import              | context→component→context         |
| 과잉 분리     | 파일 1개짜리 디렉토리          | domain/tag/index.ts만 존재        |

### Step 5. 개선안 제시

현재 구조와 개선안을 **Before/After** 트리로 제시한다.

개선 원칙:

- **도메인 응집**: 같은 기능의 컴포넌트/훅/유틸/테스트는 가까이 배치
- **깊이 제한**: src/ 기준 최대 3단계 (src/domain/file.ts)
- **점진적 이동**: 한 번에 전부 옮기지 않고, 이번 작업 범위만 정리
- **import 경로 업데이트**: 파일 이동 시 모든 import 경로를 갱신

```
## 개선안

### Before
src/
├── components/
│   ├── NoteEditor.tsx
│   ├── TagInput.tsx     ← Note와 Tag 혼재
│   └── ...
├── hooks/
│   └── useTags.ts       ← 태그 전용인데 범용 디렉토리
└── utils/
    └── tagUtils.ts      ← 태그 전용인데 범용 디렉토리

### After (제안)
src/
├── components/
│   ├── NoteEditor.tsx
│   └── ...
├── features/
│   └── tag/
│       ├── TagInput.tsx
│       ├── TagInput.test.tsx
│       ├── useTags.ts
│       ├── useTags.test.ts
│       ├── tagUtils.ts
│       └── tagUtils.test.ts
└── ...
```

### Step 6. 승인 및 적용

AskUserQuestion으로 개선안을 승인받는다:

- **승인**: 파일 이동 + import 경로 업데이트 수행, `npm test`로 회귀 확인
- **부분 승인**: 선택한 항목만 적용
- **보류**: 보고만 하고 적용하지 않음

---

## 적용 시 안전 규칙

- 파일 이동 전 `npm test` 통과 확인
- 파일 이동 후 `npm test` 통과 확인
- 테스트 실패 시 즉시 롤백
- CLAUDE.md의 아키텍처 섹션을 이동 결과에 맞게 업데이트

## 절대 금지

- 승인 없이 파일을 이동하는 것
- 구현 로직을 변경하는 것 — 구조만 정리한다
- 테스트가 깨진 채로 다음 이동을 진행하는 것
