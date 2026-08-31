'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Modal } from '@/components/ui/modal';
import { ProfileHeroCard } from '@/components/features/profile/ProfileHeroCard';
import { ProfilePostsTab } from '@/components/features/profile/ProfilePostsTab';
import { ProfileMediaTab } from '@/components/features/profile/ProfileMediaTab';
import { ProfileStatsTab } from '@/components/features/profile/ProfileStatsTab';
import { ProfileEventsTab } from '@/components/features/profile/ProfileEventsTab';
import { ProfileTabEnum } from '@my-hockey-network/contracts';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { calculateAge } from '@/hooks/use-profile-view-model';
import { getOtherProfileDemoData } from '@/demo-data/other-profiles';
import { useShellUiStore, type OtherProfileClickTarget } from '@/stores/shell-ui-store';
import { showInfoToast } from '@/utils/toast';

/**
 * Popup version of the Profile page for someone else's profile — feedback
 * 2026-08-30: "other user will be in the popup with back button option...
 * we need to build center section in the popup and option to close or go
 * back". Reuses the exact same hero card + tab components the real Profile
 * page uses, just with Follow/Message instead of Edit Profile, and no
 * Career tab (that needs real save/delete backend wiring that doesn't
 * apply to a profile you can't edit).
 */
function OtherUserProfileContent({ target }: Readonly<{ target: OtherProfileClickTarget }>) {
  const router = useRouter();
  const closeOtherProfile = useShellUiStore((state) => state.closeOtherProfile);
  const [activeTab, setActiveTab] = useState<ProfileTabEnum>(ProfileTabEnum.POSTS);

  const demo = getOtherProfileDemoData(target.id);
  const name = demo?.name || target.name;
  const avatar = resolveMediaUrl(demo?.avatar || target.avatar, '/userPlaceholder.webp');
  const roleTag = demo?.roleTag || target.roleTag || 'Member';
  const teamName = demo?.teamName || target.teamName;
  const location = demo?.city || target.location || '';
  const roleSubtitle = teamName ? `${roleTag} • @${teamName}` : roleTag;
  const age = demo?.dateOfBirth ? calculateAge(demo.dateOfBirth) : null;
  const roleUpper = roleTag.toUpperCase();
  const isPlayer = roleUpper === 'PLAYER' || roleUpper.includes('PLAYER') || roleUpper.includes('CENTER') || roleUpper.includes('WING') || roleUpper.includes('DEFENSE') || roleUpper.includes('GOALTENDER');

  const [isFollowing, setIsFollowing] = useState(Boolean(demo?.isFollowing));

  const handleFollowToggle = () => {
    // Side effects (the toast) live in the handler body, not the updater —
    // an updater that calls out impurely can run during React's render
    // phase, producing "Cannot update a component while rendering a
    // different component" (the exact bug already fixed once this session
    // in `PostMedia.tsx`'s Register button).
    const next = !isFollowing;
    setIsFollowing(next);
    showInfoToast(next ? `You are now following ${name}. (preview data)` : `You unfollowed ${name}. (preview data)`);
  };

  const handleMessageClick = () => {
    closeOtherProfile();
    router.push('/messaging');
  };

  return (
    <>
      <div className="mhn-other-profile-modal-header">
        <Button type="button" variant="unstyled" className="mhn-compact-page-back-btn" aria-label="Go back" onClick={closeOtherProfile}>
          <ArrowLeft size={20} aria-hidden="true" />
        </Button>
        <Button type="button" variant="unstyled" className="mhn-compact-page-back-btn" aria-label="Close" onClick={closeOtherProfile}>
          <X size={20} aria-hidden="true" />
        </Button>
      </div>

      <div className="mhn-other-profile-modal-body">
        <ProfileHeroCard
          avatar={avatar}
          name={name}
          isUploadingAvatar={false}
          onAvatarFileChange={() => {}}
          isOwnProfile={false}
          canEditProfile={false}
          onEditProfileClick={() => {}}
          onShareProfileClick={() => showInfoToast('Profile link copied. (preview data)')}
          followers={demo?.followers ?? 0}
          following={demo?.following ?? 0}
          onFollowersClick={() => showInfoToast('Followers list is preview data for this profile.')}
          onFollowingClick={() => showInfoToast('Following list is preview data for this profile.')}
          roleSubtitle={roleSubtitle}
          age={age}
          dob={demo?.dateOfBirth || ''}
          position={demo?.position || ''}
          shoots={null}
          height="—"
          weight="—"
          activeProfileTab={activeTab}
          onProfileTabChange={setActiveTab}
          canViewGuardianInvites={false}
          hideCareerTab
          bio={demo?.bio || ''}
          city={location}
          isPlayer={isPlayer}
          otherProfileActions={
            isFollowing ? (
              <Button variant="solid" onClick={handleMessageClick} className="h-9 w-full py-0 text-sm">Message</Button>
            ) : (
              <Button variant="solid" onClick={handleFollowToggle} className="h-9 w-full py-0 text-sm">Follow</Button>
            )
          }
        />

        {location && <p className="mhn-other-profile-location">{location}</p>}
        {demo?.bio && <p className="mhn-other-profile-bio">{demo.bio}</p>}

        <div className="mt-4">
          {activeTab === ProfileTabEnum.POSTS && (
            <ProfilePostsTab
              posts={demo?.posts ?? []}
              authorName={name}
              authorAvatar={avatar}
              authorRole={roleTag}
              jerseyText={demo?.jerseyNumber ?? ''}
              onPostDeleted={() => {}}
              onPostUpdated={() => {}}
              hasNextPage={false}
              isFetchingNextPage={false}
              onLoadMore={() => {}}
            />
          )}
          {/* Media/Stats/Events show generic demo filler in this popup
              specifically — its whole conceit is a preview/demo profile,
              unlike the real `/profile?userId=X` page where someone else's
              actual profile still needs the honest empty state (feedback
              2026-08-30: "for others also add some demo data: post, event,
              stats, groups etc which will shown in others profile which
              don't have data"). Posts is the one exception — a demo person
              not in `other-profiles` data shows "No Feed Yet" rather than
              fabricated posts attributed to them (feedback: "and if no
              feed than show no feed yet"). */}
          {activeTab === ProfileTabEnum.MEDIA && <ProfileMediaTab isOwnProfile={false} showDemoFallback />}
          {activeTab === ProfileTabEnum.STATS && <ProfileStatsTab isOwnProfile={false} showDemoFallback />}
          {activeTab === ProfileTabEnum.EVENTS && <ProfileEventsTab isOwnProfile={false} showDemoFallback />}
        </div>
      </div>
    </>
  );
}

/** Mounted once in `AppShell.tsx`; reads the click target from the shared
 * shell-UI store so any component anywhere can open it without prop-drilling
 * — see `useProfileClickHandler`. */
export function OtherUserProfileModal() {
  const target = useShellUiStore((state) => state.otherProfileTarget);
  const closeOtherProfile = useShellUiStore((state) => state.closeOtherProfile);

  return (
    <Modal
      open={target !== null}
      onClose={closeOtherProfile}
      title={target ? `${target.name}'s profile` : undefined}
      className="mhn-other-profile-modal-card"
    >
      {target && <OtherUserProfileContent target={target} />}
    </Modal>
  );
}
