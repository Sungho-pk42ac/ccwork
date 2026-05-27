/**
 * 태그 기능 E2E 테스트
 *
 * 커버 범위: docs/features/tag/prd.md US-1 ~ US-6
 *
 * ✅ E2E 담당: 브라우저 인터랙션 → UI 반영, 저장 후 목록 반영 등 레이어 통합 흐름
 * ❌ 단위 테스트 위임: normalizeTag 변환 로직, isDuplicateTag 함수, useTags 훅 내부 상태
 *
 * 참고: 이 테스트는 태그 기능 구현 전 작성된 스펙입니다.
 *       로케이터(placeholder, aria-label 등)는 실제 구현과 맞춰 조정하세요.
 */

import { test, expect } from '@playwright/test';
import { resetDB, seedNotes } from './helpers';

test.beforeEach(async ({ request }) => {
  await resetDB(request);
});

// ──────────────────────────────────────────────
// 공통 헬퍼: 태그 입력 필드 로케이터
// 구현 시 실제 placeholder와 일치하는지 확인
// ──────────────────────────────────────────────
const TAG_INPUT_PLACEHOLDER = '태그를 입력하세요...';

// ──────────────────────────────────────────────
// 1. 태그 추가 (US-1)
// ──────────────────────────────────────────────
test.describe('태그 추가 (US-1)', () => {
  test('Enter 키로 태그 칩이 추가된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('태그 입력 테스트');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    await tagInput.fill('playwright');
    await tagInput.press('Enter');

    // 칩이 에디터 내에 나타나고, 입력 필드는 비워진다
    await expect(page.getByText('playwright', { exact: true })).toBeVisible();
    await expect(tagInput).toHaveValue('');
  });

  test('쉼표(,)로 태그 칩이 추가된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('쉼표 태그 테스트');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    await tagInput.fill('react');
    await tagInput.press(',');

    await expect(page.getByText('react', { exact: true })).toBeVisible();
    await expect(tagInput).toHaveValue('');
  });

  test('여러 태그를 연속으로 추가할 수 있다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('다중 태그 노트');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    for (const tag of ['react', 'typescript', 'playwright']) {
      await tagInput.fill(tag);
      await tagInput.press('Enter');
    }

    await expect(page.getByText('react', { exact: true })).toBeVisible();
    await expect(page.getByText('typescript', { exact: true })).toBeVisible();
    await expect(page.getByText('playwright', { exact: true })).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 2. 태그 삭제 (US-2)
// ──────────────────────────────────────────────
test.describe('태그 삭제 (US-2)', () => {
  test('칩의 X 버튼 클릭 시 해당 태그가 제거된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('태그 삭제 테스트');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    await tagInput.fill('삭제할태그');
    await tagInput.press('Enter');

    await expect(page.getByText('삭제할태그', { exact: true })).toBeVisible();

    // 칩 내부의 삭제 버튼 클릭
    // aria-label="삭제할태그 삭제" 또는 칩 컨테이너 내 유일한 button
    const chip = page.locator('[class*="chip"], [class*="tag"]').filter({ hasText: '삭제할태그' });
    await chip.getByRole('button').click();

    await expect(page.getByText('삭제할태그', { exact: true })).not.toBeVisible();
  });

  test('X 버튼 클릭이 다른 태그에 영향을 주지 않는다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('다중 삭제 테스트');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    for (const tag of ['남길태그', '지울태그']) {
      await tagInput.fill(tag);
      await tagInput.press('Enter');
    }

    const chip = page.locator('[class*="chip"], [class*="tag"]').filter({ hasText: '지울태그' });
    await chip.getByRole('button').click();

    await expect(page.getByText('지울태그', { exact: true })).not.toBeVisible();
    await expect(page.getByText('남길태그', { exact: true })).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 3. 목록에서 태그 표시 (US-3)
// ──────────────────────────────────────────────
test.describe('목록에서 태그 표시 (US-3)', () => {
  test('태그가 있는 노트는 NoteItem에 칩이 표시된다', async ({ page, request }) => {
    await seedNotes(request, [
      { title: '태그 있는 노트', content: '내용', tags: ['react', 'typescript'] },
    ]);

    await page.goto('/');

    const noteItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: '태그 있는 노트' });
    await expect(noteItem.getByText('react', { exact: true })).toBeVisible();
    await expect(noteItem.getByText('typescript', { exact: true })).toBeVisible();
  });

  test('태그가 없는 노트는 NoteItem에 태그 영역이 없다', async ({ page, request }) => {
    await seedNotes(request, [
      { title: '태그 없는 노트', content: '내용', tags: [] },
    ]);

    await page.goto('/');

    // 태그 칩 영역이 렌더링되지 않아야 함 (특정 태그 클래스 컨테이너 미존재)
    const noteItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: '태그 없는 노트' });
    await expect(noteItem.locator('[class*="chip"], [class*="tag"]')).toHaveCount(0);
  });

  test('에디터에서 태그를 추가하고 저장하면 목록에 반영된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('저장 후 목록 반영 테스트');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    await tagInput.fill('e2e');
    await tagInput.press('Enter');

    await page.getByRole('button', { name: '저장' }).click();

    // 사이드바 NoteItem에 태그가 표시되어야 함
    const noteItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: '저장 후 목록 반영 테스트' });
    await expect(noteItem.getByText('e2e', { exact: true })).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 4. 엣지 케이스 (US-4, US-5, US-6)
