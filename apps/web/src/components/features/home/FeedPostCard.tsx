import React, { useState } from 'react';

export interface FeedPostProps {
  id: string;
  authorName: string;
  authorRole?: string;
  authorTime?: string;
  authorAvatar?: string;
  content: string;
  postImage?: string;
  likesCount: number;
  commentsCount: number;
  isFollowing?: boolean;
}

export const FeedPostCard: React.FC<FeedPostProps> = ({
  authorName,
  authorRole = 'Official Team',
  authorTime = '1d',
  authorAvatar = '/CoachTeam.png',
  content,
  postImage,
  likesCount: initialLikes,
  commentsCount,
  isFollowing: initialFollowing = false,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const toggleFollow = () => {
    setIsFollowing(prev => !prev);
  };

  return (
    <article className="mhn-feed-post-card">
      {/* Post Header */}
      <div className="mhn-post-header">
        <div className="mhn-post-author-group">
          <div className="mhn-author-avatar-box">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="mhn-author-avatar-img"
              onError={(e) => {
                // Fallback icon if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
          <div className="mhn-author-meta">
            <h4 className="mhn-author-name">{authorName}</h4>
            <span className="mhn-author-subtitle">
              {authorRole} • {authorTime}
            </span>
          </div>
        </div>

        <div className="mhn-post-header-actions">
          <button 
            onClick={toggleFollow} 
            className={`mhn-btn-follow ${isFollowing ? 'mhn-btn-following' : ''}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="mhn-btn-more-options" aria-label="More options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mhn-post-content">
        <p className={`mhn-post-text ${!isExpanded ? 'mhn-post-text-truncated' : ''}`}>
          {content}
        </p>
        {content.length > 30 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="mhn-post-more-btn"
          >
            {isExpanded ? '... show less' : '... more'}
          </button>
        )}
      </div>

      {/* Post Image Banner */}
      {postImage && (
        <div className="mhn-post-media-container">
          <img 
            src={postImage} 
            alt="Post content media" 
            className="mhn-post-media-img"
          />
        </div>
      )}

      {/* Post Action Footer */}
      <div className="mhn-post-footer">
        <div className="mhn-post-actions-group">
          {/* Like Button */}
          <button 
            onClick={handleLike} 
            className={`mhn-action-item ${isLiked ? 'mhn-action-liked' : ''}`}
          >
           <img src="/like.png" alt="" className="like-count-icon" />
            <span className="mhn-action-count">{likes}</span>
          </button>

          {/* Comment Button */}
          <button className="mhn-action-item">
           <img src="/comment.png" alt="" className="comment-count-icon" />
            <span className="mhn-action-count">{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button className="mhn-action-item" aria-label="Share post">
          <img src="/share.png" alt="" className="share-count-icon" />
          </button>
        </div>
      </div>
    </article>
  );
};
