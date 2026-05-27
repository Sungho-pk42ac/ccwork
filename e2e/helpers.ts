import { APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3001';

/** 테스트 DB를 빈 상태로 초기화 */
export async function resetDB(request: APIRequestContext) {
  const res = await request.get(`${API_URL}/notes`);
  const notes: { id: string }[] = await res.json();
  await Promise.all(notes.map((n) => request.delete(`${API_URL}/notes/${n.id}`)));
}

/** 테스트용 노트를 여러 개 생성 */
export async function seedNotes(
  request: APIRequestContext,
  notes: { title: string; content: string; tags?: string[] }[],
) {
  const now = new Date().toISOString();
  const created = await Promise.all(
    notes.map((n) =>
      request
        .post(`${API_URL}/notes`, {
          data: { tags: [], ...n, createdAt: now, updatedAt: now },
        })
        .then((r) => r.json()),
    ),
  );
  return created as { id: string; title: string; content: string; tags: string[] }[];
}
