# Color Tokens

## Surface 계층

| 토큰                        | Hex     | CSS 변수                  | 용도                        |
| --------------------------- | ------- | ------------------------- | --------------------------- |
| `surface`                   | #f8f9fa | `--color-background`      | 기본 캔버스                 |
| `surface_container_low`     | #f1f4f6 | `--color-surface-low`     | 사이드바, 네비게이션 배경   |
| `surface_container`         | #eaeff1 | `--color-surface`         | 중간 깊이 컨테이너          |
| `surface_container_high`    | #e2e9ec | `--color-muted`           | Secondary 버튼 배경         |
| `surface_container_highest` | #dbe4e7 | `--color-surface-highest` | 선택 상태, 태그 칩 배경     |
| `surface_container_lowest`  | #ffffff | `--color-card`            | 최상위 카드, 활성 작업 영역 |

## Accent

| 토큰                 | Hex     | CSS 변수                     | 용도                   |
| -------------------- | ------- | ---------------------------- | ---------------------- |
| `tertiary`           | #0053dc | `--color-tertiary`           | 주요 액센트, CTA, 링크 |
| `tertiary_container` | #3e76fe | `--color-tertiary-container` | CTA 그라디언트 끝점    |

## Text

| 토큰                 | Hex     | CSS 변수                   | 용도                |
| -------------------- | ------- | -------------------------- | ------------------- |
| `on_surface`         | #2b3437 | `--color-foreground`       | 기본 텍스트, 강조   |
| `on_surface_variant` | #586064 | `--color-muted-foreground` | 본문, 보조 텍스트   |
| `on_tertiary`        | #faf8ff | —                          | Primary 버튼 텍스트 |

## Utility

| 토큰              | Hex            | CSS 변수              | 용도                       |
| ----------------- | -------------- | --------------------- | -------------------------- |
| `outline_variant` | #abb3b7        | `--color-border`      | Ghost Border (15% opacity) |
| `destructive`     | hsl(0 84% 60%) | `--color-destructive` | 삭제 등 위험 액션          |

## Glassmorphism

```css
background: rgba(248, 249, 250, 0.8); /* surface at 80% */
backdrop-filter: blur(12px);
```

## CTA Gradient

```css
background: linear-gradient(135deg, #0053dc, #3e76fe); /* tertiary → tertiary_container */
```
