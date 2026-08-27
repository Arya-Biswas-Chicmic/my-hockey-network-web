import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { PendingBanner } from '@/components/common/PendingBanner';
import { CreatePostModal } from '@/components/features/home/CreatePostModal';
import { EditProfileModal, EditProfileFormData, ProfileSkeletonLoader } from '@/components/features/profile';
import { DeleteCareerModal } from '@/components/common/DeleteCareerModal';
import { useAuth } from '@/hooks/use-auth';
import { resolveMediaUrl, resolveCoverUrl } from '@/utils/mediaUtils';
import { isEmailValid } from '@my-hockey-network/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { NavTabEnum, ProfileTabEnum, PostAudienceEnum } from '@my-hockey-network/contracts';
import { ApprovalCodeModal } from '@/components/supervision/ApprovalCodeModal';
import {
  ProfileGuardianRequestsTab,
  getGuardianRequestCode,
  getGuardianRequestName,
} from '@/components/features/profile/ProfileGuardianRequestsTab';
import {
  useAcceptGuardianInviteMutation,
  useDeclineGuardianInviteMutation,
  usePendingGuardianInvites,
} from '@/hooks/use-guardian-relationships';
import { isMinorPlayerUser } from '@my-hockey-network/domain';
import { paths } from '@/constants/paths';

