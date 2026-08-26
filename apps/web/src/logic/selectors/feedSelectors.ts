export interface FeedPostItem {
  id: string;
  author?: {
    displayName?: string;
    avatarUrl?: string;
    roleTag?: string;
  };
  content?: string;
  body?: string;
  mediaUrl?: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
  [key: string]: any;
}

export function selectVisiblePosts(posts: FeedPostItem[], searchQuery?: string): FeedPostItem[] {
  if (!posts || !Array.isArray(posts)) return [];
  if (!searchQuery || !searchQuery.trim()) {
    return posts;
  }
  const q = searchQuery.trim().toLowerCase();
  return posts.filter((post) => {
    const contentText = (post.content || post.body || '').toLowerCase();
    const authorName = (post.author?.displayName || '').toLowerCase();
    return contentText.includes(q) || authorName.includes(q);
  });
}
