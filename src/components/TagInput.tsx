import { useState, KeyboardEvent, ChangeEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onAddTag: (raw: string) => void;
  onRemoveTag: (tag: string) => void;
}

/** 태그 입력 + 칩 표시 프레젠테이션 컴포넌트 */
export function TagInput({ tags, onAddTag, onRemoveTag }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim() === '') return;
      onAddTag(input);
      setInput('');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const [before, ...rest] = value.split(',');
      if (before.trim() !== '') {
        onAddTag(before);
      }
      setInput(rest.join(','));
    } else {
      setInput(value);
    }
  };

  return (
    <div className="mt-[0.7rem]">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-[0.35rem] mb-[0.7rem]">
          {tags.map((tag) => (
            <span
              key={tag}
              data-testid="tag-chip"
              className="inline-flex items-center bg-[#dbe4e7] text-[#586064] rounded-full px-[0.75rem] py-[0.25rem] text-[0.75rem]"
            >
              {tag}
              <button
                type="button"
                aria-label={`${tag} 삭제`}
                onClick={() => onRemoveTag(tag)}
                className="ml-[0.35rem] text-[#586064] hover:text-[#2b3437] cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="태그 입력"
        className="w-full bg-white border border-[rgba(171,179,183,0.15)] rounded-lg px-[0.7rem] py-[0.35rem] text-sm text-[#2b3437] outline-none focus:border-[#0053dc]"
      />
    </div>
  );
}
