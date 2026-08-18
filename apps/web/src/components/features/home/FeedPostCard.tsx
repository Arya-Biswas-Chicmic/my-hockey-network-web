import React, { useState } from 'react';
import { likePost, unlikePost, repostPost } from '@my-hockey-network/core';
import { Toast } from '../../common/Toast';

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
  isSelf?: boolean;
  userReaction?: string | null;
  onShareSuccess?: (message: string) => void;
}

export const FeedPostCard: React.FC<FeedPostProps> = ({
  id,
  authorName,
  authorRole = 'Official Team',
  authorTime = '1d',
  authorAvatar = '/CoachTeam.png',
  content,
  postImage,
  likesCount: initialLikes,
  commentsCount,
  isFollowing: initialFollowing = false,
  isSelf = false,
  userReaction = null,
  onShareSuccess,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(!!userReaction);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = isLiked;
    const prevLikes = likes;

    // Optimistic UI update
    if (prevLiked) {
      setLikes(prev => Math.max(0, prev - 1));
      setIsLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setIsLiked(true);
    }

    try {
      if (prevLiked) {
        console.log(`🚀 [FeedPostCard] Calling DELETE /v1/posts/${id}/reactions (Unlike)...`);
        await unlikePost(id);
        console.log(`✅ [FeedPostCard] Unlike success for post ${id}`);
      } else {
        console.log(`🚀 [FeedPostCard] Calling POST /v1/posts/${id}/reactions (Like)...`);
        await likePost(id, 'LIKE');
        console.log(`✅ [FeedPostCard] Like success for post ${id}`);
      }
    } catch (err: any) {
      console.error(`❌ [FeedPostCard] Reaction API Error:`, err);
      // Rollback on error
      setIsLiked(prevLiked);
      setLikes(prevLikes);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      console.log(`🚀 [FeedPostCard] Calling POST /v1/posts/${id}/repost (Share)...`);
      await repostPost(id);
      if (onShareSuccess) {
        onShareSuccess('Post shared successfully');
      } else {
        setToast({ message: 'Post shared successfully', type: 'success' });
      }
    } catch (err: any) {
      console.error(`❌ [FeedPostCard] Share API Error:`, err);
      if (onShareSuccess) {
        onShareSuccess(err.message || 'Failed to share post');
      } else {
        setToast({ message: err.message || 'Failed to share post', type: 'error' });
      }
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
              src={authorAvatar || '/userPlaceholder.png'} 
              alt={authorName} 
              className="mhn-author-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
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
          {!isSelf && (
            <button 
              onClick={toggleFollow} 
              className={`mhn-btn-follow ${isFollowing ? 'mhn-btn-following' : ''}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
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
            aria-label="Like post"
          >
            {isLiked ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1860C3" stroke="#1860C3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="like-count-icon">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <img src="/like.png" alt="" className="like-count-icon" />
            )}
            <span className="mhn-action-count" style={{ color: isLiked ? '#1860C3' : undefined, fontWeight: isLiked ? 700 : undefined }}>{likes}</span>
          </button>

          {/* Comment Button */}
          <button className="mhn-action-item">
           <img src="/comment.png" alt="" className="comment-count-icon" />
            <span className="mhn-action-count">{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button onClick={handleShare} className="mhn-action-item" aria-label="Share post">
            <img src="/share.png" alt="" className="share-count-icon" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </article>
  );
};
