import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NoteList } from './NoteList';

const mockNotes = [
  {
    id: '1',
    title: '리액트 학습',
    content: 'useState와 useEffect를 배웠다',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: '타입스크립트 정리',
    content: '제네릭과 유틸리티 타입을 정리했다',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    title: '오늘의 할 일',
    content: '리액트 프로젝트 완성하기',
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
];

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: mockNotes,
    loading: false,
    error: null,
    deleteNote: vi.fn(),
  }),
}));

describe('NoteList 검색 기능', () => {
  it('검색 입력 필드가 렌더링된다', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText('노트 검색...')).toBeInTheDocument();
  });

  it('제목으로 검색하면 일치하는 노트만 표시된다', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('노트 검색...'), {
      target: { value: '리액트' },
    });
    expect(screen.getByText('리액트 학습')).toBeInTheDocument();
    expect(screen.queryByText('타입스크립트 정리')).not.toBeInTheDocument();
  });

  it('본문으로 검색하면 일치하는 노트만 표시된다', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('노트 검색...'), {
      target: { value: '제네릭' },
    });
    expect(screen.getByText('타입스크립트 정리')).toBeInTheDocument();
    expect(screen.queryByText('리액트 학습')).not.toBeInTheDocument();
  });

  it('검색어가 제목과 본문 모두에서 매칭된다', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('노트 검색...'), {
      target: { value: '리액트' },
    });
    // '리액트 학습' (제목 매칭) + '오늘의 할 일' (본문에 '리액트' 포함)
    expect(screen.getByText('리액트 학습')).toBeInTheDocument();
    expect(screen.getByText('오늘의 할 일')).toBeInTheDocument();
    expect(screen.queryByText('타입스크립트 정리')).not.toBeInTheDocument();
  });

  it('대소문자를 무시하고 검색한다', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('노트 검색...'), {
      target: { value: 'USESTATE' },
    });
    expect(screen.getByText('리액트 학습')).toBeInTheDocument();
  });

  it('검색 결과가 없으면 안내 메시지를 표시한다', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('노트 검색...'), {
      target: { value: '존재하지않는내용' },
    });
    expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('검색 중 결과 개수를 표시한다', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('노트 검색...'), {
      target: { value: '리액트' },
    });
    expect(screen.getByText('검색 결과 2개')).toBeInTheDocument();
  });

  it('초기화 버튼을 누르면 검색이 리셋된다', () => {
    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText('노트 검색...');
    fireEvent.change(input, { target: { value: '리액트' } });
    fireEvent.click(screen.getByText('✕'));
    expect(input).toHaveValue('');
    expect(screen.getByText(`노트 ${mockNotes.length}개`)).toBeInTheDocument();
  });
});
