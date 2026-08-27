import { Button } from '@/components/common/Button';
import { FallbackImage } from '@/components/ui/fallback-image';

export interface PostCardContentProps {
  content: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  postImage?: string;
}

/** Feed post card body: truncatable text with a More/Show-less toggle, plus
 * an optional attached image. Extracted from `FeedPostCard.tsx`. */
export function PostCardContent({ content, isExpanded, onToggleExpand, postImage }: Readonly<PostCardContentProps>) {
  return (
    <div className="mhn-post-content">
      <p className={`mhn-post-text ${!isExpanded ? 'mhn-post-text-truncated' : ''}`}>
        {content}
      </p>
      {content.length > 30 && (
        <Button onClick={onToggleExpand} className="mhn-post-more-btn">
          {isExpanded ? 'Show less' : 'More'}
        </Button>
      )}
      {postImage && (
        <div className="mhn-post-media-container">
          <FallbackImage
            src={postImage}
            alt="Post attachment"
            width={800}
            height={450}
            hideOnError
            className="mhn-post-media-img"
          />
        </div>
      )}
    </div>
  );
}
