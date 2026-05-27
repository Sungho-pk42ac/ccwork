import { useState } from 'react';
import { normalizeTag, isDuplicateTag } from '../utils/tagUtils';

interface UseTagsReturn {
  tags: string[];
  addTag: (raw: string) => void;
  removeTag: (tag: string) => void;
  resetTags: (next: string[]) => void;
}

/** 태그 상태 관리 커스텀 훅 */
export function useTags(initialTags: string[] = []): UseTagsReturn {
  const [tags, setTags] = useState<string[]>(initialTags);

  const addTag = (raw: string) => {
    const normalized = normalizeTag(raw);
    if (normalized === '') return;
    if (isDuplicateTag(normalized, tags)) return;
    setTags((prev) => [...prev, normalized]);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const resetTags = (next: string[]) => {
    setTags(next);
  };

  return { tags, addTag, removeTag, resetTags };
}
