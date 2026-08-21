import type { FeedPostProps } from '../components/features/home/FeedPostCard';

export class FeedStore {
  private static posts: FeedPostProps[] = [];
  private static searchQuery: string = '';
  private static sortBy: 'RECENT' | 'POPULAR' | 'TRENDING' = 'RECENT';

  static getPosts(): FeedPostProps[] {
    return this.posts;
  }

  static setPosts(posts: FeedPostProps[]): void {
    this.posts = posts;
  }

  static addPost(post: FeedPostProps): void {
    this.posts = [post, ...this.posts];
  }

  static removePost(postId: string): void {
    this.posts = this.posts.filter((p) => p.id !== postId);
  }

  static getSearchQuery(): string {
    return this.searchQuery;
  }

  static setSearchQuery(query: string): void {
    this.searchQuery = query;
  }

  static getSortBy(): 'RECENT' | 'POPULAR' | 'TRENDING' {
    return this.sortBy;
  }

  static setSortBy(sort: 'RECENT' | 'POPULAR' | 'TRENDING'): void {
    this.sortBy = sort;
  }
}
