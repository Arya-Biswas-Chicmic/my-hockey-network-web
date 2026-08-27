'use client';

import Image from 'next/image';
import { Camera } from 'lucide-react';
import { ProfileTabEnum } from '@my-hockey-network/contracts';

import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { FallbackImage } from '@/components/ui/fallback-image';
import { FilePickerButton } from '@/components/ui/file-picker-button';
import { IMAGE_ACCEPT } from '@my-hockey-network/validation';

export interface ProfileHeroCardProps {
  coverImage: string;
  isUploadingCover: boolean;
  coverUploadMsg: string | null;
  onCoverFileChange: (files: File[]) => void;
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
  roleSubtitle: string;
  city: string;
  activeProfileTab: ProfileTabEnum;
  onProfileTabChange: (tab: ProfileTabEnum) => void;
  canViewGuardianInvites: boolean;
}

/**
 * Profile hero card: cover banner, avatar, name, follower stats, share/edit
 * actions, role subtitle, and the tab bar. Extracted from
 * `screens/profile-page.tsx`, which still computes `roleSubtitle` (career
 * team lookup across several fallback sources) since that's derived data,
 * not presentation.
 */
export function ProfileHeroCard({
  coverImage,
  isUploadingCover,
  coverUploadMsg,
  onCoverFileChange,
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
  roleSubtitle,
  city,
  activeProfileTab,
  onProfileTabChange,
  canViewGuardianInvites,
}: Readonly<ProfileHeroCardProps>) {
  return (
    <div className="mhn-profile-hero-card">
      {/* Cover Banner Area */}
      <div className="mhn-profile-cover-banner mhn-relative-container">
        <FallbackImage
          src={coverImage}
          alt=""
          aria-hidden="true"
          fill
          fallbackSrc="/cover.png"
          className="object-cover"
        />
        {isUploadingCover && (
          <div className="mhn-cover-uploading-overlay">
            <Spinner size="lg" color="#38BDF8" />
            <span className="mhn-cover-uploading-text">Uploading cover image...</span>
          </div>
        )}

        {isOwnProfile && (
          <FilePickerButton
            accept={IMAGE_ACCEPT}
            onFilesSelected={onCoverFileChange}
            disabled={isUploadingCover}
            buttonProps={{ className: 'mhn-btn-edit-cover mhn-z-6', 'aria-label': 'Edit cover photo', title: 'Upload new cover image' }}
          >
            {isUploadingCover ? (
              <Spinner size="sm" color="#1860C3" />
            ) : (
              <Image src="/edit2.png" width={32} height={32} className="edit2-icon" alt="edit-icon" />
            )}
          </FilePickerButton>
        )}

        {coverUploadMsg && (
          <div className="mhn-cover-success-badge">✅ {coverUploadMsg}</div>
        )}
      </div>

      {/* Profile Header Content Row */}
      <div className="mhn-profile-header-content">
        <div className="mhn-profile-avatar-outer">
          <div className="mhn-profile-avatar-inner">
            <FallbackImage src={avatar} alt={name} fill className="mhn-profile-hero-avatar-img" />
          </div>

          {isOwnProfile && (
            <FilePickerButton
              accept={IMAGE_ACCEPT}
              onFilesSelected={onAvatarFileChange}
              disabled={isUploadingAvatar}
              buttonProps={{ className: 'mhn-avatar-edit-badge', title: 'Change profile picture', 'aria-label': 'Change profile picture' }}
            >
              {isUploadingAvatar ? <Spinner size="sm" color="#FFFFFF" /> : <Camera size={15} aria-hidden="true" />}
            </FilePickerButton>
          )}
        </div>

        <div className="mhn-profile-meta-and-actions">
          <div className="mhn-profile-top-info-row">
            <h2 className="mhn-profile-hero-name" title={name}>{name}</h2>
            <div className="mhn-profile-action-buttons">
              <Button onClick={onShareProfileClick} className="mhn-btn-share-profile">
                <div className="share-profile-text">Share Profile</div>
              </Button>

              {canEditProfile && (
                <Button onClick={onEditProfileClick} className="mhn-btn-edit-profile">
                  <div className="edit-profile-text">Edit Profile</div>
                </Button>
              )}
            </div>
          </div>

          <div className="mhn-profile-hero-stats">
            <span><strong>{followers}</strong> Followers</span>
            <span><strong>{following}</strong> Following</span>
          </div>

          <p className="mhn-profile-hero-role">{roleSubtitle}</p>

          {city && city !== '-' && <div className="mhn-profile-hero-location">{city}</div>}
        </div>
      </div>

      {/* Profile Content Navigation Tabs Bar */}
      <div className="mhn-profile-tabs-bar">
        <Button
          onClick={() => onProfileTabChange(ProfileTabEnum.POSTS)}
          className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.POSTS ? 'mhn-profile-tab-active' : ''}`}
        >
          <span>Posts</span>
          {activeProfileTab === ProfileTabEnum.POSTS && <div className="mhn-profile-tab-indicator" />}
        </Button>
        <Button
          onClick={() => onProfileTabChange(ProfileTabEnum.MEDIA)}
          className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.MEDIA ? 'mhn-profile-tab-active' : ''}`}
        >
          <span>Media</span>
          {activeProfileTab === ProfileTabEnum.MEDIA && <div className="mhn-profile-tab-indicator" />}
        </Button>
        <Button
          onClick={() => onProfileTabChange(ProfileTabEnum.STATS)}
          className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.STATS ? 'mhn-profile-tab-active' : ''}`}
        >
          <span>Stats</span>
          {activeProfileTab === ProfileTabEnum.STATS && <div className="mhn-profile-tab-indicator" />}
        </Button>
        <Button
          onClick={() => onProfileTabChange(ProfileTabEnum.ABOUT)}
          className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.ABOUT ? 'mhn-profile-tab-active' : ''}`}
        >
          <span>About</span>
          {activeProfileTab === ProfileTabEnum.ABOUT && <div className="mhn-profile-tab-indicator" />}
        </Button>
        {isOwnProfile && canViewGuardianInvites && (
          <Button
            onClick={() => onProfileTabChange(ProfileTabEnum.GUARDIAN_REQUESTS)}
            className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS ? 'mhn-profile-tab-active' : ''}`}
          >
            <span>Guardian Requests</span>
            {activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS && <div className="mhn-profile-tab-indicator" />}
          </Button>
        )}
      </div>
    </div>
  );
}
