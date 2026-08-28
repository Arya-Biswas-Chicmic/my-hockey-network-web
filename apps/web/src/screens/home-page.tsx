import React, { useEffect, useRef, useState } from 'react';
import { isEmailValid } from '@my-hockey-network/validation';
import { PendingBanner } from '@/components/common';
import { RightSidebar } from '@/components/layout/RightSidebar';
import {
  HomeTabs,
  Feed,
  SearchWidget,
  WhoToFollowWidget,
  UpcomingEventsWidget,
  InviteGrowWidget,
  CreatePostModal,
  HomeSkeletonLoader,
} from '@/components/features/home';
import { QueryKeys, PostAudienceEnum } from '@my-hockey-network/contracts';
import { useAuth } from '@/hooks/use-auth';
import { globalQueryClient, invalidateQueryPrefix } from '@/query';
import { useCreatePostMutation } from '@/hooks/use-post-mutations';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { extractErrorMessage, getApiErrorStatus, showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HELPER_MESSAGES } from '@my-hockey-network/constants';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import { useShellUiStore } from '@/stores/shell-ui-store';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

interface PostPrivacySettings {
  audience: string;
  shareWith?: string;
  dontShareWith?: string;
  locationTag?: string;
}

export const HomePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { user } = useAuth();
  const { permissions, requirePermission } = useFeedPermissions(onNavigate);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const createPostMutation = useCreatePostMutation();
  const createPostRequestId = useShellUiStore((state) => state.createPostRequestId);
  const lastHandledCreatePostRequestId = useRef(createPostRequestId);

  const {
    activeFeedTab,
    setActiveFeedTab,
    searchQuery,
    setSearchQuery,
    isPageLoading,
    isFeedRefreshing,
    feedPosts,
    feedError,
    handleFollowChange,
    handlePostDeleteSuccess,
    handlePostUpdateSuccess,
    handleRepostComplete,
    refreshFeed,
  } = useHomeFeed();

  const currentUserName = user?.profile?.displayName || 'Player';
  const currentUserAvatar = resolveMediaUrl(user?.profile?.avatarUrl, '/userPlaceholder.webp');

  const handleTabChange = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePost = async (
    content: string,
    postImage?: string,
    privacySettings?: PostPrivacySettings,
    imageFile?: File
  ) => {
    if (!requirePermission()) return;
    let audienceEnum: PostAudienceEnum = PostAudienceEnum.PUBLIC;
    if (privacySettings?.audience === 'Connections') {
      audienceEnum = PostAudienceEnum.CONNECTIONS;
    } else if (privacySettings?.audience === 'Groups') {
      audienceEnum = PostAudienceEnum.GROUP;
    } else if (privacySettings?.audience === 'Custom') {
      audienceEnum = PostAudienceEnum.PRIVATE;
    }

    const parseEmails = (input?: string): string[] | undefined => {
      if (!input || !input.trim()) return undefined;
      const emails = input
        .split(/[, \n;]+/)
        .map((e) => e.trim())
        .filter((e) => isEmailValid(e));
      return emails.length > 0 ? emails : undefined;
    };

    try {
      const dto = {
        body: content,
        audience: audienceEnum,
        placeName: privacySettings?.locationTag || undefined,
        shareWithEmails: parseEmails(privacySettings?.shareWith),
        hideFromEmails: parseEmails(privacySettings?.dontShareWith),
      };

      const res = await createPostMutation.mutateAsync({ dto, imageFile });

      globalQueryClient.removeQueries({ queryKey: [QueryKeys.FEED_POSTS] });
      await invalidateQueryPrefix(globalQueryClient, QueryKeys.FEED_POSTS);

      await refreshFeed();

      const isPendingApproval = Boolean(
        res?.message === 'POST_PENDING_APPROVAL' ||
        res?.pendingGuardianApproval ||
        res?.data?.pendingGuardianApproval ||
        res?.data?.post?.isDraft
      );

      if (isPendingApproval) {
        showInfoToast(HELPER_MESSAGES.GUARDIAN_APPROVAL_SUBMITTED);
      } else {
        showSuccessToast(SUCCESS_MESSAGES.POST_CREATED);
      }
      setIsCreatePostOpen(false);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, '');
      if (getApiErrorStatus(err) === 403 && (message.includes('GUARDIAN_DISABLED') || message.includes('guardian'))) {
        showErrorToast(err, ERROR_MESSAGES.GUARDIAN_DISABLED_THIS_ACTION);
      } else {
        showErrorToast(err, ERROR_MESSAGES.FAILED_CREATE_POST);
      }
    }
  };

  const handleOpenCreatePost = () => {
    if (requirePermission('CREATE_POST')) {
      setIsCreatePostOpen(true);
    }
  };

  // The sidebar's "Create Post" button now lives in the shared authenticated
  // layout, above every page, so it can't call this page's own handler
  // directly — it bumps a shared counter instead (see `shell-ui-store.ts`).
  useEffect(() => {
    if (createPostRequestId !== lastHandledCreatePostRequestId.current) {
      lastHandledCreatePostRequestId.current = createPostRequestId;
      handleOpenCreatePost();
    }
  }, [createPostRequestId]);

  if (isPageLoading) {
    return <HomeSkeletonLoader />;
  }

  return (
    <>
      {!permissions.allowed && permissions.message && (
        <PendingBanner
          message={permissions.message}
          actionText={permissions.ctaText || 'Complete Profile'}
          onActionClick={() => {
            if (permissions.ctaAction === 'COMPLETE_PROFILE') {
              if (onNavigate) onNavigate('profile');
            } else if (permissions.ctaAction === 'GUARDIAN_APPROVAL') {
              if (onNavigate) onNavigate('supervision');
            } else if (permissions.ctaAction === 'LOGIN') {
              if (onNavigate) onNavigate('login');
            }
          }}
        />
      )}

      <main className="mhn-home-main-layout lg:my-0 lg:min-h-0 lg:flex-1 lg:py-6">
        {/* CENTER MAIN FEED COLUMN */}
        <section className="mhn-layout-col-center lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <HomeTabs activeTab={activeFeedTab} onChange={setActiveFeedTab} />

          <Feed
            activeTab={activeFeedTab}
            posts={feedPosts}
            isLoading={isFeedRefreshing}
            error={feedError}
            searchQuery={searchQuery}
            onRetry={refreshFeed}
            onOpenCreatePost={handleOpenCreatePost}
            onNavigate={onNavigate}
            onFollowChange={handleFollowChange}
            onDeleteSuccess={handlePostDeleteSuccess}
            onUpdateSuccess={handlePostUpdateSuccess}
            onRepostComplete={handleRepostComplete}
          />
        </section>

        {/* RIGHT SIDEBAR COLUMN */}
        <RightSidebar>
          <SearchWidget value={searchQuery} onChange={setSearchQuery} />

          <WhoToFollowWidget onViewAll={() => handleTabChange('network')} />

          <UpcomingEventsWidget
            onViewAll={() => handleTabChange('events')}
            onEventClick={() => handleTabChange('event-detail')}
          />

          <InviteGrowWidget
            onInviteClick={() => showInfoToast('Member invitations are not available yet.')}
            illustrationUrl="/player.webp"
          />
        </RightSidebar>
      </main>

      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onSubmit={handleCreatePost}
          isLoading={createPostMutation.isPending}
          userName={currentUserName}
          userAvatar={currentUserAvatar}
        />
      )}
    </>
  );
};
