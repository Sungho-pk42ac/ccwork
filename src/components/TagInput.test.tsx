import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  const defaultProps = {
    tags: [] as string[],
    onAddTag: vi.fn(),
    onRemoveTag: vi.fn(),
  };

  describe('정상', () => {
    it('should render tag chips when tags prop is provided', () => {
      render(<TagInput {...defaultProps} tags={['react', 'vue']} />);
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('vue')).toBeInTheDocument();
    });

    it('should call onAddTag when Enter key is pressed with input value', async () => {
      const onAddTag = vi.fn();
      render(<TagInput {...defaultProps} onAddTag={onAddTag} />);

      const input = screen.getByPlaceholderText(/태그/i);
      await userEvent.type(input, 'javascript{Enter}');

      expect(onAddTag).toHaveBeenCalledWith('javascript');
    });

    it('should call onAddTag when comma is typed and clear input after comma', async () => {
      const onAddTag = vi.fn();
      render(<TagInput {...defaultProps} onAddTag={onAddTag} />);

      const input = screen.getByPlaceholderText(/태그/i);
      await userEvent.type(input, 'react,');

      expect(onAddTag).toHaveBeenCalledWith('react');
    });

    it('should call onRemoveTag when chip X button is clicked', async () => {
      const onRemoveTag = vi.fn();
      render(<TagInput {...defaultProps} tags={['react']} onRemoveTag={onRemoveTag} />);

      const removeButton = screen.getByRole('button', { name: /react/i });
      await userEvent.click(removeButton);

      expect(onRemoveTag).toHaveBeenCalledWith('react');
    });

    it('should clear input field after Enter key adds a tag', async () => {
      render(<TagInput {...defaultProps} onAddTag={vi.fn()} />);

      const input = screen.getByPlaceholderText(/태그/i);
      await userEvent.type(input, 'javascript{Enter}');

      expect(input).toHaveValue('');
    });
  });

  describe('경계', () => {
    it('should not call onAddTag when Enter is pressed with empty input', async () => {
      const onAddTag = vi.fn();
      render(<TagInput {...defaultProps} onAddTag={onAddTag} />);

      const input = screen.getByPlaceholderText(/태그/i);
      await userEvent.type(input, '{Enter}');

      expect(onAddTag).not.toHaveBeenCalled();
    });

    it('should not call onAddTag when Enter is pressed with whitespace-only input', async () => {
      const onAddTag = vi.fn();
      render(<TagInput {...defaultProps} onAddTag={onAddTag} />);

      const input = screen.getByPlaceholderText(/태그/i);
      await userEvent.type(input, '   {Enter}');

      expect(onAddTag).not.toHaveBeenCalled();
    });

    it('should render no chip area when tags array is empty', () => {
      const { container } = render(<TagInput {...defaultProps} tags={[]} />);
      expect(container.querySelectorAll('[data-testid="tag-chip"]')).toHaveLength(0);
    });
  });

  describe('예외', () => {
    it('should not submit form when Enter is pressed in tag input', async () => {
      const onSubmit = vi.fn();
      render(
        <form onSubmit={onSubmit}>
          <TagInput {...defaultProps} onAddTag={vi.fn()} />
        </form>,
      );

      const input = screen.getByPlaceholderText(/태그/i);
      await userEvent.type(input, 'react{Enter}');

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
