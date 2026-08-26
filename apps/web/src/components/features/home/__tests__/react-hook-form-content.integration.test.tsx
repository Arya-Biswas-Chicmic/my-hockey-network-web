// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreatePostModal } from '@/components/features/home/CreatePostModal';
import { PostCommentSection } from '@/components/features/home/PostCommentSection';

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const { addComment } = vi.hoisted(() => ({ addComment: vi.fn() }));

vi.mock('@my-hockey-network/core', () => ({
  addComment,
  getComments: vi.fn().mockResolvedValue({ items: [] }),
}));

vi.mock('../../../../hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      profile: { displayName: 'Test Player', avatarUrl: null, type: 'PLAYER' },
    },
  }),
}));

vi.mock('../../../../hooks/use-feed-permissions', () => ({
  useFeedPermissions: () => ({ requirePermission: () => true }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('React Hook Form content forms', () => {
  it('submits normalized post content from the shared form flow', async () => {
    const onSubmit = vi.fn();
    render(<CreatePostModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('What do you want to talk about?'), {
      target: { value: '  Hockey update  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(
      'Hockey update',
      undefined,
      expect.objectContaining({ audience: 'Everyone' }),
      undefined
    ));
  });

  it('submits and resets a valid comment', async () => {
    addComment.mockResolvedValue({
      comment: { id: 'comment-1', body: 'Nice play', createdAt: '2026-08-26T00:00:00.000Z' },
    });
    renderWithQueryClient(<PostCommentSection postId="post-1" />);

    const input = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(input, { target: { value: '  Nice play  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send comment' }));

    await waitFor(() => expect(addComment).toHaveBeenCalledWith('post-1', 'Nice play'));
    await waitFor(() => expect((input as HTMLInputElement).value).toBe(''));
  });
});
