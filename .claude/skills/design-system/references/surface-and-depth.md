# Surface & Depth

## No-Line Rule

프리미엄 에디토리얼 느낌을 위해 **1px solid border로 섹션을 구분하는 것을 금지한다.** 영역 경계는 오직 배경색 전환으로 정의한다.

```
사이드바 (surface_container_low: #f1f4f6) │ 메인 영역 (surface: #f8f9fa)
                                           ↑
                                    경계선 없음 — 톤 전환으로 "느끼는" 구분
```

## Tonal Layering

일반 카드에는 그림자를 사용하지 않는다. `surface_container_lowest`(#ffffff) 카드를 `surface_container`(#eaeff1) 섹션 위에 올려 자연스러운 종이 겹침 효과를 만든다.

```
┌─────────────────────────────────────────┐
│  surface_container (#eaeff1)            │
│                                         │
│   ┌──────────────────────────────────┐  │
│   │  surface_container_lowest        │  │
│   │  (#ffffff)                       │  │
│   │  → "lifted paper" 효과           │  │
│   └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## Glass & Gradient Rule

플로팅 요소(모달, 드롭다운, 호버 브레드크럼)에는 **Glassmorphism**을 적용한다.

```css
/* Glassmorphism */
background: rgba(248, 249, 250, 0.8); /* surface at 80% */
backdrop-filter: blur(12px);

/* CTA Gradient */
background: linear-gradient(135deg, #0053dc, #3e76fe); /* tertiary → tertiary_container */
```

## Ambient Shadow

플로팅 효과가 필요한 경우(예: "새 노트" 팝오버)에만 그림자를 사용한다.

| 속성       | 값                | 비고                       |
| ---------- | ----------------- | -------------------------- |
| Blur       | 24px ~ 40px       | 부드러운 확산              |
| Opacity    | 6%                | `on_surface`(#2b3437) 기준 |
| Color Tint | accent color 힌트 | 팔레트 응집력 유지         |

```css
box-shadow: 0 8px 32px rgba(0, 83, 220, 0.06);
```

## Ghost Border

비슷한 배경 위에 컨테이너를 정의해야 할 때(접근성 목적), **Ghost Border**를 사용한다. "경계"가 아니라 "제안"이다.

```css
border: 1px solid rgba(171, 179, 183, 0.15); /* outline_variant at 15% */
```

---

## Do's & Don'ts

### Do

- **영역 구분은 배경색 차이로만 표현한다** (No-Line Rule)
- **카드는 Tonal Layering으로 깊이를 표현한다** → `surface_container_lowest` on `surface_container`
- **플로팅 요소에 Glassmorphism을 적용한다** (80% opacity + blur 12px)
- **플로팅 요소에만 Ambient Shadow를 사용한다** → blur 24-40px, 6% opacity
- **그림자 색상에 accent color tint를 적용한다** → 팔레트 응집력
- **접근성 필요 시 Ghost Border를 사용한다** → `outline_variant` 15% opacity

### Don't

- **1px solid border로 섹션을 구분하지 않는다** → 배경색 전환 사용
- **일반 카드에 box-shadow를 사용하지 않는다** → Tonal Layering으로 대체
- **Ghost Border를 시각적 경계로 남용하지 않는다** → "제안"이지 "경계"가 아님
- **그림자 색상에 순수 검정을 사용하지 않는다** → accent color tint 사용
- **기본 CSS shadow 프리셋을 사용하지 않는다** → "엔지니어링된" 느낌 방지
