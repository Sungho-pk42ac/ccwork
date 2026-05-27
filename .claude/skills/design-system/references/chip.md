# Knowledge Token (태그 칩)

토픽 태깅에 사용하는 커스텀 칩 (예: #javascript, #design).

## 스타일

```css
background: #dbe4e7; /* surface_container_highest */
color: #586064; /* on_surface_variant */
border-radius: 9999px; /* full roundedness */
border: none;
padding: 0.25rem 0.75rem;
font-size: 0.75rem; /* label-md */
```

## 삭제 버튼 (X)

칩 내부 삭제 버튼은 최소한의 시각적 무게를 가진다.

```css
/* X 버튼 */
color: #586064; /* on_surface_variant */
cursor: pointer;
margin-left: 0.35rem; /* spacing.1 */
```

```css
/* hover */
color: #2b3437; /* on_surface */
```

---

## Do's & Don'ts

### Do

- **태그 칩은 `full` roundedness + `surface_container_highest` 배경을 사용한다**
- **텍스트는 `on_surface_variant`(#586064)를 사용한다**
- **삭제 버튼은 칩 내부 오른쪽에 배치한다**

### Don't

- **태그 칩에 border를 사용하지 않는다** → 배경색 + roundedness로 충분
- **태그 칩에 그림자를 사용하지 않는다** → flat 스타일 유지
- **accent color를 태그 칩 배경에 사용하지 않는다** → neutral tone 유지
