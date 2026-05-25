# Spacing Tokens

기본 리듬: **1.4rem** (`spacing.4`)

| 토큰         | 값      | 용도                                  |
| ------------ | ------- | ------------------------------------- |
| `spacing.1`  | 0.35rem | 라벨-입력 간격, 최소 여백             |
| `spacing.2`  | 0.7rem  | 제목→본문 간격 (Vertical Rhythm)      |
| `spacing.3`  | 1.05rem | 관련 요소 그룹 내부 간격              |
| `spacing.4`  | 1.4rem  | 리스트 항목 간격 (기본 리듬 단위)     |
| `spacing.5`  | 1.75rem | 컴포넌트 내부 섹션 구분               |
| `spacing.6`  | 2.1rem  | 카드 내부 패딩                        |
| `spacing.8`  | 2.8rem  | 중간 섹션 간격                        |
| `spacing.10` | 3.5rem  | 대형 레이아웃 블록 간격 (Section Gap) |

## 주요 패턴

```
[Headline]    ← headline-md
  ↕ 0.7rem   ← spacing.2 (Vertical Rhythm)
[Body text]   ← body-lg

[Section A]
  ↕ 3.5rem   ← spacing.10 (Section Gap)
[Section B]
```
