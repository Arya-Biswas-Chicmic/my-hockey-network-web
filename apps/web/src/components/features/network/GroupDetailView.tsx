import { useState } from 'react';
import {
  completeMediaUpload,
  createPost,
  getGroupById,
  getGroupMembers,
  getGroupPosts,
  leaveGroup,
  uploadMediaFile,
} from '@my-hockey-network/core';
import { PostAudienceEnum } from '@my-hockey-network/contracts';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@/query';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { showErrorToast, showInfoToast, showSuccessToast } from '@/utils/toast';
import { FeedPostCard, type FeedPostProps } from '@/components/features/home/FeedPostCard';
import { CreatePostModal } from '@/components/features/home/CreatePostModal';
import { EmptyState } from '@/components/features/network/EmptyState';

interface GroupDetailViewProps {
  groupId?: string;
  onBackToGroups?: () => void;
}

export function GroupDetailView({ groupId, onBackToGroups }: GroupDetailViewProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'people'>('posts');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const groupQuery = useQuery(
    groupId ? `group:${groupId}` : null,
    groupId ? () => getGroupById(groupId) : null,
    { staleTime: 5 * 60 * 1000 },
  );
  const postsQuery = useQuery(
    groupId ? `group:${groupId}:posts` : null,
    groupId ? () => getGroupPosts(groupId) : null,
    { staleTime: 60 * 1000 },
  );
  const membersQuery = useQuery(
    groupId ? `group:${groupId}:members` : null,
    groupId ? () => getGroupMembers(groupId, { status: 'ACCEPTED', limit: 50 }) : null,
    { staleTime: 5 * 60 * 1000 },
  );

  if (!groupId) {
    return <EmptyState title="Group Not Selected" message="Choose a group to view its details." iconType="nodata" actionLabel="Back to Groups" onAction={onBackToGroups} />;
  }

  const group = groupQuery.data?.group;
  const posts: FeedPostProps[] = (postsQuery.data?.items || []).map((post) => ({
    id: post.id,
    authorId: post.author?.id,
    authorName: post.author?.displayName || 'Member',
    authorRole: post.author?.primaryRole || 'Member',
    authorTime: new Date(post.createdAt).toLocaleDateString(),
    authorAvatar: resolveMediaUrl(post.author?.avatarUrl),
    content: post.body,
    postImage: post.media?.[0]?.url,
    likesCount: post.reactionsCount || 0,
    commentsCount: post.commentsCount || 0,
    isFollowing: false,
    userReaction: post.userReaction || null,
  }));

  const handleCreatePost = async (
    content: string,
    _preview?: string,
    _privacy?: unknown,
    imageFile?: File,
  ) => {
    setIsCreatingPost(true);
    try {
      let mediaIds: string[] | undefined;
      if (imageFile) {
        const uploaded = await uploadMediaFile(imageFile, 'POST_IMAGE');
        const mediaId = uploaded.mediaId || uploaded.storageKey;
        if (mediaId) {
          await completeMediaUpload(mediaId);
          mediaIds = [mediaId];
        }
      }
      const result = await createPost({ body: content.trim(), audience: PostAudienceEnum.GROUP, groupId, mediaIds });
      if (result.pendingGuardianApproval) showInfoToast('Your group post is waiting for guardian approval.');
      else showSuccessToast('Group post created.');
      setIsPostModalOpen(false);
      await postsQuery.refetch({ forceRefetch: true });
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveGroup(groupId);
      showSuccessToast('You left the group.');
      onBackToGroups?.();
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsLeaving(false);
    }
  };

  if (groupQuery.isLoading) return <div className="mhn-flex-justify-center mhn-mt-20"><Spinner /></div>;
  if (groupQuery.error || !group) {
    return <EmptyState title="Unable to Load Group" message="The group details could not be loaded." iconType="server-error" actionLabel="Retry" onAction={() => void groupQuery.refetch({ forceRefetch: true })} />;
  }

  return (
    <div className="mhn-group-detail-page-container">
      <Button type="button" className="mhn-btn-back-link" onClick={onBackToGroups}>Back to Groups</Button>
      <div className="mhn-group-detail-layout">
        <aside className="mhn-group-col-left">
          <div className="mhn-group-member-card">
            <div className="mhn-group-member-banner" />
            <div className="mhn-group-member-avatar-wrapper"><div className="mhn-group-member-avatar-circle"><img src={resolveMediaUrl(user?.profile?.avatarUrl)} alt="" className="mhn-group-member-avatar-img" /></div></div>
            <div className="mhn-group-member-info"><h3 className="mhn-group-member-name">{user?.profile?.displayName || 'Member'}</h3><p className="mhn-group-member-joined">Group member</p></div>
          </div>
          <Button type="button" className="mhn-btn-post-in-group" onClick={() => setIsPostModalOpen(true)}>Post in Group</Button>
        </aside>

        <section className="mhn-group-col-main">
          <div className="mhn-group-hero-card">
            <div className="mhn-group-cover-banner" />
            <div className="mhn-group-hero-body">
              <div className="mhn-group-title-row">
                <div className="mhn-group-title-info"><h1 className="mhn-group-main-name">{group.name}</h1><span className="mhn-group-members-count">{group.memberCount ?? 0} Members</span></div>
                <Button type="button" className="mhn-btn-group-joined joined" onClick={() => void handleLeave()} disabled={isLeaving}>{isLeaving ? 'Leaving...' : 'Leave Group'}</Button>
              </div>
              <div className="mhn-group-subnav-tabs" role="tablist" aria-label="Group details">
                {(['posts', 'about', 'people'] as const).map((tab) => (
                  <Button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`mhn-group-subnav-tab ${activeTab === tab ? 'active' : ''}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Button>
                ))}
              </div>
            </div>
          </div>

          {activeTab === 'posts' && (
            postsQuery.isLoading ? <div className="mhn-flex-justify-center mhn-mt-20"><Spinner /></div> :
            postsQuery.error ? <EmptyState title="Unable to Load Posts" message="Group posts could not be loaded." iconType="server-error" actionLabel="Retry" onAction={() => void postsQuery.refetch({ forceRefetch: true })} /> :
            posts.length === 0 ? <EmptyState title="No Group Posts" message="Be the first member to post in this group." iconType="posts" /> :
            <div className="mhn-feed-posts-stack">{posts.map((post) => <FeedPostCard key={post.id} {...post} />)}</div>
          )}
          {activeTab === 'about' && <div className="mhn-group-widget-box"><h2 className="mhn-group-widget-title">About</h2><p>{group.description || 'No group description has been provided.'}</p></div>}
          {activeTab === 'people' && (
            membersQuery.isLoading ? <div className="mhn-flex-justify-center mhn-mt-20"><Spinner /></div> :
            membersQuery.error ? <EmptyState title="Unable to Load Members" message="Group members could not be loaded." iconType="server-error" /> :
            !membersQuery.data?.items.length ? <EmptyState title="No Members Found" message="No accepted members are available." iconType="people" /> :
            <div className="mhn-network-skeleton-grid">{membersQuery.data.items.map((member) => <article key={member.id} className="mhn-connection-member-card"><img src={resolveMediaUrl(member.profile?.avatarUrl)} alt="" className="mhn-connection-avatar-img" /><h3>{member.profile?.displayName || 'Member'}</h3><p>{member.role}</p></article>)}</div>
          )}
        </section>
      </div>
      <CreatePostModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onSubmit={handleCreatePost} isLoading={isCreatingPost} />
    </div>
  );
}
