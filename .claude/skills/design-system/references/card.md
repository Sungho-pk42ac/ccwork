# Card & List

## Divider Prohibition

리스트 항목 사이에 구분선을 사용하지 않는다. **Spacing Scale**로 구분한다.

```css
gap: 1.4rem; /* spacing.4 */
```

## Hover State

배경색 전환으로 호버를 표현한다.

```css
/* 기본 */
background: #f8f9fa; /* surface */

/* hover */
background: #f1f4f6; /* surface_container_low */
```

## Card Depth

카드는 Tonal Layering으로 깊이를 표현한다. box-shadow 대신 배경색 차이를 사용한다.

```css
/* 카드 */
background: #ffffff; /* surface_container_lowest → "lifted paper" */

/* 카드가 놓이는 배경 */
background: #eaeff1; /* surface_container */
```

---

## Do's & Don'ts

### Do

- **리스트 항목 간 `spacing.4`(1.4rem) gap으로 구분한다**
- **호버는 배경색 전환으로 표현한다** → `surface` → `surface_container_low`
- **`surface_container_highest`를 선택/활성 상태에 사용한다**

### Don't

- **리스트 항목 사이에 구분선(divider)을 사용하지 않는다** → spacing으로 구분
- **카드에 box-shadow를 사용하지 않는다** → Tonal Layering으로 대체
- **hover에 opacity 변화를 사용하지 않는다** → 배경색 전환이 원칙