// ──────────────────────────────────────────────
test.describe('엣지 케이스', () => {
  // US-4: 중복 처리 — 소문자 정규화 로직 자체는 tagUtils 단위 테스트 담당.
  // E2E는 "사용자가 같은 의미의 태그를 두 번 입력해도 칩이 하나만 보인다"는 사용자 경험만 검증.
  test('대소문자가 달라도 중복 태그는 칩이 하나만 유지된다 (US-4)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('중복 태그 테스트');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    await tagInput.fill('React');
    await tagInput.press('Enter');
    await tagInput.fill('react'); // 소문자 동일 태그 재입력
    await tagInput.press('Enter');

    // 'react' 칩이 정확히 1개만 존재해야 함
    await expect(
      page.locator('[class*="chip"], [class*="tag"]').filter({ hasText: 'react' }),
    ).toHaveCount(1);
  });

  // US-5: 빈 입력 차단 — 빈 문자열 로직은 tagUtils 단위 테스트 담당.
  // E2E는 "공백만 입력 후 Enter해도 칩이 생기지 않는다"는 UI 응답만 검증.
  test('공백만 입력 후 Enter해도 태그 칩이 추가되지 않는다 (US-5)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('빈 태그 테스트');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    await tagInput.fill('   '); // 공백만
    await tagInput.press('Enter');

    // 칩이 추가되어선 안 됨
    await expect(page.locator('[class*="chip"], [class*="tag"]')).toHaveCount(0);
  });

  // US-6: 레거시 노트 폴백 — tags 필드 없이 저장된 기존 노트를 열어도 오류가 없어야 함.
  test('tags 필드가 없는 기존 노트를 열어도 오류 없이 에디터가 표시된다 (US-6)', async ({
    page,
    request,
  }) => {
    // tags 필드를 명시적으로 제외한 레거시 노트 직접 씨딩
    const now = new Date().toISOString();
    await request.post('http://localhost:3001/notes', {
      data: { title: '레거시 노트', content: '태그 필드 없음', createdAt: now, updatedAt: now },
      // tags 필드 의도적으로 누락
    });

    await page.goto('/');
    await page.getByText('레거시 노트').click();

    // 에디터가 오류 없이 열려야 함
    await expect(page.getByPlaceholder('제목')).toHaveValue('레거시 노트');
    // 태그 입력 필드가 빈 상태로 정상 표시되어야 함
    await expect(page.getByPlaceholder(TAG_INPUT_PLACEHOLDER)).toBeVisible();
    await expect(page.getByPlaceholder(TAG_INPUT_PLACEHOLDER)).toHaveValue('');
    // 칩이 없어야 함
    await expect(page.locator('[class*="chip"], [class*="tag"]')).toHaveCount(0);
  });
});

// ──────────────────────────────────────────────
// 5. 전체 흐름
// ──────────────────────────────────────────────
test.describe('전체 태그 CRUD 흐름', () => {
  test('태그 추가 → 저장 → 목록 확인 → 태그 수정 후 재저장', async ({ page }) => {
    await page.goto('/');

    // 1) 태그와 함께 새 노트 생성
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('태그 전체 흐름');

    const tagInput = page.getByPlaceholder(TAG_INPUT_PLACEHOLDER);
    await tagInput.fill('초기태그');
    await tagInput.press('Enter');

    await page.getByRole('button', { name: '저장' }).click();

    // 2) 사이드바 NoteItem에 태그가 표시된다
    const noteItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: '태그 전체 흐름' });
    await expect(noteItem.getByText('초기태그', { exact: true })).toBeVisible();

    // 3) 노트 다시 열기 → 기존 태그가 에디터에 유지된다
    await noteItem.click();
    await expect(page.getByText('초기태그', { exact: true })).toBeVisible();

    // 4) 기존 태그 삭제 + 새 태그 추가 후 저장
    const chip = page.locator('[class*="chip"], [class*="tag"]').filter({ hasText: '초기태그' });
    await chip.getByRole('button').click();
    await expect(page.getByText('초기태그', { exact: true })).not.toBeVisible();

    await tagInput.fill('수정태그');
    await tagInput.press('Enter');
    await page.getByRole('button', { name: '저장' }).click();

    // 5) NoteItem에 수정된 태그가 반영된다
    await expect(noteItem.getByText('수정태그', { exact: true })).toBeVisible();
    await expect(noteItem.getByText('초기태그', { exact: true })).not.toBeVisible();
  });
});
