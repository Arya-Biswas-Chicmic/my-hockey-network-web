import { Button } from '@/components/common/Button';
import { FallbackImage } from '@/components/ui/fallback-image';
import { useWhoToFollow } from '@/hooks/use-who-to-follow';

export interface WhoToFollowWidgetProps {
  onViewAll?: () => void;
}

/** Home sidebar's "Who to follow" card — a short people-you-may-know list
 * with an inline Follow action. Replaces the fabricated-data `MatchesWidget`
 * in that slot per the new sidebar-nav design. */
export function WhoToFollowWidget({ onViewAll }: Readonly<WhoToFollowWidgetProps>) {
  const { people, isLoading, followedIds, followingId, handleFollow } = useWhoToFollow();

  if (!isLoading && people.length === 0) return null;

  return (
    <div className="mhn-sidebar-card mhn-who-to-follow-card">
      <div className="mhn-sidebar-card-header">
        <h3 className="mhn-sidebar-card-title">Who to follow</h3>
        {onViewAll && (
          <Button className="mhn-sidebar-view-all" onClick={onViewAll}>
            View All
          </Button>
        )}
      </div>

      <div className="mhn-who-to-follow-list">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="mhn-who-to-follow-row mhn-notif-skeleton-row">
              <div className="mhn-shimmer-box mhn-who-to-follow-avatar" />
              <div className="mhn-shimmer-box mhn-notif-skeleton-title-line" />
            </div>
          ))
        ) : (
          people.map((person) => {
            const isFollowed = followedIds.has(person.id);
            return (
              <div key={person.id} className="mhn-who-to-follow-row">
                <div className="mhn-who-to-follow-avatar">
                  <FallbackImage src={person.avatar} alt={person.name} fill className="mhn-avatar-img" />
                </div>
                <span className="mhn-who-to-follow-name">{person.name}</span>
                <Button
                  className="mhn-who-to-follow-btn"
                  disabled={isFollowed || followingId === person.id}
                  onClick={() => handleFollow(person)}
                >
                  {isFollowed ? 'Following' : 'Follow'}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
