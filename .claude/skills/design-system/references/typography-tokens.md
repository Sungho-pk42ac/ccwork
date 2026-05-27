# Typography Tokens

폰트: **Inter** 단독 사용

## 스케일

| 역할     | 토큰          | 크기    | Weight   | letter-spacing | line-height | 용도                        |
| -------- | ------------- | ------- | -------- | -------------- | ----------- | --------------------------- |
| Display  | `display-lg`  | 3.5rem  | Bold     | -0.02em        | 1.2         | 랜딩 순간 전용              |
| Headline | `headline-md` | 1.75rem | SemiBold | 0              | 1.4         | 노트 제목                   |
| Body     | `body-lg`     | 1rem    | Regular  | 0              | 1.6         | 본문                        |
| Label    | `label-md`    | 0.75rem | Medium   | +0.05em        | 1.2         | 메타데이터 (uppercase 필수) |

## 텍스트 색상

| 상황        | 토큰                 | Hex     |
| ----------- | -------------------- | ------- |
| 본문 읽기   | `on_surface_variant` | #586064 |
| 강조/제목   | `on_surface`         | #2b3437 |
| 비활성/힌트 | `outline_variant`    | #abb3b7 |
| CTA 텍스트  | `on_tertiary`        | #faf8ff |

## Label CSS

```css
text-transform: uppercase;
letter-spacing: 0.05em;
font-size: 0.75rem;
font-weight: 500;
color: #586064;
```
