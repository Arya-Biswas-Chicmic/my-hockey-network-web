'use client';

import { Camera } from 'lucide-react';
import { ProfileTabEnum } from '@my-hockey-network/contracts';
import { IMAGE_ACCEPT } from '@my-hockey-network/validation';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { FallbackImage } from '@/components/ui/fallback-image';
import { FilePickerButton } from '@/components/ui/file-picker-button';
import { formatCompactNumber } from '@/helpers/formatters';
import { cn } from '@/utils/cn';

const PROFILE_TABS = [
  { tab: ProfileTabEnum.POSTS, label: 'Posts' },
  { tab: ProfileTabEnum.MEDIA, label: 'Media' },
  { tab: ProfileTabEnum.STATS, label: 'Stats' },
  { tab: ProfileTabEnum.EVENTS, label: 'Events' },
  { tab: ProfileTabEnum.CAREER, label: 'Career' },
] as const;

export interface ProfileHeroCardProps {
  avatar: string;
  name: string;
  isUploadingAvatar: boolean;
  onAvatarFileChange: (files: File[]) => void;
  isOwnProfile: boolean;
  canEditProfile: boolean;
  onEditProfileClick: () => void;
  onShareProfileClick: () => void;
  followers: number;
  following: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  roleSubtitle: string;
  age: number | null;
  dob: string;
  position: string;
  shoots: string | null;
  height: string;
  weight: string;
  activeProfileTab: ProfileTabEnum;
  onProfileTabChange: (tab: ProfileTabEnum) => void;
  canViewGuardianInvites: boolean;
  /** Rendered in place of the Edit Profile button when `canEditProfile` is
   * false — the other-user popup's Follow/Message actions (feedback
   * 2026-08-30: "instead of the edit profile we will have follow if not
   * followed and message button if followed"). Own-profile callers simply
   * don't pass this; the slot stays an empty spacer as before. */
  otherProfileActions?: React.ReactNode;
  /** Career entries need real save/delete backend wiring that doesn't make
   * sense for someone else's profile — the other-user popup hides this tab
   * rather than showing an "Add Team" CTA on a profile that isn't editable. */
  hideCareerTab?: boolean;
}

