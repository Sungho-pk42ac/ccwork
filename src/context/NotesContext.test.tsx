import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotesProvider, useNotes } from './NotesContext';
import * as api from '../api/notes';
import { Note } from '../types/note';

vi.mock('../api/notes');

const mockedApi = vi.mocked(api);

function TestConsumer() {
  const { notes, createNote } = useNotes();
  return (
    <div>
      <span data-testid="notes-count">{notes.length}</span>
      {notes.map((n) => (
        <span key={n.id} data-testid={`note-tags-${n.id}`}>
          {JSON.stringify(n.tags)}
        </span>
      ))}
      <button onClick={() => createNote('제목', '내용')}>생성</button>
    </div>
  );
}

/** issue #7 전용 — tags 매개변수를 전달하는 TestConsumer */
function TestConsumerWithTags() {
  const { notes, createNote, updateNote } = useNotes();
  return (
    <div>
      <span data-testid="notes-count">{notes.length}</span>
      {notes.map((n) => (
        <span key={n.id} data-testid={`note-tags-${n.id}`}>
          {JSON.stringify(n.tags)}
        </span>
      ))}
      <button onClick={() => createNote('제목', '내용', ['react'])}>태그생성</button>
      <button onClick={() => createNote('제목', '내용')}>태그없이생성</button>
      <button
        onClick={() => updateNote('1', { title: '제목', content: '내용', tags: ['react', 'vue'] })}
      >
        태그수정
      </button>
    </div>
  );
}

describe('fetchNotes 폴백', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('정상', () => {
    it('should return notes with tags as empty array when db note has tags: []', async () => {
      const mockNotes: Note[] = [
        { id: '1', title: '노트1', content: '내용', tags: [], createdAt: '', updatedAt: '' },
      ];
      mockedApi.fetchNotes.mockResolvedValue(mockNotes);

      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('note-tags-1')).toHaveTextContent('[]');
      });
    });
  });

  describe('경계', () => {
    it('should fallback to empty array when note.tags is undefined', async () => {
      const mockNotes = [
        { id: '1', title: '노트1', content: '내용', createdAt: '', updatedAt: '' },
      ] as Note[];
      mockedApi.fetchNotes.mockResolvedValue(mockNotes);

      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('note-tags-1')).toHaveTextContent('[]');
      });
    });

    it('should fallback to empty array when note.tags is null', async () => {
      const mockNotes = [
        { id: '1', title: '노트1', content: '내용', tags: null, createdAt: '', updatedAt: '' },
      ] as unknown as Note[];
      mockedApi.fetchNotes.mockResolvedValue(mockNotes);

      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('note-tags-1')).toHaveTextContent('[]');
      });
    });

    it('should preserve existing tags when note has tags: ["react"]', async () => {
      const mockNotes: Note[] = [
        { id: '1', title: '노트1', content: '내용', tags: ['react'], createdAt: '', updatedAt: '' },
      ];
      mockedApi.fetchNotes.mockResolvedValue(mockNotes);

      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('note-tags-1')).toHaveTextContent('["react"]');
      });
    });
  });

  describe('예외', () => {
    it('should not throw runtime error when iterating over notes without tags field', async () => {
      const mockNotes = [
        { id: '1', title: '노트1', content: '내용', createdAt: '', updatedAt: '' },
        { id: '2', title: '노트2', content: '내용2', createdAt: '', updatedAt: '' },
      ] as Note[];
      mockedApi.fetchNotes.mockResolvedValue(mockNotes);

      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('notes-count')).toHaveTextContent('2');
      });
    });
  });
});

