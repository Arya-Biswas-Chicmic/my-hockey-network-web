import type { FeedPostProps } from '../components/features/home/FeedPostCard';

export const MOCK_FEED_POSTS: FeedPostProps[] = [
  {
    id: 'post-mock-1',
    authorName: 'Sarah Jenkins',
    authorRole: 'Head Coach • Toronto Junior Canadiens',
    authorTime: '2 hours ago',
    authorAvatar: '/userPlaceholder.png',
    content: 'Great intensity in training today! Super proud of the players executing our breakout strategy cleanly.',
    likesCount: 14,
    commentsCount: 3,
    repostCount: 1,
    isFollowing: true,
  },
  {
    id: 'post-mock-2',
    authorName: 'Alex Mercer',
    authorRole: 'Forward • HC Bloemendaal #19',
    authorTime: 'Yesterday',
    authorAvatar: '/userPlaceholder.png',
    content: 'Looking forward to the upcoming championship match this weekend in Toronto!',
    likesCount: 28,
    commentsCount: 7,
    repostCount: 4,
    isFollowing: false,
  },
];
