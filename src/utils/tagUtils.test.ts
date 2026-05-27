import { describe, it, expect } from 'vitest';
import { normalizeTag, isDuplicateTag } from './tagUtils';

describe('normalizeTag', () => {
  describe('정상', () => {
    it('should return "react" when input is "React"', () => {
      expect(normalizeTag('React')).toBe('react');
    });

    it('should return "react" when input is "  React  "', () => {
      expect(normalizeTag('  React  ')).toBe('react');
    });

    it('should return "typescript" when input is "TypeScript"', () => {
      expect(normalizeTag('TypeScript')).toBe('typescript');
    });
  });

  describe('경계', () => {
    it('should return "" when input is ""', () => {
      expect(normalizeTag('')).toBe('');
    });

    it('should return "" when input is "   " (whitespace only)', () => {
      expect(normalizeTag('   ')).toBe('');
    });

    it('should return "a" when input is " a " (single character with spaces)', () => {
      expect(normalizeTag(' a ')).toBe('a');
    });
  });

  describe('예외', () => {
    it('should return "" when input contains only tabs and newlines "\\t\\n"', () => {
      expect(normalizeTag('\t\n')).toBe('');
    });
  });
});

describe('isDuplicateTag', () => {
  describe('정상', () => {
    it('should return true when tag "React" exists as "react" in existingTags', () => {
      expect(isDuplicateTag('React', ['react', 'typescript'])).toBe(true);
    });

    it('should return true when tag "react" exactly matches in existingTags', () => {
      expect(isDuplicateTag('react', ['react', 'typescript'])).toBe(true);
    });

    it('should return false when tag "vue" does not exist in ["react", "typescript"]', () => {
      expect(isDuplicateTag('vue', ['react', 'typescript'])).toBe(false);
    });
  });

  describe('경계', () => {
    it('should return false when existingTags is empty array', () => {
      expect(isDuplicateTag('react', [])).toBe(false);
    });

    it('should return false when tag is "" and existingTags is ["react"]', () => {
      expect(isDuplicateTag('', ['react'])).toBe(false);
    });
  });

  describe('예외', () => {
    it('should return false when tag is "   " (whitespace only) and existingTags is ["react"]', () => {
      expect(isDuplicateTag('   ', ['react'])).toBe(false);
    });
  });
});
