import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
