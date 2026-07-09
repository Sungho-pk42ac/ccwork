import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteItem } from './NoteItem';
import { Note } from '../types/note';

/**
 * NoteItem 태그 칩 표시 테스트용 노트 팩토리
 */
function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: '1',
    title: '학습 노트',
    content: '테스트 내용입니다',
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const defaultProps = {
  isSelected: false,
  onSelect: vi.fn(),
  onDelete: vi.fn(),
};

describe('NoteItem 태그 칩 읽기 전용 표시', () => {
  describe('정상 (Happy Path)', () => {
    it('태그가 있는 노트에 태그 칩이 표시된다', () => {
      const note = createNote({ tags: ['react', 'hooks'] });
      render(<NoteItem note={note} {...defaultProps} />);

      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('hooks')).toBeInTheDocument();
    });

    it('태그 칩은 읽기 전용이다 (X 버튼 없음)', () => {
      const note = createNote({ tags: ['react'] });
      render(<NoteItem note={note} {...defaultProps} />);

      const chipText = screen.getByText('react');
      // 칩의 부모 요소(칩 자체)에서 삭제 관련 버튼이 없어야 함
      const chip = chipText.closest('.note-label')!;
      expect(chip).toBeTruthy();

      // 칩 내부에 X, ×, 삭제, remove, delete 버튼이 없어야 함
      const chipEl = within(chip as HTMLElement);
      expect(chipEl.queryByRole('button')).toBeNull();
      expect(chipEl.queryByText('×')).toBeNull();
      expect(chipEl.queryByText('✕')).toBeNull();
      expect(chipEl.queryByText('X')).toBeNull();
      expect(chipEl.queryByLabelText(/삭제|제거|remove|delete/i)).toBeNull();
    });

    it('태그 칩에 클릭 이벤트가 없다', async () => {
      const onSelect = vi.fn();
      const note = createNote({ tags: ['react'] });
      render(<NoteItem note={note} {...defaultProps} onSelect={onSelect} />);

      const chip = screen.getByText('react').closest('.note-label')!;
      // 칩 자체에 onClick 핸들러가 없어야 함
      expect(chip).not.toHaveAttribute('onclick');
      // 칩에 role="button" 등이 없어야 함
      expect(chip).not.toHaveAttribute('role', 'button');

      // 칩을 클릭하면 NoteItem의 onSelect로 버블링됨
      const user = userEvent.setup();
      await user.click(chip as HTMLElement);
      expect(onSelect).toHaveBeenCalledWith('1');
    });

    it('여러 개의 태그가 모두 표시된다', () => {
      const note = createNote({ tags: ['react', 'hooks', 'typescript'] });
      render(<NoteItem note={note} {...defaultProps} />);

      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('hooks')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();

      // note-label 클래스를 가진 칩이 3개여야 함
      const chips = document.querySelectorAll('.note-label');
      expect(chips).toHaveLength(3);
    });

    it('태그 칩이 제목, 내용 미리보기, 날짜와 함께 올바른 순서로 표시된다', () => {
      const note = createNote({
        title: '학습',
        content: '내용',
        tags: ['react'],
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      const { container } = render(<NoteItem note={note} {...defaultProps} />);

      // DOM 순서 검증: 제목 → 내용 → 태그 → 날짜
      const allText = container.textContent || '';
      const titleIdx = allText.indexOf('학습');
      const contentIdx = allText.indexOf('내용');
      const tagIdx = allText.indexOf('react');
      const dateIdx = allText.indexOf('2026');

      expect(titleIdx).toBeLessThan(contentIdx);
      expect(contentIdx).toBeLessThan(tagIdx);
      expect(tagIdx).toBeLessThan(dateIdx);
    });
  });

  describe('경계 (Boundary)', () => {
    it('태그가 빈 배열이면 태그 영역이 렌더링되지 않는다', () => {
      const note = createNote({ tags: [] });
      render(<NoteItem note={note} {...defaultProps} />);

      // 태그 칩 컨테이너(flex-wrap div)가 DOM에 존재하지 않아야 함
      const chipContainer = document.querySelector('.flex.flex-wrap');
      expect(chipContainer).toBeNull();
      // note-label 클래스를 가진 요소도 없어야 함
      expect(document.querySelectorAll('.note-label')).toHaveLength(0);
    });

    it('tags가 undefined이면 태그 영역이 렌더링되지 않는다', () => {
      // tags가 undefined인 기존 노트 폴백 케이스
      const note = createNote();
      // tags를 강제로 undefined로 설정 (기존 데이터 호환성)
      (note as unknown as Record<string, unknown>).tags = undefined;

      // 에러 없이 렌더링되어야 함
      expect(() => {
        render(<NoteItem note={note} {...defaultProps} />);
      }).not.toThrow();

      const chipContainer = document.querySelector('.flex.flex-wrap');
      expect(chipContainer).toBeNull();
    });

    it('태그가 1개만 있어도 정상 표시된다', () => {
      const note = createNote({ tags: ['react'] });
      render(<NoteItem note={note} {...defaultProps} />);

      expect(screen.getByText('react')).toBeInTheDocument();
      expect(document.querySelectorAll('.note-label')).toHaveLength(1);
    });

    it('태그가 있는 노트와 없는 노트가 혼재해도 레이아웃이 깨지지 않는다', () => {
      const notes = [
        createNote({ id: '1', tags: ['react', 'hooks'] }),
        createNote({ id: '2', tags: [] }),
        createNote({ id: '3', tags: ['vue'] }),
      ];

      // 각 NoteItem을 독립적으로 렌더링
      const { unmount: unmount1 } = render(<NoteItem note={notes[0]} {...defaultProps} />);
      expect(document.querySelectorAll('.note-label')).toHaveLength(2);
      unmount1();

      const { unmount: unmount2 } = render(<NoteItem note={notes[1]} {...defaultProps} />);
      expect(document.querySelectorAll('.note-label')).toHaveLength(0);
      unmount2();

      render(<NoteItem note={notes[2]} {...defaultProps} />);
      expect(document.querySelectorAll('.note-label')).toHaveLength(1);
    });

    it('긴 태그 텍스트가 칩 내에서 표시된다', () => {
      const longTag = 'very-long-tag-name-example';
      const note = createNote({ tags: [longTag] });
      render(<NoteItem note={note} {...defaultProps} />);

      expect(screen.getByText(longTag)).toBeInTheDocument();
      // 칩이 정상적으로 렌더링됨
      const chip = document.querySelector('.note-label');
      expect(chip).toBeTruthy();
      expect(chip!.textContent).toContain(longTag);
    });
  });

  describe('예외 (Exception)', () => {
    it('note.tags가 null이어도 에러 없이 렌더링된다', () => {
      const note = createNote();
      // tags를 강제로 null로 설정 (비정상 데이터)
      (note as unknown as Record<string, unknown>).tags = null;

      // 에러 없이 렌더링되어야 함
      expect(() => {
        render(<NoteItem note={note} {...defaultProps} />);
      }).not.toThrow();

      // 태그 영역이 표시되지 않아야 함
      const chipContainer = document.querySelector('.flex.flex-wrap');
      expect(chipContainer).toBeNull();
    });

    it('중복 태그가 있는 배열이 전달되어도 각각 렌더링된다', () => {
      const note = createNote({ tags: ['react', 'react'] });

      // 렌더링 자체는 정상이어야 함 (key 경고는 별도)
      expect(() => {
        render(<NoteItem note={note} {...defaultProps} />);
      }).not.toThrow();

      // 두 개의 칩이 모두 렌더링되어야 함
      const chips = document.querySelectorAll('.note-label');
      expect(chips).toHaveLength(2);
    });
  });
});
