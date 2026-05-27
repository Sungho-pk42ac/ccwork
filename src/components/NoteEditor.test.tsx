import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import { NotesProvider } from '../context/NotesContext';
import * as api from '../api/notes';
import { Note } from '../types/note';

vi.mock('../api/notes');
const mockedApi = vi.mocked(api);

const mockNotes: Note[] = [
  {
    id: '1',
    title: '노트A',
    content: '내용A',
    tags: ['react', 'hooks'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: '노트B',
    content: '내용B',
    tags: ['vue', 'typescript'],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

function renderEditor(props: { selectedNoteId: string | null; isCreating: boolean }) {
  return render(
    <NotesProvider>
      <NoteEditor {...props} onDone={vi.fn()} />
    </NotesProvider>,
  );
}

describe('NoteEditor 태그 통합', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.fetchNotes.mockResolvedValue(mockNotes);
  });

  describe('정상', () => {
    it('should render TagInput component with useTags integration', async () => {
      renderEditor({ selectedNoteId: '1', isCreating: false });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/태그/i)).toBeInTheDocument();
      });
    });

    it('should reset tags when selected note changes', async () => {
      const { rerender } = render(
        <NotesProvider>
          <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('react')).toBeInTheDocument();
        expect(screen.getByText('hooks')).toBeInTheDocument();
      });

      rerender(
        <NotesProvider>
          <NoteEditor selectedNoteId="2" isCreating={false} onDone={vi.fn()} />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('vue')).toBeInTheDocument();
        expect(screen.getByText('typescript')).toBeInTheDocument();
      });
    });

    it('should start with empty tags when in creating mode', async () => {
      renderEditor({ selectedNoteId: null, isCreating: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/태그/i)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('tag-chip')).not.toBeInTheDocument();
    });
  });
});

