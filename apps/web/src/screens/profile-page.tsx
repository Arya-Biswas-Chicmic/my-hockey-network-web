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
import { useQuery } from '@/query';
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
import { ProfileAboutTab } from '@/components/features/profile/ProfileAboutTab';
import { useShellUiStore } from '@/stores/shell-ui-store';

interface PageProps {
  onNavigate?: (screen: string, extraData?: Record<string, unknown>) => void;
  onLogout?: () => void;
  initialProfileTab?: ProfileTabEnum;
}

export const ProfilePage: React.FC<PageProps> = ({
  onNavigate,
  onLogout,
  initialProfileTab = ProfileTabEnum.ABOUT,
}) => {
  const { user, setUserProfile, loadAuthMe } = useAuth();
  const searchParams = useSearchParams();
  const { permissions, requirePermission } = useFeedPermissions(onNavigate);

  const {
    cropModal,
    isUploadingCover,
    coverUploadMsg,
    handleCoverFileChange,
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

  const handleProfileTabChange = (tab: ProfileTabEnum) => {
    setActiveProfileTab(tab);
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
  const [deletingEntryTarget, setDeletingEntryTarget] = useState<CareerEntry | null>(null);

  const {
    liveName,
    liveAvatar,
    liveCoverImage,
    liveRole,
    isPlayer,
    canHaveCareer,
    liveBio,
    livePosition,
    liveJersey,
    liveCity,
    liveDob,
    liveGender,
    roleSubtitle,
    activeProfile,
  } = useProfileViewModel(targetProfileRes, user, isOwnProfile, careerEntries);

  const about = useProfileAboutSave({ setUserProfile, loadAuthMe });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [liveUserPosts, setLiveUserPosts] = useState<PostItem[]>([]);

  const { data: postsRes } = useQuery(
    effectiveProfileId ? `${QueryKeys.USER_POSTS}:${effectiveProfileId}` : null,
    effectiveProfileId ? () => getUserPosts(effectiveProfileId) : null,
    { staleTime: 0 }
  );

  useEffect(() => {
    if (postsRes?.items && Array.isArray(postsRes.items)) {
      setLiveUserPosts(postsRes.items);
    } else {
      setLiveUserPosts([]);
    }
  }, [postsRes]);

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

      {!user || (Boolean(effectiveProfileId) && (isProfileTargetLoading || (isProfileTargetFetching && !targetProfileRes))) ? (
        <ProfileSkeletonLoader />
      ) : (
        <main className="mhn-profile-main-container">
          <ProfileHeroCard
            coverImage={liveCoverImage}
            isUploadingCover={isUploadingCover}
            coverUploadMsg={coverUploadMsg}
            onCoverFileChange={handleCoverFileChange}
            avatar={liveAvatar}
            name={liveName}
            isUploadingAvatar={isUploadingAvatar}
            onAvatarFileChange={handleAvatarFileChange}
            isOwnProfile={isOwnProfile}
            canEditProfile={canEditProfile}
            onEditProfileClick={() => setIsEditProfileOpen(true)}
            onShareProfileClick={() => showSuccessToast(SUCCESS_MESSAGES.PROFILE_LINK_COPIED)}
            followers={user?.counts?.followers ?? 0}
            following={user?.counts?.following ?? 0}
            roleSubtitle={roleSubtitle}
            city={liveCity}
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
                onOpenCreatePost={handleOpenCreatePost}
                onPostDeleted={(deletedId) => setLiveUserPosts((prev) => prev.filter((p) => p.id !== deletedId))}
                onPostUpdated={(updatedId, newContent) => setLiveUserPosts((prev) => prev.map((item) => item.id === updatedId ? { ...item, body: newContent } : item))}
              />
            )}

            {activeProfileTab === ProfileTabEnum.MEDIA && <ProfileMediaTab />}

            {activeProfileTab === ProfileTabEnum.STATS && <ProfileStatsTab />}

            {activeProfileTab === ProfileTabEnum.ABOUT && (
              <ProfileAboutTab
                canHaveCareer={canHaveCareer}
                intro={{
                  bio: liveBio,
                  position: livePosition,
                  jerseyNumber: liveJersey,
                  role: liveRole,
                  isPlayer,
                  isSaving: about.isSavingIntro,
                  saveMessage: about.introSaveMsg,
                  onSave: about.handleSaveIntro,
                }}
                details={{
                  city: liveCity,
                  dateOfBirth: liveDob,
                  genderCategory: liveGender,
                  isSaving: about.isSavingDetails,
                  saveMessage: about.detailsSaveMsg,
                  onSave: about.handleSaveDetails,
                }}
                career={{
                  entries: careerEntries,
                  isSavingTeam,
                  isDeletingTeamId,
                  onSaveTeam: saveTeam,
                  onRequestDelete: setDeletingEntryTarget,
                }}
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
        </main>
      )}

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
            await deleteTeam(deletingEntryTarget.id);
            setDeletingEntryTarget(null);
          }
        }}
      />

      {cropModal}
    </div>
  );
};
