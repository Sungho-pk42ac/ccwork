# Button

## Primary

의도가 명확한 주요 액션 (저장, 생성 등).

```css
background: linear-gradient(135deg, #0053dc, #3e76fe); /* tertiary → tertiary_container */
color: #faf8ff; /* on_tertiary */
border-radius: 0.375rem; /* md */
border: none;
```

## Secondary

보조 액션 (취소, 닫기 등).

```css
background: #e2e9ec; /* surface_container_high */
color: #2b3437; /* on_surface */
border: none;
border-radius: 0.375rem;
```

## Tertiary (Ghost)

최소한의 시각적 무게를 가진 액션 (링크성 동작).

```css
background: transparent;
color: #0053dc; /* tertiary */
border: none;
```

```css
/* hover */
background: rgba(0, 83, 220, 0.02); /* tertiary at 2% */
```

---

## Do's & Don'ts

### Do

- **Primary 버튼에 `tertiary` → `tertiary_container` 그라디언트를 적용한다**
- **roundedness는 `md`(0.375rem)를 사용한다**
- **Ghost 버튼의 hover는 accent color 2% opacity로 표현한다**

### Don't

- **Primary 버튼에 flat 단색을 사용하지 않는다** → 그라디언트로 깊이 부여
- **Secondary 버튼에 border를 사용하지 않는다** → 배경색만으로 구분
- **accent color를 Secondary/Tertiary 버튼 배경에 사용하지 않는다** → 의도 기반 액션 전용