describe('createNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.fetchNotes.mockResolvedValue([]);
  });

  describe('정상', () => {
    it('should include tags: [] in request body when creating a new note', async () => {
      const newNote: Note = {
        id: '99',
        title: '제목',
        content: '내용',
        tags: [],
        createdAt: '',
        updatedAt: '',
      };
      mockedApi.createNote.mockResolvedValue(newNote);

      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('notes-count')).toHaveTextContent('0');
      });

      screen.getByText('생성').click();

      await waitFor(() => {
        expect(mockedApi.createNote).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }));
      });
    });
  });

  describe('경계', () => {
    it('should send tags: [] when tags parameter is an empty array', async () => {
      const newNote: Note = {
        id: '99',
        title: '제목',
        content: '내용',
        tags: [],
        createdAt: '',
        updatedAt: '',
      };
      mockedApi.createNote.mockResolvedValue(newNote);

      render(
        <NotesProvider>
          <TestConsumer />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('notes-count')).toHaveTextContent('0');
      });

      screen.getByText('생성').click();

      await waitFor(() => {
        const callArg = mockedApi.createNote.mock.calls[0][0];
        expect(callArg).toHaveProperty('tags');
        expect(callArg.tags).toEqual([]);
      });
    });
  });
});

describe('createNote tags 매개변수 (issue #7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.fetchNotes.mockResolvedValue([]);
  });

  describe('정상', () => {
    it('should pass tags to api.createNote when tags parameter is provided', async () => {
      const newNote: Note = {
        id: '99',
        title: '제목',
        content: '내용',
        tags: ['react'],
        createdAt: '',
        updatedAt: '',
      };
      mockedApi.createNote.mockResolvedValue(newNote);

      render(
        <NotesProvider>
          <TestConsumerWithTags />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('notes-count')).toHaveTextContent('0');
      });

      screen.getByText('태그생성').click();

      await waitFor(() => {
        expect(mockedApi.createNote).toHaveBeenCalledWith(
          expect.objectContaining({ title: '제목', content: '내용', tags: ['react'] }),
        );
      });
    });

    it('should add note with tags to local state after successful creation', async () => {
      const newNote: Note = {
        id: '99',
        title: '제목',
        content: '내용',
        tags: ['react'],
        createdAt: '',
        updatedAt: '',
      };
      mockedApi.createNote.mockResolvedValue(newNote);

      render(
        <NotesProvider>
          <TestConsumerWithTags />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('notes-count')).toHaveTextContent('0');
      });

      screen.getByText('태그생성').click();

      await waitFor(() => {
        expect(screen.getByTestId('notes-count')).toHaveTextContent('1');
        expect(screen.getByTestId('note-tags-99')).toHaveTextContent('["react"]');
      });
    });
  });

  describe('경계', () => {
    it('should fallback to empty array when tags parameter is omitted', async () => {
      const newNote: Note = {
        id: '99',
        title: '제목',
        content: '내용',
        tags: [],
        createdAt: '',
        updatedAt: '',
      };
      mockedApi.createNote.mockResolvedValue(newNote);

      render(
        <NotesProvider>
          <TestConsumerWithTags />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('notes-count')).toHaveTextContent('0');
      });

      screen.getByText('태그없이생성').click();

      await waitFor(() => {
        expect(mockedApi.createNote).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }));
      });
    });
  });
});

describe('updateNote tags 전달 (issue #7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const existingNote: Note = {
      id: '1',
      title: '기존노트',
      content: '내용',
      tags: ['react'],
      createdAt: '',
      updatedAt: '',
    };
    mockedApi.fetchNotes.mockResolvedValue([existingNote]);
  });

  describe('정상', () => {
    it('should pass tags in updates to api.updateNote', async () => {
      const updatedNote: Note = {
        id: '1',
        title: '제목',
        content: '내용',
        tags: ['react', 'vue'],
        createdAt: '',
        updatedAt: '',
      };
      mockedApi.updateNote.mockResolvedValue(updatedNote);

      render(
        <NotesProvider>
          <TestConsumerWithTags />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('notes-count')).toHaveTextContent('1');
      });

      screen.getByText('태그수정').click();

      await waitFor(() => {
        expect(mockedApi.updateNote).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ tags: ['react', 'vue'] }),
        );
      });
    });
  });
});
