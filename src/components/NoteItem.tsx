import { Note } from '../types/note';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

/** 개별 노트 카드 — 제목, 내용 미리보기, 태그 칩, 날짜를 읽기 전용으로 표시 */
export function NoteItem({ note, isSelected, onSelect, onDelete }: NoteItemProps) {
  return (
    <div
      onClick={() => onSelect(note.id)}
      className={`bg-card rounded-2xl p-4 border cursor-pointer transition-all ${
        isSelected
          ? 'border-foreground shadow-[0_2px_12px_rgba(0,0,0,0.12)]'
          : 'border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 flex-1">
          {note.title || '(제목 없음)'}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-muted-foreground hover:text-destructive text-xs shrink-0 transition-colors cursor-pointer"
        >
          삭제
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
        {note.content || '(내용 없음)'}
      </p>
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-[0.35rem] mt-2">
          {note.tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="note-label inline-flex items-center bg-[#dbe4e7] text-[#586064] rounded-full px-[0.5rem] py-[0.1rem] text-[0.65rem]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground/70 mt-2">
        {new Date(note.updatedAt).toLocaleDateString('ko-KR')}
      </p>
    </div>
  );
}
