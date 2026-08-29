import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PendingBanner } from '@/components/common/PendingBanner';
import { CreatePostModal } from '@/components/features/home/CreatePostModal';
import { EditProfileModal, ProfileSkeletonLoader } from '@/components/features/profile';
import { DeleteCareerModal } from '@/components/common/DeleteCareerModal';
import { useAuth } from '@/hooks/use-auth';
import { showSuccessToast } from '@/utils/toast';
import { SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { ProfileTabEnum } from '@my-hockey-network/contracts';
import { ApprovalCodeModal } from '@/components/supervision/ApprovalCodeModal';
import { ProfileGuardianRequestsTab } from '@/components/features/profile/ProfileGuardianRequestsTab';
import { usePendingGuardianInvites } from '@/hooks/use-guardian-relationships';
import { isMinorPlayerUser } from '@my-hockey-network/domain';
import { paths } from '@/constants/paths';

import { getUserPosts, getProfile, type CareerEntry, type PostItem } from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';
import { useQuery, useInfiniteListQuery } from '@/query';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { useProfileImageUploads } from '@/hooks/use-profile-image-uploads';
import { useProfileCareer } from '@/hooks/use-profile-career';
import { useProfileViewModel } from '@/hooks/use-profile-view-model';
import { useProfileAboutSave } from '@/hooks/use-profile-about-save';
import { useProfileGuardianApproval } from '@/hooks/use-profile-guardian-approval';
import { useProfileCreatePost } from '@/hooks/use-profile-create-post';
import { ProfileHeroCard } from '@/components/features/profile/ProfileHeroCard';
import { ProfilePostsTab } from '@/components/features/profile/ProfilePostsTab';
import { ProfileMediaTab } from '@/components/features/profile/ProfileMediaTab';
import { ProfileStatsTab } from '@/components/features/profile/ProfileStatsTab';
import { ProfileEventsTab } from '@/components/features/profile/ProfileEventsTab';
import { ProfileCareerTab } from '@/components/features/profile/ProfileCareerTab';
import { useShellUiStore } from '@/stores/shell-ui-store';
import { PageShell } from '@/components/layout/PageShell';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { SearchWidget } from '@/components/features/home/SearchWidget';
import { WhoToFollowWidget } from '@/components/features/home/WhoToFollowWidget';
import { profileDemoData } from '@/demo-data/profile';
import { getMyDemoFeedRecords, toPostItem } from '@/demo-data/feed';
import type { CareerFormValues } from '@my-hockey-network/validation';

interface PageProps {
  onNavigate?: (screen: string, extraData?: Record<string, unknown>) => void;
  onLogout?: () => void;
  initialProfileTab?: ProfileTabEnum;
}

export const ProfilePage: React.FC<PageProps> = ({
  onNavigate,
  initialProfileTab = ProfileTabEnum.POSTS,
}) => {
  const { user, setUserProfile, loadAuthMe } = useAuth();
  const searchParams = useSearchParams();
  const { permissions, requirePermission } = useFeedPermissions(onNavigate);
  const profileScrollRef = useRef<HTMLElement>(null);

  const {
    cropModal,
    isUploadingAvatar,
    handleAvatarFileChange,
  } = useProfileImageUploads({ setUserProfile, loadAuthMe });

  const requestedProfileTab = searchParams.get('tab');
  const resolvedInitialProfileTab = Object.values(ProfileTabEnum).includes(requestedProfileTab as ProfileTabEnum)
    ? requestedProfileTab as ProfileTabEnum
    : initialProfileTab;
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabEnum>(resolvedInitialProfileTab);
  const canViewGuardianInvites = isMinorPlayerUser(user);
  const guardianInvitesQuery = usePendingGuardianInvites({
    enabled: canViewGuardianInvites && activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS,
  });
  const guardianApproval = useProfileGuardianApproval();

  const targetUserId =
    searchParams.get('userId') ||
    searchParams.get('selectedWardId') ||
    searchParams.get('childId');

  const ownProfileId = user?.profile?.id || user?.id;
  const effectiveProfileId = targetUserId || ownProfileId || null;
  const isOwnProfile = !targetUserId || targetUserId === ownProfileId || targetUserId === user?.id;
  // `updateAuthProfile` updates only the authenticated user's profile. Managed-child
  // editing needs a dedicated, backend-authorized endpoint and must not be inferred from role.
  const canEditProfile = isOwnProfile;

  useEffect(() => {
    profileScrollRef.current?.scrollTo({ top: 0 });
  }, [effectiveProfileId]);

  const handleProfileTabChange = (tab: ProfileTabEnum) => {
    setActiveProfileTab(tab);
    profileScrollRef.current?.scrollTo({ top: 0 });
    if (!onNavigate) return;
    if (tab === ProfileTabEnum.GUARDIAN_REQUESTS) {
      onNavigate(paths.profileGuardianRequests);
    } else if (initialProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS) {
      onNavigate(`${paths.profile}?tab=${tab}`);
    }
  };

  const { data: targetProfileRes, isLoading: isProfileTargetLoading, isFetching: isProfileTargetFetching } = useQuery(
    effectiveProfileId ? `${QueryKeys.USER_PROFILE}:${effectiveProfileId}` : null,
    effectiveProfileId ? () => getProfile(effectiveProfileId) : null,
    { staleTime: 0 }
  );

  const { careerEntries, isSavingTeam, isDeletingTeamId, saveTeam, deleteTeam } = useProfileCareer(targetProfileRes);
  const [demoCareerEntries, setDemoCareerEntries] = useState<CareerEntry[]>(profileDemoData.teams);
  const [deletingEntryTarget, setDeletingEntryTarget] = useState<CareerEntry | null>(null);

  const {
    liveName,
    liveAvatar,
    liveRole,
    livePosition,
    liveJersey,
    liveCity,
    liveDob,
    liveAge,
    liveShoots,
    liveHeight,
    liveWeight,
    followers,
    following,
    roleSubtitle,
    activeProfile,
  } = useProfileViewModel(targetProfileRes, user, isOwnProfile, careerEntries, profileDemoData.profile);

  const displayedCareerEntries = careerEntries === null
    ? null
    : careerEntries.length > 0 ? careerEntries : demoCareerEntries;

  const handleCareerSave = async (values: CareerFormValues, editingTeamId: string | null) => {
    if (!editingTeamId?.startsWith('demo-')) return saveTeam(values, editingTeamId);
    setDemoCareerEntries((entries) => entries.map((entry) => entry.id === editingTeamId ? {
      ...entry,
      teamName: values.teamName,
      position: values.position,
      location: values.location,
      note: values.note,
      startDate: values.startYear ? `${values.startYear}-01-01T00:00:00.000Z` : null,
      endDate: values.isCurrentPlaying || !values.endYear ? null : `${values.endYear}-12-31T00:00:00.000Z`,
    } : entry));
    return true;
  };

  const about = useProfileAboutSave({ setUserProfile, loadAuthMe });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [liveUserPosts, setLiveUserPosts] = useState<PostItem[]>([]);
  const [peopleSearch, setPeopleSearch] = useState('');

  // Cursor-paginated (`getUserPosts` accepts `{ cursor, limit }`, mirroring
  // the home feed's `getFeed`) — `ProfilePostsTab` triggers `fetchNextPage`
  // via an on-scroll sentinel (feedback 2026-08-28: "make sure where we
  // will have list we have to add pagination and on scroll fetch"). Synced
  // into the same `liveUserPosts` state the delete/update handlers already
  // patch optimistically, rather than juggling two sources of truth.
  const postsQuery = useInfiniteListQuery(
    effectiveProfileId ? `${QueryKeys.USER_POSTS}:${effectiveProfileId}` : null,
    effectiveProfileId ? (cursor) => getUserPosts(effectiveProfileId, { cursor, limit: 10 }) : null,
    { staleTime: 0 },
  );

  // Demo/local posts are intentional filler appended after real ones, not an
  // empty-state fallback — same policy as the Home feed (see `useHomeFeed`):
  // real API posts always come first, and the 10 "mine" records from the
  // shared feed dataset (`@/demo-data/feed`) are always appended after them
  // — only on the viewer's own profile, never someone else's.
  useEffect(() => {
    const demoOwnPosts = isOwnProfile ? getMyDemoFeedRecords().map(toPostItem) : [];
    setLiveUserPosts([...postsQuery.items, ...demoOwnPosts]);
  }, [postsQuery.items, isOwnProfile]);

  const createPost = useProfileCreatePost();
  const handleOpenCreatePost = () => {
    if (requirePermission()) {
      createPost.openCreatePostModal();
    }
  };

  // The sidebar's "Create Post" button now lives in the shared authenticated
  // layout, above every page, so it can't call this page's own handler
  // directly — it bumps a shared counter instead (see `shell-ui-store.ts`).
  const createPostRequestId = useShellUiStore((state) => state.createPostRequestId);
  const lastHandledCreatePostRequestId = useRef(createPostRequestId);
  useEffect(() => {
    if (createPostRequestId !== lastHandledCreatePostRequestId.current) {
      lastHandledCreatePostRequestId.current = createPostRequestId;
      handleOpenCreatePost();
    }
  }, [createPostRequestId]);

  return (
    <div className="mhn-profile-page-root">
      {!permissions.allowed && permissions.message && (
        <PendingBanner
          message={permissions.message}
          actionText={permissions.ctaText || 'Complete Profile'}
          onActionClick={() => {
            if (permissions.ctaAction === 'COMPLETE_PROFILE') {
              setIsEditProfileOpen(true);
            } else if (permissions.ctaAction === 'GUARDIAN_APPROVAL') {
              if (onNavigate) onNavigate('supervision');
            } else if (permissions.ctaAction === 'LOGIN') {
              if (onNavigate) onNavigate('login');
            }
          }}
        />
      )}

      <PageShell className="mhn-home-main-layout lg:my-0 lg:min-h-0 lg:flex-1">
        <section ref={profileScrollRef} className="mhn-layout-col-center flex flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
          {!user || (Boolean(effectiveProfileId) && (isProfileTargetLoading || (isProfileTargetFetching && !targetProfileRes))) ? (
            <ProfileSkeletonLoader />
          ) : (
            <>
              <ProfileHeroCard
                avatar={liveAvatar}
                name={liveName}
                isUploadingAvatar={isUploadingAvatar}
                onAvatarFileChange={handleAvatarFileChange}
                isOwnProfile={isOwnProfile}
                canEditProfile={canEditProfile}
                onEditProfileClick={() => setIsEditProfileOpen(true)}
                onShareProfileClick={() => showSuccessToast(SUCCESS_MESSAGES.PROFILE_LINK_COPIED)}
                followers={user?.counts?.followers ?? followers}
                following={user?.counts?.following ?? following}
                onFollowersClick={() => onNavigate?.('network', { connectionTab: 'followers' })}
                onFollowingClick={() => onNavigate?.('network', { connectionTab: 'following' })}
                roleSubtitle={roleSubtitle}
                age={liveAge}
                dob={liveDob}
                position={livePosition}
                shoots={liveShoots}
                height={liveHeight}
                weight={liveWeight}
                activeProfileTab={activeProfileTab}
                onProfileTabChange={handleProfileTabChange}
                canViewGuardianInvites={canViewGuardianInvites}
              />

              <div>
            {activeProfileTab === ProfileTabEnum.POSTS && (
              <ProfilePostsTab
                posts={liveUserPosts}
                authorName={liveName}
                authorAvatar={liveAvatar}
                authorRole={liveRole}
                jerseyText={liveJersey}
                onNavigate={onNavigate}
                onPostDeleted={(deletedId) => setLiveUserPosts((prev) => prev.filter((p) => p.id !== deletedId))}
                onPostUpdated={(updatedId, newContent) => setLiveUserPosts((prev) => prev.map((item) => item.id === updatedId ? { ...item, body: newContent } : item))}
                hasNextPage={postsQuery.hasNextPage}
                isFetchingNextPage={postsQuery.isFetchingNextPage}
                onLoadMore={postsQuery.fetchNextPage}
              />
            )}

            {activeProfileTab === ProfileTabEnum.MEDIA && <ProfileMediaTab />}

            {activeProfileTab === ProfileTabEnum.STATS && <ProfileStatsTab />}

            {activeProfileTab === ProfileTabEnum.EVENTS && <ProfileEventsTab />}

            {activeProfileTab === ProfileTabEnum.CAREER && (
              <ProfileCareerTab
                careerEntries={displayedCareerEntries}
                isSavingTeam={isSavingTeam}
                isDeletingTeamId={isDeletingTeamId}
                onSaveTeam={handleCareerSave}
                onRequestDelete={setDeletingEntryTarget}
              />
            )}

            {activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS && canViewGuardianInvites && (
              <ProfileGuardianRequestsTab
                query={guardianInvitesQuery}
                disabled={guardianApproval.isProcessing}
                onDecline={guardianApproval.handleRequestDecline}
                onApprove={guardianApproval.handleRequestApprove}
              />
            )}
              </div>
            </>
          )}
        </section>

        <RightSidebar>
          <SearchWidget value={peopleSearch} onChange={setPeopleSearch} placeholder="Search" />
          <WhoToFollowWidget fallbackSuggestions={profileDemoData.people} onViewAll={() => onNavigate?.('network')} />
        </RightSidebar>
      </PageShell>

      <ApprovalCodeModal
        isOpen={guardianApproval.guardianApprovalModalConfig.isOpen}
        targetName={guardianApproval.guardianApprovalModalConfig.targetName}
        initialCode={guardianApproval.guardianApprovalModalConfig.code}
        loading={guardianApproval.isProcessing}
        title={guardianApproval.guardianApprovalModalConfig.action === 'approve' ? 'Approve Guardian' : 'Decline Guardian Invite'}
        submitLabel={guardianApproval.guardianApprovalModalConfig.action === 'approve' ? 'Confirm & Approve' : 'Confirm & Decline'}
        onClose={guardianApproval.closeApprovalModal}
        onSubmit={guardianApproval.submitApprovalModal}
      />

      {createPost.isCreatePostOpen && (
        <CreatePostModal
          isOpen={createPost.isCreatePostOpen}
          onClose={createPost.closeCreatePostModal}
          onSubmit={createPost.handleCreatePost}
          isLoading={createPost.isCreatingPost}
          userName={liveName}
          userAvatar={liveAvatar}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={about.handleSaveProfile}
          profileData={activeProfile}
        />
      )}

      <DeleteCareerModal
        isOpen={!!deletingEntryTarget}
        teamName={deletingEntryTarget?.teamName || null}
        onClose={() => setDeletingEntryTarget(null)}
        isLoading={!!isDeletingTeamId}
        onConfirm={async () => {
          if (deletingEntryTarget) {
            if (deletingEntryTarget.id.startsWith('demo-')) {
              setDemoCareerEntries((entries) => entries.filter((entry) => entry.id !== deletingEntryTarget.id));
            } else {
              await deleteTeam(deletingEntryTarget.id);
            }
            setDeletingEntryTarget(null);
          }
        }}
      />

      {cropModal}
    </div>
  );
};
