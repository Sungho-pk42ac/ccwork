# Input Field

미니멀리스트 입력 스타일. Ghost Border가 focus 시에만 accent로 전환된다.

## 스타일

```css
/* 기본 */
background: #ffffff; /* surface_container_lowest */
border: 1px solid rgba(171, 179, 183, 0.15); /* Ghost Border */

/* focus */
border: 1px solid #0053dc; /* tertiary */
outline: none;
```

## Label 배치

`label-md` 스타일, 입력 필드 위에 `spacing.1`(0.35rem) 간격으로 배치.

```css
/* Label */
text-transform: uppercase;
letter-spacing: 0.05em;
font-size: 0.75rem;
font-weight: 500;
color: #586064; /* on_surface_variant */
margin-bottom: 0.35rem; /* spacing.1 */
```

---

## Do's & Don'ts

### Do

- **입력 필드 focus 시에만 `tertiary` border를 표시한다**
- **기본 상태는 Ghost Border(15% opacity)를 사용한다**
- **Label은 항상 `label-md` + uppercase로 입력 필드 위에 배치한다**

### Don't

- **입력 필드에 두꺼운 border를 사용하지 않는다** → Ghost Border(15% opacity) 사용
- **Label을 입력 필드 안에 placeholder로 대체하지 않는다** → 항상 외부 label 사용
- **focus 상태에 box-shadow를 사용하지 않는다** → border 색상 전환만
