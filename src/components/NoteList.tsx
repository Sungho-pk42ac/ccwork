import { useState, useMemo } from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

/**
 * @description 노트 목록 + 검색 필터링 컴포넌트
 */
export function NoteList({ selectedNoteId, onSelect }: NoteListProps) {
  const { notes, loading, error, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query),
    );
  }, [notes, searchQuery]);

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-8">로딩 중...</p>;
  }

  if (error) {
    return <p className="text-sm text-muted-foreground text-center py-8">오류: {error}</p>;
  }

  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">노트가 없습니다</p>;
  }

  return (
    <>
      <div className="relative mb-2">
        <input
          type="text"
          placeholder="노트 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card border border-border rounded-xl px-3 py-2 pl-8 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-shadow"
        />
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground text-xs cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground px-1 pb-1">
        {searchQuery ? `검색 결과 ${filteredNotes.length}개` : `노트 ${notes.length}개`}
      </p>

      {filteredNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">검색 결과가 없습니다</p>
      ) : (
        filteredNotes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            isSelected={note.id === selectedNoteId}
            onSelect={onSelect}
            onDelete={deleteNote}
          />
        ))
      )}
    </>
  );
}
