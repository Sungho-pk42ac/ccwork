import { describe, it, expect } from 'vitest';
import { Note } from './note';
import * as fs from 'fs';
import * as path from 'path';

describe('Note 인터페이스', () => {
  describe('정상', () => {
    it('should have tags field of type string[] when interface is defined', () => {
      const note: Note = {
        id: '1',
        title: '테스트',
        content: '내용',
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      expect(note.tags).toEqual([]);
      expect(Array.isArray(note.tags)).toBe(true);
    });
  });
});

describe('db.json', () => {
  describe('정상', () => {
    it('should have tags: [] on all existing notes when data migration is applied', () => {
      const dbPath = path.resolve(__dirname, '../../db.json');
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      const notes: Note[] = db.notes;

      expect(notes.length).toBeGreaterThan(0);
      notes.forEach((note) => {
        expect(note).toHaveProperty('tags');
        expect(Array.isArray(note.tags)).toBe(true);
      });
    });
  });
});
