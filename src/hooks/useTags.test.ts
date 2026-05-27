import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTags } from './useTags';

describe('useTags', () => {
  describe('정상', () => {
    it('should initialize with empty array when no initialTags provided', () => {
      const { result } = renderHook(() => useTags());
      expect(result.current.tags).toEqual([]);
    });

    it('should initialize with given tags when initialTags is provided', () => {
      const { result } = renderHook(() => useTags(['react', 'vue']));
      expect(result.current.tags).toEqual(['react', 'vue']);
    });
  });
});

describe('useTags.addTag', () => {
  describe('정상', () => {
    it('should add normalized tag "react" when input is "React"', () => {
      const { result } = renderHook(() => useTags());
      act(() => result.current.addTag('React'));
      expect(result.current.tags).toEqual(['react']);
    });

    it('should add multiple tags in insertion order when called sequentially', () => {
      const { result } = renderHook(() => useTags());
      act(() => result.current.addTag('react'));
      act(() => result.current.addTag('vue'));
      act(() => result.current.addTag('angular'));
      expect(result.current.tags).toEqual(['react', 'vue', 'angular']);
    });
  });

  describe('경계', () => {
    it('should not add tag when input is empty string ""', () => {
      const { result } = renderHook(() => useTags());
      act(() => result.current.addTag(''));
      expect(result.current.tags).toEqual([]);
    });

    it('should not add tag when input is whitespace only "   "', () => {
      const { result } = renderHook(() => useTags());
      act(() => result.current.addTag('   '));
      expect(result.current.tags).toEqual([]);
    });

    it('should not add duplicate when "React" is added and "react" already exists', () => {
      const { result } = renderHook(() => useTags(['react']));
      act(() => result.current.addTag('React'));
      expect(result.current.tags).toEqual(['react']);
    });

    it('should not add duplicate when same tag is added twice consecutively', () => {
      const { result } = renderHook(() => useTags());
      act(() => result.current.addTag('react'));
      act(() => result.current.addTag('react'));
      expect(result.current.tags).toEqual(['react']);
    });
  });

  describe('예외', () => {
    it('should not modify tags array when normalizeTag returns empty string', () => {
      const { result } = renderHook(() => useTags(['existing']));
      act(() => result.current.addTag('\t\n'));
      expect(result.current.tags).toEqual(['existing']);
    });

    it('should not modify tags array when isDuplicateTag returns true', () => {
      const { result } = renderHook(() => useTags(['react']));
      act(() => result.current.addTag('  REACT  '));
      expect(result.current.tags).toEqual(['react']);
    });
  });
});

describe('useTags.removeTag', () => {
  describe('정상', () => {
    it('should remove "react" from tags when tags is ["react", "vue"]', () => {
      const { result } = renderHook(() => useTags(['react', 'vue']));
      act(() => result.current.removeTag('react'));
      expect(result.current.tags).toEqual(['vue']);
    });
  });

  describe('경계', () => {
    it('should not change tags when removing a tag that does not exist', () => {
      const { result } = renderHook(() => useTags(['react']));
      act(() => result.current.removeTag('vue'));
      expect(result.current.tags).toEqual(['react']);
    });
  });
});

describe('useTags.resetTags', () => {
  describe('정상', () => {
    it('should replace tags with ["new1", "new2"] when called with that array', () => {
      const { result } = renderHook(() => useTags(['old']));
      act(() => result.current.resetTags(['new1', 'new2']));
      expect(result.current.tags).toEqual(['new1', 'new2']);
    });

    it('should replace tags with empty array when called with []', () => {
      const { result } = renderHook(() => useTags(['react', 'vue']));
      act(() => result.current.resetTags([]));
      expect(result.current.tags).toEqual([]);
    });
  });
});