import {
  getUserPosts,
  getProfile,
  type CareerEntry,
  type PostItem,
} from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';
import { globalQueryClient, invalidateQueryPrefix, useQuery } from '@/query';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { useProfileImageUploads } from '@/hooks/use-profile-image-uploads';
import { useProfileCareer } from '@/hooks/use-profile-career';
import { useUpdateProfileMutation } from '@/hooks/use-update-profile';
import { useCreatePostMutation } from '@/hooks/use-post-mutations';
import { ProfileHeroCard } from '@/components/features/profile/ProfileHeroCard';
import { ProfilePostsTab } from '@/components/features/profile/ProfilePostsTab';
import { ProfileMediaTab } from '@/components/features/profile/ProfileMediaTab';
import { ProfileStatsTab } from '@/components/features/profile/ProfileStatsTab';
import { ProfileAboutTab } from '@/components/features/profile/ProfileAboutTab';

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

  const handleOpenCreatePost = () => {
    if (requirePermission()) {
      setIsCreatePostOpen(true);
    }
  };

  const [activeNavTab, setActiveNavTab] = useState<NavTabEnum | string>(NavTabEnum.PROFILE);
  const requestedProfileTab = searchParams.get('tab');
  const resolvedInitialProfileTab = Object.values(ProfileTabEnum).includes(requestedProfileTab as ProfileTabEnum)
    ? requestedProfileTab as ProfileTabEnum
    : initialProfileTab;
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabEnum>(resolvedInitialProfileTab);
  const canViewGuardianInvites = isMinorPlayerUser(user);
  const guardianInvitesQuery = usePendingGuardianInvites({
    enabled: canViewGuardianInvites && activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS,
  });
  const acceptGuardianInviteMutation = useAcceptGuardianInviteMutation();
  const declineGuardianInviteMutation = useDeclineGuardianInviteMutation();
  const [guardianApprovalModalConfig, setGuardianApprovalModalConfig] = useState<{
    isOpen: boolean;
    targetName: string;
    code?: string;
    action: 'approve' | 'decline';
  }>({ isOpen: false, targetName: '', code: '', action: 'approve' });

  const handleAcceptGuardianReq = async (code: string) => {
    if (!code) {
      const error = new Error('Enter the 6-digit invitation code to approve this guardian.');
      showErrorToast(error, ERROR_MESSAGES.FAILED_APPROVE_REQUEST);
      throw error;
    }
    try {
      const res = await acceptGuardianInviteMutation.mutateAsync(code);
      showSuccessToast(res.message || SUCCESS_MESSAGES.GUARDIAN_REQUEST_APPROVED);
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_APPROVE_REQUEST);
      throw err;
    }
  };

  const handleDeclineGuardianReq = async (code: string) => {
    if (!code) {
      const error = new Error('This invitation does not include a decline code.');
      showErrorToast(error, ERROR_MESSAGES.FAILED_DECLINE_REQUEST);
      throw error;
    }
    try {
      const res = await declineGuardianInviteMutation.mutateAsync(code);
      showSuccessToast(res.message || SUCCESS_MESSAGES.GUARDIAN_REQUEST_DECLINED);
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_DECLINE_REQUEST);
      throw err;
    }
  };

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

  const targetResObj = (targetProfileRes || {}) as Record<string, unknown>;
  const targetDataObj = (targetResObj.data || {}) as Record<string, unknown>;
  const rawTargetProfile = (targetResObj.profile || targetDataObj.profile || targetProfileRes) as Record<string, unknown> | null;
  const activeProfile = rawTargetProfile?.id || rawTargetProfile?.profileId || rawTargetProfile?.displayName ? rawTargetProfile : (isOwnProfile ? user?.profile : null);
  const rawProf = (activeProfile || {}) as Record<string, unknown>;

  const liveName = String(rawProf.displayName || rawProf.name || 'Player');
  const rawAvatar = rawProf.avatarUrl as string | undefined;
  const liveAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
  const rawCover =
    (rawProf.coverImageUrl as string | undefined) ||
    (rawProf.coverUrl as string | undefined) ||
    (rawProf.coverImageKey as string | undefined);
  const liveCoverImage = resolveCoverUrl(rawCover, '/cover.png');
  const rawRole =
    rawProf.primaryRole ||
    rawProf.profileType ||
    rawProf.type ||
    (isOwnProfile ? user?.primaryRole : null) ||
    rawProf.roleTag ||
    'PLAYER';
  const liveRole = String(rawProf.roleTag || rawRole);
  const liveRoleUpper = String(rawRole).toUpperCase();
  const isPlayer = liveRoleUpper === 'PLAYER' || liveRoleUpper.includes('PLAYER') || liveRoleUpper.includes('CENTER') || liveRoleUpper.includes('WING') || liveRoleUpper.includes('DEFENSE') || liveRoleUpper.includes('GOALTENDER');
  const isCoach = liveRoleUpper === 'COACH' || liveRoleUpper.includes('COACH');
  const isParent = liveRoleUpper === 'PARENT' || liveRoleUpper.includes('PARENT');
  const canHaveCareer = isPlayer || isCoach || (!isParent && liveRoleUpper !== 'PARENT');

  // Live profile field fallbacks
  const liveBio = String(rawProf.bio || '');
  const livePosition = String(rawProf.position || 'Center');
  const liveJersey = rawProf.jerseyNumber !== null && rawProf.jerseyNumber !== undefined ? String(rawProf.jerseyNumber) : '';
  const liveCity = String(rawProf.city || rawProf.location || '');
  const rawDob =
    rawProf.dateOfBirth ||
    rawProf.dob ||
    rawProf.date_of_birth ||
    (isOwnProfile ? user?.profile?.dateOfBirth : null);
  const liveDob = rawDob ? (String(rawDob).includes('T') ? String(rawDob).split('T')[0] : String(rawDob)) : '';
  const liveGender = String(rawProf.genderCategory || rawProf.gender || 'Male');

  const [introSaveMsg, setIntroSaveMsg] = useState<string | null>(null);
  const [detailsSaveMsg, setDetailsSaveMsg] = useState<string | null>(null);
  // Separate mutation instances per section so Intro/Details/Edit-Profile-modal saves each get
  // their own independent isPending — one shared instance would make all three sections show as
  // "saving" together whenever any one of them was.
  const saveIntroMutation = useUpdateProfileMutation();
  const saveDetailsMutation = useUpdateProfileMutation();
  const saveProfileMutation = useUpdateProfileMutation();

  const handleSaveIntro = async (values: { bio: string; position: string; jerseyNumber: string }) => {
    setIntroSaveMsg(null);
    try {
      const ALLOWED_POSITIONS = ['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goaltender'];
      const validPosition = ALLOWED_POSITIONS.includes(values.position) ? values.position : 'Center';
      const dto = {
        bio: values.bio || undefined,
        position: validPosition,
        jerseyNumber: values.jerseyNumber !== '' ? Number(values.jerseyNumber) : undefined,
      };
      const res = await saveIntroMutation.mutateAsync(dto);
      if (res) {
        setUserProfile(res);
      }
      await loadAuthMe(true, true);
      setIntroSaveMsg('Intro saved successfully!');
      setTimeout(() => setIntroSaveMsg(null), 3000);
    } catch (err: unknown) {
      console.error('❌ Save Intro error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_SAVE_INTRO);
    }
  };

  const handleSaveDetails = async (values: { city: string; dateOfBirth: string; genderCategory: string }) => {
    setDetailsSaveMsg(null);
    try {
      const dto = {
        city: values.city || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        genderCategory: values.genderCategory || undefined,
      };
      const res = await saveDetailsMutation.mutateAsync(dto);
      if (res) {
        setUserProfile(res);
      }
      await loadAuthMe(true, true);
      setDetailsSaveMsg('Personal details saved successfully!');
      setTimeout(() => setDetailsSaveMsg(null), 3000);
    } catch (err: unknown) {
      console.error('❌ Save Details error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_SAVE_PERSONAL_DETAILS);
    }
  };

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const createPostMutation = useCreatePostMutation();
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

  const handleSaveProfile = async (data: EditProfileFormData) => {
    let formattedDob = data?.dateOfBirth;
    if (formattedDob && formattedDob.includes('T')) {
      formattedDob = formattedDob.split('T')[0];
    }

    // Rule from media-uploads.md: Sending both avatarKey and avatarUrl returns 400.
    // If avatarKey is present (uploaded via Step 1 & Step 2), send avatarKey and omit avatarUrl.
    const avatarKeyToSend: string | undefined = data?.avatarKey;
    let avatarUrlToSend: string | undefined = undefined;

    if (!avatarKeyToSend && data?.avatarUrl && data?.avatarUrl !== '/userPlaceholder.png' && !data?.avatarUrl.includes('userPlaceholder.png') && !data?.avatarUrl.startsWith('blob:')) {
      avatarUrlToSend = data?.avatarUrl;
    }

    const ALLOWED_POSITIONS = ['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goaltender'];
    const validPosition = data?.position && ALLOWED_POSITIONS.includes(data.position) ? data.position : 'Center';

    const dto = {
      displayName: data?.displayName || undefined,
      firstName: data?.firstName || undefined,
      lastName: data?.lastName || undefined,
      bio: data?.bio || undefined,
      city: data?.city || undefined,
      dateOfBirth: formattedDob || undefined,
      position: validPosition,
      shootsCatches: data?.shootsCatches || undefined,
      jerseyNumber: data?.jerseyNumber !== '' && data?.jerseyNumber !== null && data?.jerseyNumber !== undefined ? Number(data?.jerseyNumber) : undefined,
      genderCategory: data?.genderCategory || undefined,
      avatarKey: avatarKeyToSend,
      avatarUrl: avatarUrlToSend,
    };

    try {
      const res = await saveProfileMutation.mutateAsync(dto);
      if (res) {
        setUserProfile(res);
        void globalQueryClient.invalidateQueries({ queryKey: [QueryKeys.AUTH_ME] });
        await loadAuthMe(true, true);
        return res;
      }
    } catch (err: unknown) {
      console.error('❌ [ProfilePage] Update Profile Error:', err);
      throw err;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePost = async (
    content: string,
    _postImage?: string,
    privacySettings?: { audience: string; shareWith?: string; dontShareWith?: string; locationTag?: string },
    imageFile?: File,
  ) => {
    let audienceEnum: PostAudienceEnum = PostAudienceEnum.PUBLIC;
    if (privacySettings?.audience === 'Connections') audienceEnum = PostAudienceEnum.CONNECTIONS;
    if (privacySettings?.audience === 'Groups') audienceEnum = PostAudienceEnum.GROUP;
    if (privacySettings?.audience === 'Custom') audienceEnum = PostAudienceEnum.PRIVATE;

    const parseEmails = (str?: string) => {
      if (!str || !str.trim()) return undefined;
      const emails = str
        .split(/[, \n;]+/)
        .map((e) => e.trim())
        .filter((e) => isEmailValid(e));
      return emails.length > 0 ? emails : undefined;
    };

    const dto = {
      body: content,
      audience: audienceEnum,
      placeName: privacySettings?.locationTag || undefined,
      shareWithEmails: parseEmails(privacySettings?.shareWith),
      hideFromEmails: parseEmails(privacySettings?.dontShareWith),
    };

    try {
      // imageFile (not the postImage preview string, which is a local blob: URL the backend
      // can't resolve) is what actually gets uploaded — see useCreatePostMutation.
      await createPostMutation.mutateAsync({ dto, imageFile });
      globalQueryClient.removeQueries({ queryKey: [QueryKeys.FEED_POSTS] });
      await invalidateQueryPrefix(globalQueryClient, QueryKeys.FEED_POSTS);
      setIsCreatePostOpen(false);
    } catch (err: unknown) {
      console.error('❌ [ProfilePage] Create Post Error:', err);
      setIsCreatePostOpen(false);
    }
  };

  const { careerEntries, isSavingTeam, isDeletingTeamId, saveTeam, deleteTeam } = useProfileCareer(targetProfileRes);
  const [deletingEntryTarget, setDeletingEntryTarget] = useState<CareerEntry | null>(null);

  const roleSubtitle = (() => {
    const targetProf = targetProfileRes as { profile?: { career?: { teamName?: string }[]; careerEntries?: { teamName?: string }[]; teamName?: string } } | null;
    const primaryTeam = (careerEntries && careerEntries.length > 0 && careerEntries[0]?.teamName)
      ? careerEntries[0].teamName
      : (targetProf?.profile?.career?.[0]?.teamName ||
        targetProf?.profile?.careerEntries?.[0]?.teamName ||
        targetProf?.profile?.teamName ||
        user?.profile?.career?.[0]?.teamName ||
        user?.profile?.careerEntries?.[0]?.teamName ||
        user?.profile?.teamName || null);
    if (isParent) return liveRole;
    const teamString = primaryTeam ? ` • @${primaryTeam}` : '';
    if (isPlayer) {
      return `${livePosition === 'Left Wing' ? 'LW' : livePosition === 'Right Wing' ? 'RW' : livePosition === 'Center' ? 'C' : livePosition === 'Defense' ? 'D' : livePosition === 'Goaltender' ? 'G' : (livePosition || 'LW')} • #${liveJersey || '8'}${teamString}`;
    }
    return `${liveRole}${teamString}`;
  })();

  return (
    <div className="mhn-profile-page-root">
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        userName="Jack Ruffle"
        userAvatar="/jack.png"
      />

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
                  isSaving: saveIntroMutation.isPending,
                  saveMessage: introSaveMsg,
                  onSave: handleSaveIntro,
                }}
                details={{
                  city: liveCity,
                  dateOfBirth: liveDob,
                  genderCategory: liveGender,
                  isSaving: saveDetailsMutation.isPending,
                  saveMessage: detailsSaveMsg,
                  onSave: handleSaveDetails,
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
                disabled={acceptGuardianInviteMutation.isPending || declineGuardianInviteMutation.isPending}
                onDecline={(selectedRequest) => {
                  const code = getGuardianRequestCode(selectedRequest);
                  if (code) {
                    // Toast already shown inside handleDeclineGuardianReq on failure;
                    // this path has no modal to keep open, so just prevent an unhandled rejection.
                    void handleDeclineGuardianReq(code).catch(() => {});
                    return;
                  }
                  setGuardianApprovalModalConfig({
                    isOpen: true,
                    targetName: getGuardianRequestName(selectedRequest),
                    code: '',
                    action: 'decline',
                  });
                }}
                onApprove={(selectedRequest) => {
                  setGuardianApprovalModalConfig({
                    isOpen: true,
                    targetName: getGuardianRequestName(selectedRequest),
                    code: getGuardianRequestCode(selectedRequest),
                    action: 'approve',
                  });
                }}
              />
            )}
          </div>
        </main>
      )}

      <ApprovalCodeModal
        isOpen={guardianApprovalModalConfig.isOpen}
        targetName={guardianApprovalModalConfig.targetName}
        initialCode={guardianApprovalModalConfig.code}
        loading={acceptGuardianInviteMutation.isPending || declineGuardianInviteMutation.isPending}
        title={guardianApprovalModalConfig.action === 'approve' ? 'Approve Guardian' : 'Decline Guardian Invite'}
        submitLabel={guardianApprovalModalConfig.action === 'approve' ? 'Confirm & Approve' : 'Confirm & Decline'}
        onClose={() => setGuardianApprovalModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={async (enteredCode) => {
          if (guardianApprovalModalConfig.action === 'approve') {
            await handleAcceptGuardianReq(enteredCode);
          } else {
            await handleDeclineGuardianReq(enteredCode);
          }
          setGuardianApprovalModalConfig((prev) => ({ ...prev, isOpen: false }));
        }}
      />

      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onSubmit={handleCreatePost}
          isLoading={createPostMutation.isPending}
          userName={liveName}
          userAvatar={liveAvatar}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
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
