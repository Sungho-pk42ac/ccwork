/** 태그 문자열을 정규화한다 (trim + lowercase) */
export function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase();
}

/** 정규화된 태그가 기존 목록에 존재하는지 판별한다 (대소문자 무시) */
export function isDuplicateTag(tag: string, existingTags: string[]): boolean {
  const normalized = normalizeTag(tag);
  if (normalized === '') return false;
  return existingTags.some((t) => t.toLowerCase() === normalized);
}
