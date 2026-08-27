import React from 'react';
import { Button } from '@/components/common/Button';
import { PostMedia } from '@/components/features/home/PostMedia';

export interface PostCardContentProps {
  content: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  postImage?: string;
  images?: string[];
}

export function PostCardContent({
  content,
  isExpanded,
  onToggleExpand,
  postImage,
  images,
}: Readonly<PostCardContentProps>) {
  return (
    <div className="mhn-post-content space-y-3">
      <p className={`mhn-post-text ${!isExpanded ? 'mhn-post-text-truncated' : ''}`}>
        {content}
      </p>

      {content.length > 120 && (
        <Button onClick={onToggleExpand} className="mhn-post-more-btn text-xs text-blue-400 font-medium">
          {isExpanded ? 'Show less' : '...more'}
        </Button>
      )}

      <PostMedia postImage={postImage} images={images} altText="Post attachment" />
    </div>
  );
}