describe('NoteEditor 태그 저장 (issue #7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.fetchNotes.mockResolvedValue(mockNotes);
  });

  describe('정상', () => {
    it('should pass tags to createNote when saving a new note', async () => {
      const user = userEvent.setup();
      const newNote: Note = {
        id: '99',
        title: '학습 노트',
        content: '',
        tags: ['react', 'hooks'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      mockedApi.createNote.mockResolvedValue(newNote);

      renderEditor({ selectedNoteId: null, isCreating: true });

      // 제목 입력
      const titleInput = screen.getByPlaceholderText('제목');
      await user.type(titleInput, '학습 노트');

      // 태그 입력
      const tagInput = screen.getByPlaceholderText(/태그/i);
      await user.type(tagInput, 'react{Enter}');
      await user.type(tagInput, 'hooks{Enter}');

      // 저장 버튼 클릭
      await user.click(screen.getByText('저장'));

      await waitFor(() => {
        expect(mockedApi.createNote).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '학습 노트',
            tags: ['react', 'hooks'],
          }),
        );
      });
    });

    it('should pass tags to updateNote when saving an existing note', async () => {
      const user = userEvent.setup();
      const updatedNote: Note = {
        ...mockNotes[0],
        tags: ['react', 'hooks', 'vue'],
      };
      mockedApi.updateNote.mockResolvedValue(updatedNote);

      renderEditor({ selectedNoteId: '1', isCreating: false });

      // 기존 태그가 로드될 때까지 대기
      await waitFor(() => {
        expect(screen.getByText('react')).toBeInTheDocument();
      });

      // 새 태그 추가
      const tagInput = screen.getByPlaceholderText(/태그/i);
      await user.type(tagInput, 'vue{Enter}');

      // 저장 버튼 클릭
      await user.click(screen.getByText('저장'));

      await waitFor(() => {
        expect(mockedApi.updateNote).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            tags: expect.arrayContaining(['react', 'hooks', 'vue']),
          }),
        );
      });
    });

    it('should display saved tags when re-selecting a note', async () => {
      const savedNote: Note = {
        id: '1',
        title: '노트A',
        content: '내용A',
        tags: ['react', 'hooks'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      mockedApi.fetchNotes.mockResolvedValue([savedNote]);

      const { rerender } = render(
        <NotesProvider>
          <NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />
        </NotesProvider>,
      );

      // 노트 선택으로 전환
      rerender(
        <NotesProvider>
          <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />
        </NotesProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('react')).toBeInTheDocument();
        expect(screen.getByText('hooks')).toBeInTheDocument();
      });
    });
  });

  describe('경계', () => {
    it('should pass empty tags array when saving a new note without tags', async () => {
      const user = userEvent.setup();
      const newNote: Note = {
        id: '99',
        title: '빈 태그 노트',
        content: '',
        tags: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      mockedApi.createNote.mockResolvedValue(newNote);

      renderEditor({ selectedNoteId: null, isCreating: true });

      // 제목만 입력, 태그 없음
      const titleInput = screen.getByPlaceholderText('제목');
      await user.type(titleInput, '빈 태그 노트');

      // 저장 버튼 클릭
      await user.click(screen.getByText('저장'));

      await waitFor(() => {
        expect(mockedApi.createNote).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '빈 태그 노트',
            tags: [],
          }),
        );
      });
    });

    it('should pass empty tags array when all tags are removed from existing note', async () => {
      const user = userEvent.setup();
      const noteWithOneTag: Note[] = [
        {
          id: '1',
          title: '노트A',
          content: '내용A',
          tags: ['react'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      mockedApi.fetchNotes.mockResolvedValue(noteWithOneTag);
      mockedApi.updateNote.mockResolvedValue({
        ...noteWithOneTag[0],
        tags: [],
      });

      renderEditor({ selectedNoteId: '1', isCreating: false });

      // 태그가 로드될 때까지 대기
      await waitFor(() => {
        expect(screen.getByText('react')).toBeInTheDocument();
      });

      // 태그 삭제 버튼 클릭
      const removeButton = screen
        .getByText('react')
        .closest('[data-testid="tag-chip"]')
        ?.querySelector('button');
      if (removeButton) {
        await user.click(removeButton);
      }

      // 저장 버튼 클릭
      await user.click(screen.getByText('저장'));

      await waitFor(() => {
        expect(mockedApi.updateNote).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            tags: [],
          }),
        );
      });
    });

    it('should show empty tags when opening a note without tags field', async () => {
      const noteWithoutTags = [
        {
          id: '1',
          title: '노트A',
          content: '내용A',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ] as Note[];
      mockedApi.fetchNotes.mockResolvedValue(noteWithoutTags);

      renderEditor({ selectedNoteId: '1', isCreating: false });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/태그/i)).toBeInTheDocument();
      });

      // 태그 칩이 없어야 함
      expect(screen.queryByTestId('tag-chip')).not.toBeInTheDocument();
    });
  });

  describe('예외', () => {
    it('should preserve tags when save fails due to API error', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedApi.createNote.mockRejectedValue(new Error('API 에러'));

      renderEditor({ selectedNoteId: null, isCreating: true });

      // 제목 입력
      const titleInput = screen.getByPlaceholderText('제목');
      await user.type(titleInput, '에러 노트');

      // 태그 입력
      const tagInput = screen.getByPlaceholderText(/태그/i);
      await user.type(tagInput, 'react{Enter}');
      await user.type(tagInput, 'hooks{Enter}');

      // 저장 버튼 클릭
      await user.click(screen.getByText('저장'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // 태그가 그대로 유지됨
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('hooks')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should not save when title is empty even if tags exist', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderEditor({ selectedNoteId: null, isCreating: true });

      // 제목 비우고 태그만 입력
      const tagInput = screen.getByPlaceholderText(/태그/i);
      await user.type(tagInput, 'react{Enter}');

      // 저장 버튼 클릭
      await user.click(screen.getByText('저장'));

      // createNote가 호출되지 않아야 함
      expect(mockedApi.createNote).not.toHaveBeenCalled();
      expect(mockedApi.updateNote).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