export function formatDobDisplay(dob: string): string {
  if (!dob) return '—';
  const parsedDate = new Date(dob);
  if (Number.isNaN(parsedDate.getTime())) return '—';
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** @deprecated use `formatCompactNumber` from `@/helpers/formatters` directly — kept as a re-export so existing imports/tests don't churn. */
export const formatProfileCount = formatCompactNumber;

export function ProfileHeroCard({
  avatar,
  name,
  isUploadingAvatar,
  onAvatarFileChange,
  isOwnProfile,
  canEditProfile,
  onEditProfileClick,
  onShareProfileClick,
  followers,
  following,
  onFollowersClick,
  onFollowingClick,
  roleSubtitle,
  age,
  dob,
  position,
  shoots,
  height,
  weight,
  activeProfileTab,
  onProfileTabChange,
  canViewGuardianInvites,
  otherProfileActions,
  hideCareerTab = false,
}: Readonly<ProfileHeroCardProps>) {
  const visibleTabs = hideCareerTab ? PROFILE_TABS.filter((t) => t.tab !== ProfileTabEnum.CAREER) : PROFILE_TABS;
  const statGrid = [
    { label: 'AGE', value: age === null ? '—' : String(age) },
    { label: 'DOB', value: formatDobDisplay(dob) },
    { label: 'HEIGHT', value: height || '—' },
    { label: 'WEIGHT', value: weight || '—' },
    { label: 'POSITION', value: position || '—' },
    { label: 'SHOOTS', value: shoots || '—' },
  ];

  return (
    <section className="shrink-0 overflow-hidden rounded-lg border border-auth-stroke bg-auth-field text-foreground">
      <div className="flex items-center gap-6 px-6 pb-4 pt-8 max-[520px]:items-start max-[520px]:gap-4 max-[520px]:px-4">
        <div className="relative size-[102px] shrink-0 max-[520px]:size-20">
          <div className="relative size-full overflow-hidden rounded-full border border-auth-stroke bg-secondary">
            <FallbackImage src={avatar} alt={name} fill sizes="102px" className="object-cover" />
          </div>
          {isOwnProfile ? (
            <FilePickerButton
              accept={IMAGE_ACCEPT}
              onFilesSelected={onAvatarFileChange}
              disabled={isUploadingAvatar}
              buttonProps={{
                className: 'absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-auth-field bg-primary text-primary-foreground',
                title: 'Change profile photo',
                'aria-label': 'Change profile photo',
              }}
            >
              {isUploadingAvatar ? <Spinner size="sm" /> : <Camera size={14} aria-hidden="true" />}
            </FilePickerButton>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-7 tracking-[0.07px]">{name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground/80">
            <Button type="button" onClick={onFollowersClick} className="h-auto p-0 text-sm font-normal text-foreground/80 hover:text-primary">
              <strong className="mr-1 text-foreground">{formatProfileCount(followers)}</strong> Followers
            </Button>
            <Button type="button" onClick={onFollowingClick} className="h-auto p-0 text-sm font-normal text-foreground/80 hover:text-primary">
              <strong className="mr-1 text-foreground">{formatProfileCount(following)}</strong> Following
            </Button>
          </div>
          <p className="mt-2 break-words text-sm text-foreground/90">{roleSubtitle}</p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-1.5 px-6 max-[520px]:grid-cols-2 max-[520px]:px-4">
        {statGrid.map(({ label, value }) => (
          <div key={label} className="flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg border border-auth-stroke bg-background px-2 py-2 text-center">
            <dt className="text-[11px] font-normal leading-4 text-foreground/70">{label}</dt>
            <dd className="max-w-full truncate text-sm font-bold leading-4 text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-2 gap-2 px-6 py-6 max-[520px]:px-4">
        {canEditProfile ? (
          <Button variant="solid" onClick={onEditProfileClick} className="h-9 w-full py-0 text-sm">Edit Profile</Button>
        ) : otherProfileActions ?? <span />}
        <Button variant="solid-outline" onClick={onShareProfileClick} className="h-9 w-full border-primary bg-transparent py-0 text-sm text-primary hover:bg-primary/10">Share Profile</Button>
      </div>

      <nav aria-label="Profile sections" className="flex overflow-x-auto border-t border-auth-stroke [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleTabs.map(({ tab, label }) => (
          <Button
            key={tab}
            role="tab"
            aria-selected={activeProfileTab === tab}
            onClick={() => onProfileTabChange(tab)}
            className={cn(
              'relative h-11 min-w-[74px] flex-1 px-3 text-sm font-medium text-muted-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-transparent',
              // Reads `--tab-active-text`/`--tab-active-underline` directly —
              // the same single-source pair every other tab bar in the app
              // uses — rather than `after:bg-foreground` (a WHITE underline,
              // not Figma's blue one) (feedback 2026-08-30: "somewhere ...
              // white and offwhite color and somewhere dull blue color ...
              // keep this in constant change from single location").
              activeProfileTab === tab && 'font-bold text-[var(--tab-active-text)] after:bg-[var(--tab-active-underline)]',
            )}
          >{label}</Button>
        ))}
        {isOwnProfile && canViewGuardianInvites ? (
          <Button
            role="tab"
            aria-selected={activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS}
            onClick={() => onProfileTabChange(ProfileTabEnum.GUARDIAN_REQUESTS)}
            className={cn(
              'relative h-11 min-w-[142px] px-3 text-sm font-medium text-muted-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-transparent',
              activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS && 'font-bold text-[var(--tab-active-text)] after:bg-[var(--tab-active-underline)]',
            )}
          >Guardian Requests</Button>
        ) : null}
      </nav>
    </section>
  );
}
