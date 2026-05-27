---
name: design-system
description: This skill should be used when the user asks to "스타일 수정", "UI 변경", "컴포넌트 스타일링", "색상 변경", "간격 조정", "버튼 스타일", "태그 칩", "Tailwind 클래스", "CSS 수정", or when creating/modifying .tsx, .jsx, .css files that contain UI styling, Tailwind utility classes, or visual design decisions. Provides the Digital Atelier design system tokens, component patterns, and Do's & Don'ts rules.
---

# Design System: The Digital Atelier

UI 코드(.tsx / .jsx / .css / Tailwind 클래스)를 작성하거나 수정할 때 이 스킬이 활성화된다. `references/` 아래의 토큰과 가이드를 참조하여 일관된 디자인을 보장한다.

## 핵심 원칙

- **Soft Minimalism**: UI가 콘텐츠와 경쟁하지 않는다
- **Tonal Depth**: border 대신 배경색 톤 차이로 깊이를 표현한다
- **Typography-driven**: 아이콘보다 텍스트 위계가 우선이다

## 작업 워크플로우

### 1. 작업 유형에 따라 참조 파일 로드

| 작업                 | 읽어야 할 파일                    |
| -------------------- | --------------------------------- |
| 색상/배경색 변경     | `references/color-tokens.md`      |
| 폰트/텍스트 스타일   | `references/typography-tokens.md` |
| 여백/패딩/gap        | `references/spacing-tokens.md`    |
| 버튼 스타일링        | `references/button.md`            |
| 카드/리스트 스타일링 | `references/card.md`              |
| 입력 필드 스타일링   | `references/input.md`             |
| 태그 칩 스타일링     | `references/chip.md`              |
| 깊이/그림자/border   | `references/surface-and-depth.md` |
| 디자인 철학 확인     | `references/philosophy.md`        |
| Do/Don't 전체 확인   | `references/do-dont-summary.md`   |

### 2. 코드 작성 시 반드시 준수

**hard-coded 색상값 금지**: `#xxxxxx`, `rgb(...)`, `hsl(...)` 대신 `color-tokens.md`에 정의된 CSS 변수 또는 Tailwind 토큰을 사용한다.

```tsx
// DO
className="bg-background text-foreground"
className="bg-[var(--color-tertiary)]"

// DON'T
className="bg-[#f8f9fa]"
style={{ color: '#2b3437' }}
```

**임의 spacing 값 금지**: `spacing-tokens.md`에 정의된 스케일(0.35rem 배수)을 사용한다.

```tsx
// DO — spacing.4 (1.4rem) 사용
className = 'gap-[1.4rem]';
className = 'mb-[0.7rem]'; // spacing.2

// DON'T
className = 'gap-5'; // 임의 값
className = 'mb-[13px]'; // px 사용
```

**컴포넌트 패턴 재사용**: 버튼, 카드, 입력, 칩 스타일링 시 해당 가이드의 CSS 스펙을 우선 따른다.

## 핵심 Do's & Don'ts

### Do

- 영역 구분은 배경색 전환으로 한다 (No-Line Rule)
- accent color(`tertiary` #0053dc)는 의도 기반 액션에만 사용한다
- 카드 깊이는 Tonal Layering으로 표현한다 (box-shadow 대신)
- 본문 텍스트는 `on_surface_variant`(#586064)를 기본으로 사용한다
- 간격은 0.35rem 배수 체계를 준수한다

### Don't

- 순수 검정(#000000)을 텍스트에 사용하지 않는다 → `on_surface`(#2b3437)
- 1px solid border로 섹션을 구분하지 않는다 → 배경색 전환
- 기본 box-shadow를 카드에 사용하지 않는다 → Tonal Layering
- 리스트 항목 사이에 구분선을 사용하지 않는다 → spacing gap
- 태그 칩에 border를 사용하지 않는다 → 배경색 + full roundedness

## Quick Reference: 자주 쓰는 토큰

| 용도             | CSS 변수                   | 값      |
| ---------------- | -------------------------- | ------- |
| 기본 배경        | `--color-background`       | #f8f9fa |
| 카드 배경        | `--color-card`             | #ffffff |
| 기본 텍스트      | `--color-foreground`       | #2b3437 |
| 보조 텍스트      | `--color-muted-foreground` | #586064 |
| 액센트           | `--color-tertiary`         | #0053dc |
| 제목→본문 간격   | spacing.2                  | 0.7rem  |
| 리스트 항목 간격 | spacing.4                  | 1.4rem  |
| 섹션 간격        | spacing.10                 | 3.5rem  |

## 참조 파일 목록

### 토큰 (값 조회)

- **`references/color-tokens.md`** — 색상 Hex + CSS 변수 매핑 테이블
- **`references/typography-tokens.md`** — 폰트 크기/weight/spacing 테이블
- **`references/spacing-tokens.md`** — spacing.1~10 값 테이블

### 컴포넌트 가이드 (스타일 규칙 + Do/Don't)

- **`references/button.md`** — Primary/Secondary/Tertiary 버튼 CSS
- **`references/card.md`** — 카드/리스트 호버, Divider Prohibition
- **`references/input.md`** — 입력 필드 Ghost Border, focus 스타일
- **`references/chip.md`** — Knowledge Token(태그 칩) 스타일

### 설계 원칙

- **`references/surface-and-depth.md`** — No-Line Rule, Tonal Layering, Glassmorphism, Ghost Border
- **`references/philosophy.md`** — Creative North Star, 핵심 원칙
- **`references/do-dont-summary.md`** — 전체 Do's & Don'ts 종합
