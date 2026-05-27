import { test, expect } from '@playwright/test';
import { resetDB, seedNotes } from './helpers';

test.beforeEach(async ({ request }) => {
  await resetDB(request);
});

// ──────────────────────────────────────────────
// 1. 초기 상태
// ──────────────────────────────────────────────
test.describe('초기 상태', () => {
  test('노트가 없을 때 빈 상태 메시지를 표시한다', async ({ page }) => {
    await page.goto('/');

    // 사이드바 빈 상태 메시지
    await expect(page.getByText('노트가 없습니다')).toBeVisible();

    // 메인 영역 안내 문구
    await expect(page.getByText('노트를 선택하거나 새 노트를 만드세요')).toBeVisible();
  });

  test('헤더에 앱 제목과 "+ 새 노트" 버튼이 표시된다', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Notes/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '+ 새 노트' })).toBeVisible();
  });

  test('노트가 있을 때 사이드바에 목록이 표시된다', async ({ page, request }) => {
    await seedNotes(request, [
      { title: '첫 번째 노트', content: '첫 번째 내용' },
      { title: '두 번째 노트', content: '두 번째 내용' },
    ]);

    await page.goto('/');

    await expect(page.getByText('첫 번째 노트')).toBeVisible();
    await expect(page.getByText('두 번째 노트')).toBeVisible();
    await expect(page.getByText('노트 2개')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 2. 노트 생성
// ──────────────────────────────────────────────
test.describe('노트 생성', () => {
  test('"+ 새 노트" 버튼을 누르면 에디터가 열린다', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '+ 새 노트' }).click();

    await expect(page.getByText('새 노트', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('제목')).toBeVisible();
    await expect(page.getByPlaceholder('내용을 입력하세요...')).toBeVisible();
  });

  test('제목과 내용을 입력하고 저장하면 사이드바에 나타난다', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('E2E 테스트 노트');
    await page.getByPlaceholder('내용을 입력하세요...').fill('Playwright로 작성한 노트입니다.');
    await page.getByRole('button', { name: '저장' }).click();

    await expect(page.getByText('E2E 테스트 노트')).toBeVisible();
  });

  test('제목 없이 저장하면 에디터가 유지된다 (저장 실패)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '+ 새 노트' }).click();
    // 제목 비워둔 채 저장
    await page.getByRole('button', { name: '저장' }).click();

    // 에디터가 그대로 열려 있어야 함
    await expect(page.getByText('새 노트', { exact: true })).toBeVisible();
    // 사이드바는 여전히 빈 상태
    await expect(page.getByText('노트가 없습니다')).toBeVisible();
  });

  test('취소 버튼을 누르면 에디터가 닫힌다', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('취소할 노트');
    await page.getByRole('button', { name: '취소' }).click();

    // 안내 문구가 다시 표시되어야 함
    await expect(page.getByText('노트를 선택하거나 새 노트를 만드세요')).toBeVisible();
    // DB에 저장 안 됨
    await expect(page.getByText('취소할 노트')).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 3. 노트 읽기 / 선택
// ──────────────────────────────────────────────
test.describe('노트 읽기', () => {
  test('사이드바에서 노트를 클릭하면 에디터에 내용이 표시된다', async ({ page, request }) => {
    await seedNotes(request, [
      { title: '클릭할 노트', content: '노트 내용이 에디터에 표시됩니다.' },
    ]);

    await page.goto('/');
    await page.getByText('클릭할 노트').click();

    await expect(page.getByPlaceholder('제목')).toHaveValue('클릭할 노트');
    await expect(page.getByPlaceholder('내용을 입력하세요...')).toHaveValue(
      '노트 내용이 에디터에 표시됩니다.',
    );
    await expect(page.getByText('노트 편집')).toBeVisible();
  });

  test('선택한 노트 아이템이 강조(border) 처리된다', async ({ page, request }) => {
    await seedNotes(request, [{ title: '선택 강조 노트', content: '' }]);

    await page.goto('/');

    const noteItem = page.getByText('선택 강조 노트').locator('..');
    await noteItem.click();

    // isSelected일 때 border-foreground 클래스가 적용됨 (noteItem의 부모 = NoteItem 최상위 div)
    await expect(noteItem.locator('..')).toHaveClass(/border-foreground/);
  });
});

// ──────────────────────────────────────────────
// 4. 노트 수정
// ──────────────────────────────────────────────
test.describe('노트 수정', () => {
  test('노트 제목을 수정하고 저장하면 사이드바가 갱신된다', async ({ page, request }) => {
    await seedNotes(request, [{ title: '수정 전 제목', content: '내용' }]);

    await page.goto('/');
    await page.getByText('수정 전 제목').click();

    const titleInput = page.getByPlaceholder('제목');
    await titleInput.clear();
    await titleInput.fill('수정 후 제목');
    await page.getByRole('button', { name: '저장' }).click();

    await expect(page.getByText('수정 후 제목')).toBeVisible();
    await expect(page.getByText('수정 전 제목')).not.toBeVisible();
  });

  test('저장 중 버튼이 "저장 중..." 상태로 비활성화된다', async ({ page, request }) => {
    await seedNotes(request, [{ title: '버튼 상태 테스트', content: '' }]);

    await page.goto('/');
    await page.getByText('버튼 상태 테스트').click();

    // 네트워크 응답을 지연시켜 저장 중 상태 포착
    await page.route('**/notes/**', async (route) => {
      await new Promise((r) => setTimeout(r, 300));
      await route.continue();
    });

    const saveBtn = page.getByRole('button', { name: '저장' });
    await saveBtn.click();

    await expect(page.getByRole('button', { name: '저장 중...' })).toBeDisabled();
  });
});

// ──────────────────────────────────────────────
// 5. 노트 삭제
// ──────────────────────────────────────────────
test.describe('노트 삭제', () => {
  test('삭제 버튼을 누르면 사이드바에서 노트가 사라진다', async ({ page, request }) => {
    await seedNotes(request, [
      { title: '삭제할 노트', content: '이 노트는 삭제됩니다.' },
      { title: '남길 노트', content: '이 노트는 유지됩니다.' },
    ]);

    await page.goto('/');

    // '삭제할 노트' 아이템에서 '삭제' 버튼 클릭
    const noteItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: '삭제할 노트' });
    await noteItem.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByText('삭제할 노트')).not.toBeVisible();
    await expect(page.getByText('남길 노트')).toBeVisible();
  });

  test('노트를 모두 삭제하면 빈 상태 메시지가 표시된다', async ({ page, request }) => {
    await seedNotes(request, [{ title: '마지막 노트', content: '' }]);

    await page.goto('/');

    const noteItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: '마지막 노트' });
    await noteItem.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByText('노트가 없습니다')).toBeVisible();
  });

  test('삭제 버튼 클릭이 노트 선택을 유발하지 않는다', async ({ page, request }) => {
    await seedNotes(request, [{ title: '이벤트 전파 테스트', content: '' }]);

    await page.goto('/');

    const noteItem = page.locator('[class*="rounded-2xl"]').filter({ hasText: '이벤트 전파 테스트' });
    await noteItem.getByRole('button', { name: '삭제' }).click();

    // 에디터가 열리지 않아야 함
    await expect(page.getByText('노트 편집')).not.toBeVisible();
    await expect(page.getByText('노트를 선택하거나 새 노트를 만드세요')).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 6. 완전한 CRUD 흐름
// ──────────────────────────────────────────────
test.describe('전체 CRUD 흐름', () => {
  test('노트 생성 → 수정 → 삭제 전 과정이 동작한다', async ({ page }) => {
    await page.goto('/');

    // 생성
    await page.getByRole('button', { name: '+ 새 노트' }).click();
    await page.getByPlaceholder('제목').fill('흐름 테스트 노트');
    await page.getByPlaceholder('내용을 입력하세요...').fill('초기 내용');
    await page.getByRole('button', { name: '저장' }).click();

    await expect(page.getByText('흐름 테스트 노트')).toBeVisible();

    // 수정
    await page.getByText('흐름 테스트 노트').click();
    const titleInput = page.getByPlaceholder('제목');
    await titleInput.clear();
    await titleInput.fill('수정된 흐름 노트');
    await page.getByRole('button', { name: '저장' }).click();

    await expect(page.getByText('수정된 흐름 노트')).toBeVisible();

    // 삭제
    const noteItem = page
      .locator('[class*="rounded-2xl"]')
      .filter({ hasText: '수정된 흐름 노트' });
    await noteItem.getByRole('button', { name: '삭제' }).click();

    await expect(page.getByText('노트가 없습니다')).toBeVisible();
  });
});
