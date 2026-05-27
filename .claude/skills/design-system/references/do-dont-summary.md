# Do's & Don'ts 종합

## Do

- **여백을 구조적 요소로 활용한다.** 애매하면 마진을 늘려라.
- **영역 구분은 배경색 전환으로 한다.** 1px border 대신 톤 차이로 경계를 "느끼게" 한다.
- **accent color(`tertiary`)는 의도가 있는 액션에만 사용한다.** 저장, 생성 등 사용자의 명확한 의도를 동반하는 행위 전용.
- **`surface_container_highest`로 사이드바 선택 상태를 표현한다.**
- **플로팅 요소에는 Glassmorphism을 적용한다.** 80% opacity + `backdrop-filter: blur(12px)`.
- **카드는 Tonal Layering으로 깊이를 표현한다.** `surface_container_lowest` on `surface_container`.
- **타이포그래피가 시스템을 이끈다.** 아이콘보다 텍스트 위계가 우선.
- **본문은 `on_surface_variant`(#586064)를 기본으로 사용한다.** 눈의 피로 감소.
- **Label은 항상 `uppercase` + `+0.05em` letter-spacing을 적용한다.**
- **간격은 1.4rem 배수 체계를 준수한다.**
- **Primary 버튼에 `tertiary` → `tertiary_container` 그라디언트를 적용한다.**
- **리스트 항목 간 `spacing.4`(1.4rem) gap으로 구분한다.**
- **접근성 필요 시 Ghost Border를 사용한다.** `outline_variant` 15% opacity.

## Don't

- **순수 검정(#000000)을 텍스트에 사용하지 않는다.** → `on_surface`(#2b3437)로 부드럽고 고급스러운 느낌 유지.
- **기본 box-shadow를 사용하지 않는다.** → "엔지니어링된" 느낌이 아닌 "디자인된" 느낌을 유지.
- **기능적 명확성 없는 아이콘을 사용하지 않는다.** → 이 시스템은 타이포그래피 중심이다.
- **사이드바 구분에 border를 사용하지 않는다.** → `surface_container_low` ↔ `surface` 색상 전환으로 구분.
- **accent color를 장식 용도로 남용하지 않는다.** → 의도 기반 액션 전용.
- **임의 px 값으로 간격을 정하지 않는다.** → 1.4rem 배수 간격 체계를 준수.
- **리스트 항목 사이에 구분선(divider)을 사용하지 않는다.** → spacing으로 구분.
- **태그 칩에 border를 사용하지 않는다.** → 배경색 + roundedness로 충분.
- **Display 스타일을 일반 제목에 사용하지 않는다.** → 랜딩 순간 전용.
- **본문에 `on_surface`(#2b3437)를 기본 색상으로 사용하지 않는다.** → 눈의 피로 유발.
- **Ghost Border를 시각적 경계로 남용하지 않는다.** → "제안"이지 "경계"가 아님.
