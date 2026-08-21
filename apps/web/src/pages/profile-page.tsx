import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { FeedPostCard } from '../components/features/home/FeedPostCard';
import { CreatePostModal } from '../components/features/home/CreatePostModal';
import { EditProfileModal, EditProfileFormData, ProfileSkeletonLoader } from '../components/features/profile';
import { FeedPostSkeleton } from '../components/features/home/HomeSkeletonLoader';
import { Spinner } from '../components/common/Spinner';
import { Toast } from '../components/common/Toast';
import { useAuth } from '../hooks/use-auth';
import { resolveMediaUrl, resolveCoverUrl } from '../utils/mediaUtils';
import { createPost, getUserPosts, updateAuthProfile, uploadMediaFile } from '@my-hockey-network/core';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { user, setUserProfile, loadAuthMe } = useAuth();
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [coverUploadMsg, setCoverUploadMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleEditCoverClick = () => {
    coverFileInputRef.current?.click();
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setCoverUploadMsg(null);

    try {
      console.log('🚀 [ProfilePage] Uploading cover image file (purpose: COVER)...');
      const uploadRes = await uploadMediaFile(file, 'COVER');
      if (uploadRes?.storageKey) {
        console.log('✅ [ProfilePage] Cover file uploaded to storage. Key:', uploadRes.storageKey);
        const updated = await updateAuthProfile({ coverImageKey: uploadRes.storageKey });
        if (updated) {
          setUserProfile(updated);
        }
        await loadAuthMe();
        setCoverUploadMsg('Cover image updated successfully!');
        setTimeout(() => setCoverUploadMsg(null), 3000);
      }
    } catch (err: any) {
      console.error('❌ [ProfilePage] Cover image upload error:', err);
      alert(err.message || 'Failed to upload cover image. Please try again.');
    } finally {
      setIsUploadingCover(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  const handleEditAvatarClick = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);

    try {
      console.log('🚀 [ProfilePage] Uploading avatar image file (purpose: AVATAR)...');
      const uploadRes = await uploadMediaFile(file, 'AVATAR');
      if (uploadRes?.storageKey) {
        console.log('✅ [ProfilePage] Avatar uploaded to storage. Key:', uploadRes.storageKey);
        const updated = await updateAuthProfile({ avatarKey: uploadRes.storageKey });
        if (updated) {
          setUserProfile(updated);
        }
        await loadAuthMe();
      }
    } catch (err: any) {
      console.error('❌ [ProfilePage] Avatar upload error:', err);
      alert(err.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };
  const [activeNavTab, setActiveNavTab] = useState('profile');
  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'media' | 'stats' | 'about'>('about');
  const [activeAboutSection, setActiveAboutSection] = useState<'intro' | 'career' | 'details'>('intro');

  const liveName = user?.profile?.displayName || (user as any)?.displayName || 'Player';
  const rawAvatar = user?.profile?.avatarUrl || (user as any)?.avatarUrl;
  const liveAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
  const rawCover =
    (user?.profile as any)?.coverImageUrl ||
    (user?.profile as any)?.coverUrl ||
    (user?.profile as any)?.coverImageKey ||
    (user as any)?.coverImageUrl ||
    (user as any)?.coverUrl ||
    (user as any)?.coverImageKey;
  const liveCoverImage = resolveCoverUrl(rawCover, '/cover.png');
  const liveRole = user?.primaryRole || user?.profile?.type || 'PLAYER';

  // Live profile field fallbacks from GET /v1/auth/me
  const liveBio = user?.profile?.bio || 'Competitive ice hockey player focused on teamwork, discipline, and continuous improvement on and off the ice.';
  const livePosition = user?.profile?.position || 'Center';
  const liveJersey = user?.profile?.jerseyNumber !== null && user?.profile?.jerseyNumber !== undefined ? String(user.profile.jerseyNumber) : '97';
  const liveCity = user?.profile?.city || '-';
  const liveDob = user?.profile?.dateOfBirth ? new Date(user?.profile?.dateOfBirth).toLocaleDateString() : '01-01-2001';
  const liveGender = user?.profile?.genderCategory || 'Male';

  // Intro Form States matching Image 11
  const [bioText, setBioText] = useState(liveBio);
  const [positionText, setPositionText] = useState(livePosition);
  const [jerseyText, setJerseyText] = useState(liveJersey);

  // Personal Details Form States
  const [locationText, setLocationText] = useState(liveCity);
  const [dobText, setDobText] = useState(liveDob);
  const [genderText, setGenderText] = useState(liveGender);

  const [isSavingIntro, setIsSavingIntro] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [introSaveMsg, setIntroSaveMsg] = useState<string | null>(null);
  const [detailsSaveMsg, setDetailsSaveMsg] = useState<string | null>(null);

  // Synchronize inputs with live user profile data
  React.useEffect(() => {
    if (user?.profile) {
      setBioText(user.profile.bio || '');
      setPositionText(user.profile.position || '');
      setJerseyText(user.profile.jerseyNumber !== null && user.profile.jerseyNumber !== undefined ? String(user.profile.jerseyNumber) : '');
      setLocationText(user.profile.city || '');
      setDobText(user.profile.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '');
      setGenderText(user.profile.genderCategory || '');
    }
  }, [user]);

  const handleSaveIntro = async () => {
    setIsSavingIntro(true);
    setIntroSaveMsg(null);
    try {
      const dto = {
        bio: bioText || undefined,
        position: positionText || undefined,
        jerseyNumber: jerseyText !== '' ? Number(jerseyText) : undefined,
      };
      console.log('🚀 [ProfilePage] Saving Intro Tab via PATCH /v1/auth/profile:', dto);
      const res = await updateAuthProfile(dto);
      if (res) {
        setUserProfile(res);
      }
      await loadAuthMe();
      setIntroSaveMsg('Intro saved successfully!');
      setTimeout(() => setIntroSaveMsg(null), 3000);
    } catch (err: any) {
      console.error('❌ Save Intro error:', err);
      alert(err.message || 'Failed to save intro details');
    } finally {
      setIsSavingIntro(false);
    }
  };

  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    setDetailsSaveMsg(null);
    try {
      const dto = {
        city: locationText || undefined,
        dateOfBirth: dobText || undefined,
        genderCategory: genderText || undefined,
      };
      console.log('🚀 [ProfilePage] Saving Personal Details via PATCH /v1/auth/profile:', dto);
      const res = await updateAuthProfile(dto);
      if (res) {
        setUserProfile(res);
      }
      await loadAuthMe();
      setDetailsSaveMsg('Personal details saved successfully!');
      setTimeout(() => setDetailsSaveMsg(null), 3000);
    } catch (err: any) {
      console.error('❌ Save Details error:', err);
      alert(err.message || 'Failed to save personal details');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const [selectedSeason, setSelectedSeason] = useState('2025-26');
  const [selectedSeasonType, setSelectedSeasonType] = useState('Regular Season');
  const [selectedUnit, setSelectedUnit] = useState('Miles • MI');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [liveUserPosts, setLiveUserPosts] = useState<any[]>([]);

  // Fetch author posts when profile mounts (GET /v1/posts?authorProfileId=...)
  React.useEffect(() => {
    const profileId = user?.profile?.id || user?.id;
    if (profileId) {
      console.log(`🚀 [ProfilePage] Fetching user posts for authorProfileId: ${profileId}...`);
      setIsPostsLoading(true);
      getUserPosts(profileId)
        .then((res) => {
          if (res?.items && Array.isArray(res.items)) {
            console.log(`✅ [ProfilePage] User posts fetched: ${res.items.length} posts`);
            setLiveUserPosts(res?.items);
          }
        })
        .finally(() => {
          setIsPostsLoading(false);
        });
    } else {
      setIsPostsLoading(false);
    }
  }, [user]);

  const handleSaveProfile = async (data: EditProfileFormData) => {
    console.log('🚀 [ProfilePage] Hitting PATCH /v1/auth/profile API with payload:', data);

    // Format dateOfBirth as YYYY-MM-DD (e.g., "2004-03-11") matching backend payload
    let formattedDob = data?.dateOfBirth;
    if (formattedDob && formattedDob.includes('T')) {
      formattedDob = formattedDob.split('T')[0];
    }

    // Rule from media-uploads.md: Sending both avatarKey and avatarUrl returns 400.
    // If avatarKey is present (uploaded via Step 1 & Step 2), send avatarKey and omit avatarUrl.
    let avatarKeyToSend: string | undefined = data?.avatarKey;
    let avatarUrlToSend: string | undefined = undefined;

    if (!avatarKeyToSend && data?.avatarUrl && data?.avatarUrl !== '/userPlaceholder.png' && !data?.avatarUrl.includes('userPlaceholder.png') && !data?.avatarUrl.startsWith('blob:')) {
      avatarUrlToSend = data?.avatarUrl;
    }

    const dto = {
      displayName: data?.displayName || undefined,
      firstName: data?.firstName || undefined,
      lastName: data?.lastName || undefined,
      bio: data?.bio || undefined,
      city: data?.city || undefined,
      dateOfBirth: formattedDob || undefined,
      position: data?.position || undefined,
      shootsCatches: data?.shootsCatches || undefined,
      jerseyNumber: data?.jerseyNumber !== '' && data?.jerseyNumber !== null && data?.jerseyNumber !== undefined ? Number(data?.jerseyNumber) : undefined,
      genderCategory: data?.genderCategory || undefined,
      avatarKey: avatarKeyToSend,
      avatarUrl: avatarUrlToSend,
    };

    console.log('📤 [PATCH /v1/auth/profile Payload Sent]:', JSON.stringify(dto, null, 2));

    try {
      const res = await updateAuthProfile(dto);
      console.log('✅ [ProfilePage] Profile updated successfully via API:', res);
      if (res) {
        setUserProfile(res);
      }
    } catch (err: any) {
      console.error('❌ [ProfilePage] Update Profile Error:', err);
      throw err;
    }

    // Update local preview state
    if (data?.position) setPositionText(data?.position);
    if (data?.jerseyNumber) setJerseyText(data?.jerseyNumber);
    if (data?.bio) setBioText(data?.bio);
    if (data?.city) setLocationText(data?.city);
    if (data?.genderCategory) setGenderText(data?.genderCategory);
    if (data?.dateOfBirth) setDobText(data?.dateOfBirth);
  };

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePost = async (
    content: string,
    postImage?: string,
    privacySettings?: { audience: string; shareWith?: string; dontShareWith?: string; locationTag?: string }
  ) => {
    let audienceEnum: 'PUBLIC' | 'CONNECTIONS' | 'GROUP' | 'CUSTOM' = 'PUBLIC';
    if (privacySettings?.audience === 'Connections') audienceEnum = 'CONNECTIONS';
    if (privacySettings?.audience === 'Groups') audienceEnum = 'GROUP';
    if (privacySettings?.audience === 'Custom') audienceEnum = 'CUSTOM';

    const parseEmails = (str?: string) =>
      str ? str.split(',').map((e) => e.trim()).filter((e) => e.length > 0) : undefined;

    const dto = {
      content,
      mediaUrls: postImage ? [postImage] : undefined,
      audience: audienceEnum,
      placeName: privacySettings?.locationTag || undefined,
      shareWithEmails: parseEmails(privacySettings?.shareWith),
      hideFromEmails: parseEmails(privacySettings?.dontShareWith),
    };

    setIsCreatingPost(true);
    try {
      console.log('🚀 [ProfilePage] Creating post API call...', dto);
      await createPost(dto);
      setIsCreatePostOpen(false);
    } catch (err: any) {
      console.error('❌ [ProfilePage] Create Post Error:', err);
      setIsCreatePostOpen(false);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Sample User Posts matching Figma Screenshot 4
  const userPosts = [
    {
      id: 'post-1',
      authorName: liveName,
      authorRole: `${liveRole} • #${jerseyText}`,
      authorTime: '17 Aug',
      authorAvatar: liveAvatar,
      content: "First tournament of the season! Let's go!",
      postImage: '/playHockey.png',
      likesCount: 13,
      commentsCount: 2,
    },
    {
      id: 'post-2',
      authorName: liveName,
      authorRole: `${liveRole} • #${jerseyText}`,
      authorTime: '20 July',
      authorAvatar: liveAvatar,
      content: "FINAL MATCH DAY! 🏆 Everything we've trained for comes down to this. The ice is ready, and we're ready. #IceHockey #FinalMatch #GameDay",
      postImage: '/mhnStars.png',
      likesCount: 24,
      commentsCount: 5,
    }
  ];

  // Sample Media Photos matching Figma Screenshot 2
  const mediaPhotos = [
    '/playHockey.png',
    '/event1.png',
    '/event2.png',
    '/mhnStars.png',
    '/event3.png',
    '/event4.png'
  ];

  // About Career Teams matching user screenshot
  const [careerTeamsList, setCareerTeamsList] = useState([
    {
      id: 't1',
      name: 'Boston Bruins',
      position: 'Center',
      city: 'Dagestan, Russia',
      isCurrent: true,
      startMonth: 'January',
      startYear: '2024',
      endMonth: '',
      endYear: '',
      description: 'Good times',
      subtitle: 'Center · 2 January 2024 - Present · Dagestan, Russia',
      logo: '/kcBlue.png',
    },
    {
      id: 't2',
      name: 'Carolina Hurricanes',
      position: 'Center',
      city: 'Toronto, Canada',
      isCurrent: false,
      startMonth: '',
      startYear: '2022',
      endMonth: '',
      endYear: '2024',
      description: 'Good times',
      subtitle: 'Center · 2022 - 2024 · Toronto, Canada',
      logo: '/HC.png',
    }
  ]);

  const [isAddTeamFormOpen, setIsAddTeamFormOpen] = useState(true);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  // Form Fields matching user screenshot
  const [teamNameInput, setTeamNameInput] = useState('');
  const [teamPositionInput, setTeamPositionInput] = useState('');
  const [teamCityInput, setTeamCityInput] = useState('');
  const [isCurrentPlayingInput, setIsCurrentPlayingInput] = useState(true);
  const [startMonthInput, setStartMonthInput] = useState('');
  const [startYearInput, setStartYearInput] = useState('');
  const [endMonthInput, setEndMonthInput] = useState('');
  const [endYearInput, setEndYearInput] = useState('');
  const [teamDescInput, setTeamDescInput] = useState('');

  const resetTeamForm = () => {
    setEditingTeamId(null);
    setTeamNameInput('');
    setTeamPositionInput('');
    setTeamCityInput('');
    setIsCurrentPlayingInput(true);
    setStartMonthInput('');
    setStartYearInput('');
    setEndMonthInput('');
    setEndYearInput('');
    setTeamDescInput('');
    setIsAddTeamFormOpen(false);
  };

  const handleSaveTeam = () => {
    if (!teamNameInput.trim()) return;

    const pos = teamPositionInput || 'Player';
    const city = teamCityInput || 'Location';
    const startStr = startMonthInput && startYearInput ? `${startMonthInput} ${startYearInput}` : (startYearInput || '2024');
    const endStr = isCurrentPlayingInput ? 'Present' : (endMonthInput && endYearInput ? `${endMonthInput} ${endYearInput}` : (endYearInput || 'Present'));
    const subtitleText = `${pos} · ${startStr} - ${endStr} · ${city}`;

    if (editingTeamId) {
      setCareerTeamsList((prev) =>
        prev.map((t) =>
          t.id === editingTeamId
            ? {
              ...t,
              name: teamNameInput,
              position: teamPositionInput,
              city: teamCityInput,
              isCurrent: isCurrentPlayingInput,
              startMonth: startMonthInput,
              startYear: startYearInput,
              endMonth: endMonthInput,
              endYear: endYearInput,
              description: teamDescInput,
              subtitle: subtitleText,
            }
            : t
        )
      );
    } else {
      const newTeam = {
        id: `t_${Date.now()}`,
        name: teamNameInput,
        position: teamPositionInput,
        city: teamCityInput,
        isCurrent: isCurrentPlayingInput,
        startMonth: startMonthInput,
        startYear: startYearInput,
        endMonth: endMonthInput,
        endYear: endYearInput,
        description: teamDescInput,
        subtitle: subtitleText,
        logo: '/kcBlue.png',
      };
      setCareerTeamsList((prev) => [newTeam, ...prev]);
    }

    resetTeamForm();
  };

  const handleEditClick = (team: any) => {
    setEditingTeamId(team.id);
    setTeamNameInput(team.name);
    setTeamPositionInput(team.position);
    setTeamCityInput(team.city);
    setIsCurrentPlayingInput(team.isCurrent);
    setStartMonthInput(team.startMonth);
    setStartYearInput(team.startYear);
    setEndMonthInput(team.endMonth || '');
    setEndYearInput(team.endYear || '');
    setTeamDescInput(team.description);
    setIsAddTeamFormOpen(true);
  };

  return (
    <div className="mhn-profile-page-root">
      {/* Top Header Navigation Bar */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
        userName="Jack Ruffle"
        userAvatar="/jack.png"
      />

      {/* Pending Guardian Notice Banner */}
      <PendingBanner
        message="Guardian invitation pending. Your guardian has not yet accepted your request to connect."
        actionText="Manage Invitations"
        onActionClick={() => alert('Manage invitations clicked')}
      />

      {/* Main Centered Content Container */}
      {!user || isPostsLoading ? (
        <ProfileSkeletonLoader />
      ) : (
        <main className="mhn-profile-main-container">
          {/* Profile Hero Card */}
          <div className="mhn-profile-hero-card">
            {/* Cover Banner Area */}
            <div
              className="mhn-profile-cover-banner"
              style={{
                backgroundImage: `url(${liveCoverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <input
                type="file"
                ref={coverFileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverFileChange}
              />

              {/* Full Cover Banner Uploading Overlay */}
              {isUploadingCover && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    color: '#FFFFFF',
                    zIndex: 5,
                  }}
                >
                  <Spinner size="lg" color="#38BDF8" />
                  <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.3px' }}>
                    Uploading cover image...
                  </span>
                </div>
              )}

              {/* Edit Cover Pencil Button */}
              <button
                className="mhn-btn-edit-cover"
                aria-label="Edit cover photo"
                onClick={handleEditCoverClick}
                disabled={isUploadingCover}
                title="Upload new cover image"
                style={{ zIndex: 6 }}
              >
                {isUploadingCover ? (
                  <Spinner size="sm" color="#1860C3" />
                ) : (
                  <img src="/edit2.png" className="edit2-icon" alt="edit-icon" />
                )}
              </button>

              {coverUploadMsg && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '16px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    zIndex: 10,
                  }}
                >
                  ✅ {coverUploadMsg}
                </div>
              )}
            </div>

            {/* Profile Header Content Row */}
            <div className="mhn-profile-header-content">
              {/* Hidden Avatar File Input */}
              <input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarFileChange}
              />

              {/* Overlapping Avatar Circle */}
              <div className="mhn-profile-avatar-outer">
                <div className="mhn-profile-avatar-inner">
                  <img
                    src={liveAvatar}
                    alt={liveName}
                    className="mhn-profile-hero-avatar-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                    }}
                  />
                </div>

                {/* Profile Picture Edit Badge Button */}
                <button
                  type="button"
                  className="mhn-avatar-edit-badge"
                  onClick={handleEditAvatarClick}
                  disabled={isUploadingAvatar}
                  title="Change profile picture"
                  aria-label="Change profile picture"
                >
                  {isUploadingAvatar ? (
                    <Spinner size="sm" color="#FFFFFF" />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                </button>
              </div>

              {/* User Meta & Action Buttons */}
              <div className="mhn-profile-meta-and-actions">
                <div className="mhn-profile-text-meta">
                  <h2 className="mhn-profile-hero-name">{liveName}</h2>
                  <div className="mhn-profile-hero-stats">
                    <span><strong>{user?.counts?.followers ?? 0}</strong> Followers</span>
                    <span><strong>{user?.counts?.following ?? 0}</strong> Following</span>
                  </div>
                  <p className="mhn-profile-hero-role" style={{ marginTop: '4px' }}>
                    {liveRole} • @HC Bloemendaal
                  </p>
                  <div className="mhn-profile-location-line" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{liveCity}</span>
                  </div>
                </div>

                <div className="mhn-profile-action-buttons">
                  <button
                    onClick={() => alert('Share profile link copied!')}
                    className="mhn-btn-share-profile"
                  >
                    <div className="share-profile-text">Share Profile</div>
                  </button>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="mhn-btn-edit-profile"
                  >
                    <div className="edit-profile-text">Edit Profile</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Content Navigation Tabs Bar */}
            <div className="mhn-profile-tabs-bar">
              <button
                onClick={() => setActiveProfileTab('posts')}
                className={`mhn-profile-tab-btn ${activeProfileTab === 'posts' ? 'mhn-profile-tab-active' : ''}`}
              >
                <span>Posts</span>
                {activeProfileTab === 'posts' && <div className="mhn-profile-tab-indicator" />}
              </button>
              <button
                onClick={() => setActiveProfileTab('media')}
                className={`mhn-profile-tab-btn ${activeProfileTab === 'media' ? 'mhn-profile-tab-active' : ''}`}
              >
                <span>Media</span>
                {activeProfileTab === 'media' && <div className="mhn-profile-tab-indicator" />}
              </button>
              <button
                onClick={() => setActiveProfileTab('stats')}
                className={`mhn-profile-tab-btn ${activeProfileTab === 'stats' ? 'mhn-profile-tab-active' : ''}`}
              >
                <span>Stats</span>
                {activeProfileTab === 'stats' && <div className="mhn-profile-tab-indicator" />}
              </button>
              <button
                onClick={() => setActiveProfileTab('about')}
                className={`mhn-profile-tab-btn ${activeProfileTab === 'about' ? 'mhn-profile-tab-active' : ''}`}
              >
                <span>About</span>
                {activeProfileTab === 'about' && <div className="mhn-profile-tab-indicator" />}
              </button>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div>
            {/* 1. POSTS TAB */}
            {activeProfileTab === 'posts' && (
              <div className="mhn-posts-container-card">
                <div className="mhn-posts-header-bar">
                  <h3 className="mhn-posts-title">Posts</h3>
                  <button className="mhn-btn-create-post" onClick={() => setIsCreatePostOpen(true)}>Create Post</button>
                </div>

                {/* Dynamic Live Posts Grid from API if available */}
                <div className="mhn-posts-grid-wrapper">
                  {(liveUserPosts.length > 0 ? liveUserPosts : [
                    {
                      id: 'post-1',
                      body: "First tournament of the season! Let's go!",
                      likeCount: 13,
                      commentCount: 2,
                      repostCount: 0,
                      createdAt: "2026-08-17T11:39:39.830Z",
                      media: [{ url: "/playHockey.png" }],
                      authorProfile: { displayName: liveName, avatarUrl: liveAvatar, position: "C", jerseyNumber: 97 }
                    },
                    {
                      id: 'post-2',
                      body: "🏒 FINAL MATCH DAY! 🏆 Everything we've trained for comes down to this. The ice is ready, and we're ready. #IceHockey #FinalMatch #GameDay",
                      likeCount: 24,
                      commentCount: 5,
                      repostCount: 1,
                      createdAt: "2026-08-17T11:43:09.856Z",
                      media: [{ url: "/mhnStars.png" }],
                      authorProfile: { displayName: liveName, avatarUrl: liveAvatar, position: "C", jerseyNumber: 97 }
                    }
                  ]).map((post: any) => {
                    const author = post.authorProfile || post.author || {};
                    const postName = author.displayName || liveName;
                    const postAvatar = author.avatarUrl || liveAvatar;
                    const postRole = author.position && author.jerseyNumber ? `${author.position} • #${author.jerseyNumber}` : `${liveRole} • #${jerseyText}`;
                    const mediaUrl = post.media && post.media.length > 0 ? post.media[0].url : null;
                    const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '1 Aug';

                    return (
                      <FeedPostCard
                        key={post.id}
                        id={post.id}
                        authorName={postName}
                        authorRole={postRole}
                        authorTime={formattedDate}
                        authorAvatar={postAvatar}
                        content={post.body || ''}
                        postImage={mediaUrl || undefined}
                        likesCount={post.likeCount ?? post.reactionsCount ?? 0}
                        commentsCount={post.commentCount ?? post.commentsCount ?? 0}
                        repostCount={post.repostCount ?? post.repostsCount ?? 0}
                        userReaction={post.userReaction}
                        isSelf={true}
                        onDeleteSuccess={(deletedId, msg) => {
                          console.log(`🗑️ [ProfilePage] Post ${deletedId} deleted.`);
                          setToast({ message: msg || 'Post deleted successfully!', type: 'success' });
                        }}
                      />
                    );
                  })}
                </div>

                {/* Bottom Show All Button */}
                <div className="mhn-posts-show-all-divider">
                  <button className="mhn-btn-show-all">Show All</button>
                </div>
              </div>
            )}

            {/* 2. MEDIA TAB */}
            {activeProfileTab === 'media' && (
              <div className="mhn-profile-tab-content-card-full mhn-media-card-override">
                <div className="mhn-media-grid">
                  {mediaPhotos.map((photo, idx) => (
                    <div key={idx} className="mhn-media-item-card">
                      <img src={photo} alt={`Media ${idx + 1}`} className="mhn-media-img" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. STATS TAB */}
            {activeProfileTab === 'stats' && (
              <div className="mhn-profile-tab-content-card-full">
                <div className="mhn-profile-stats-container">
                  {/* 1. Filter Dropdowns Row */}
                  <div className="mhn-stats-filters-row">
                    <div className="mhn-stats-select-wrapper">
                      <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                        onFocus={() => setActiveDropdown('season')}
                        onBlur={() => setActiveDropdown(null)}
                        className="mhn-stats-select"
                      >
                        <option value="2025-26">2025-26</option>
                        <option value="2024-25">2024-25</option>
                      </select>
                      <img
                        src="/arrowBottom.png"
                        alt="arrow"
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          width: '10px',
                          height: '6px',
                          transform: activeDropdown === 'season' ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>

                    <div className="mhn-stats-select-wrapper">
                      <select
                        value={selectedSeasonType}
                        onChange={(e) => setSelectedSeasonType(e.target.value)}
                        onFocus={() => setActiveDropdown('seasonType')}
                        onBlur={() => setActiveDropdown(null)}
                        className="mhn-stats-select"
                      >
                        <option value="Regular Season">Regular Season</option>
                        <option value="Playoffs">Playoffs</option>
                      </select>
                      <img
                        src="/arrowBottom.png"
                        alt="arrow"
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          width: '10px',
                          height: '6px',
                          transform: activeDropdown === 'seasonType' ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>

                    <div className="mhn-stats-select-wrapper">
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        onFocus={() => setActiveDropdown('unit')}
                        onBlur={() => setActiveDropdown(null)}
                        className="mhn-stats-select"
                      >
                        <option value="Miles • MI">Miles • MI</option>
                        <option value="KM • KPH">KM • KPH</option>
                      </select>
                      <img
                        src="/arrowBottom.png"
                        alt="arrow"
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          width: '10px',
                          height: '6px',
                          transform: activeDropdown === 'unit' ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* 2. Season Summary Bar */}
                  <div className="mhn-season-summary-card">
                    <h3 className="mhn-season-title">2025-26 Regular Season</h3>
                    <div className="mhn-season-metrics-group">
                      <div className="mhn-season-metric-col">
                        <span className="mhn-season-metric-label">GP</span>
                        <span className="mhn-season-metric-value">81</span>
                      </div>
                      <div className="mhn-season-metric-divider" />
                      <div className="mhn-season-metric-col">
                        <span className="mhn-season-metric-label">G</span>
                        <span className="mhn-season-metric-value">7</span>
                      </div>
                      <div className="mhn-season-metric-divider" />
                      <div className="mhn-season-metric-col">
                        <span className="mhn-season-metric-label">A</span>
                        <span className="mhn-season-metric-value">7</span>
                      </div>
                      <div className="mhn-season-metric-divider" />
                      <div className="mhn-season-metric-col">
                        <span className="mhn-season-metric-label">P</span>
                        <span className="mhn-season-metric-value">14</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Three Percentile Cards Grid */}
                  <div className="mhn-percentile-cards-grid">
                    {/* Card 1 */}
                    <div className="mhn-percentile-card">
                      <div className="mhn-percentile-card-header">
                        <span className="mhn-percentile-badge-blue">60th PERCENTILE</span>
                        <div className="mhn-percentile-info-icon" title="Hardest Shot Info">i</div>
                      </div>
                      <div className="mhn-percentile-value">86.45</div>
                      <p className="mhn-percentile-label">Hardest Shot • MPH</p>
                    </div>

                    {/* Card 2 */}
                    <div className="mhn-percentile-card">
                      <div className="mhn-percentile-card-header">
                        <span className="mhn-percentile-badge-dark">99th PERCENTILE</span>
                        <div className="mhn-percentile-info-icon" title="Max Skating Speed Info">i</div>
                      </div>
                      <div className="mhn-percentile-value">24.94</div>
                      <p className="mhn-percentile-label">Max Skating Speed • MPH</p>
                    </div>

                    {/* Card 3 */}
                    <div className="mhn-percentile-card">
                      <div className="mhn-percentile-card-header">
                        <span className="mhn-percentile-badge-outline">&lt;50th PERCENTILE</span>
                        <div className="mhn-percentile-info-icon" title="Most Miles Skated Info">i</div>
                      </div>
                      <div className="mhn-percentile-value">2.63</div>
                      <p className="mhn-percentile-label">Most Miles Skated • Game</p>
                    </div>
                  </div>

                  {/* 4. Shots On Goal Zone Map Card */}
                  <div className="mhn-stats-section-card">
                    <h3 className="mhn-stats-section-title">
                      <span>Shots On Goal Zone Map</span>
                      <span className="mhn-percentile-info-icon" style={{ width: '18px', height: '18px', fontSize: '11px' }}>i</span>
                    </h3>

                    <div className="mhn-zone-map-content-row">
                      {/* Left: SVG Zone Map Visual */}
                      <div className="mhn-zone-map-visual">
                        <svg width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Outer Rink Boundary */}
                          <path d="M 20,180 L 20,80 A 90,90 0 0,1 200,80 L 200,180 Z" stroke="#0F172A" strokeWidth="2.5" fill="#FFFFFF" />

                          {/* Zone Slices & Blue Highlights */}
                          <path d="M 20,80 A 90,90 0 0,1 200,80 L 160,110 L 60,110 Z" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
                          <path d="M 60,110 L 160,110 L 140,150 L 80,150 Z" fill="#0091FF" stroke="#0F172A" strokeWidth="1.5" />
                          <path d="M 20,180 L 200,180 L 140,150 L 80,150 Z" fill="#0284C7" stroke="#0F172A" strokeWidth="1.5" />

                          {/* Shot Numbers in Zones */}
                          <text x="110" y="170" fill="#FFFFFF" fontSize="14" fontWeight="800" textAnchor="middle">6</text>

                          {/* Additional Sub-Zones Outlines */}
                          <rect x="35" y="45" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                          <rect x="168" y="45" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                          <rect x="48" y="70" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                          <rect x="155" y="70" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                          <rect x="35" y="98" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                          <rect x="168" y="98" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                          <rect x="75" y="102" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                          <rect x="130" y="102" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                          <rect x="102" y="125" width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
                        </svg>

                        {/* Percentile Gradient Bar Legend */}
                        <div className="mhn-percentile-legend-bar">
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                            <span>Percentile</span>
                          </div>
                          <div className="mhn-legend-bar-img" />
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', color: '#64748B', fontWeight: 700 }}>
                            <span>1-50</span>
                            <span>51-80</span>
                            <span>81-99</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Breakdown Table */}
                      <div className="mhn-zone-map-table">
                        <div className="mhn-zone-table-header">
                          <span>Beck Malenstyn</span>
                          <span>Avg. by Position (F/D)</span>
                        </div>

                        {/* Row 1 */}
                        <div className="mhn-zone-table-row">
                          <div className="mhn-zone-table-left">
                            <span className="mhn-badge-pill-outline">&lt;50th</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div className="mhn-zone-stats-nums">
                                <span className="mhn-num-main">72</span>
                                <span className="mhn-num-avg">86</span>
                              </div>
                              <span className="mhn-zone-label-sub">ALL LOCATIONS</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 2 */}
                        <div className="mhn-zone-table-row">
                          <div className="mhn-zone-table-left">
                            <span className="mhn-badge-pill-cyan">52nd</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div className="mhn-zone-stats-nums">
                                <span className="mhn-num-main">30</span>
                                <span className="mhn-num-avg">32</span>
                              </div>
                              <span className="mhn-zone-label-sub">HIGH-DANGER</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 3 */}
                        <div className="mhn-zone-table-row">
                          <div className="mhn-zone-table-left">
                            <span className="mhn-badge-pill-outline">&lt;50th</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div className="mhn-zone-stats-nums">
                                <span className="mhn-num-main">14</span>
                                <span className="mhn-num-avg">27</span>
                              </div>
                              <span className="mhn-zone-label-sub">MID-RANGE</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 4 */}
                        <div className="mhn-zone-table-row">
                          <div className="mhn-zone-table-left">
                            <span className="mhn-badge-pill-cyan">79th</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div className="mhn-zone-stats-nums">
                                <span className="mhn-num-main">13</span>
                                <span className="mhn-num-avg">8</span>
                              </div>
                              <span className="mhn-zone-label-sub">LONG-RANGE</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Zone Time Card */}
                  <div className="mhn-stats-section-card">
                    <h3 className="mhn-stats-section-title">
                      <span>Zone Time</span>
                      <span className="mhn-percentile-info-icon" style={{ width: '18px', height: '18px', fontSize: '11px' }}>i</span>
                    </h3>

                    <div className="mhn-zone-time-visual-wrapper">
                      {/* SVG Rink Overlay Lines */}
                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.4 }} viewBox="0 0 600 200" fill="none">
                        <rect x="10" y="10" width="580" height="180" rx="30" stroke="#FCA5A5" strokeWidth="1.5" />
                        <line x1="200" y1="10" x2="200" y2="190" stroke="#0091FF" strokeWidth="2" />
                        <line x1="400" y1="10" x2="400" y2="190" stroke="#0091FF" strokeWidth="2" />
                        <line x1="300" y1="10" x2="300" y2="190" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 4" />
                        <circle cx="150" cy="100" r="30" stroke="#FCA5A5" strokeWidth="1" />
                        <circle cx="450" cy="100" r="30" stroke="#FCA5A5" strokeWidth="1" />
                      </svg>

                      {/* 3 Zone Cards Container */}
                      <div className="mhn-zone-time-cards-container">
                        {/* Defensive Zone Card */}
                        <div className="mhn-zone-time-card">
                          <span className="mhn-badge-pill-outline">&lt;50th</span>
                          <div className="mhn-zone-time-val">43.1%</div>
                          <h4 className="mhn-zone-time-title">DEFENSIVE ZONE</h4>
                          <span className="mhn-zone-time-subtext">NHL Average: 40.1%</span>
                        </div>

                        {/* Neutral Zone Card */}
                        <div className="mhn-zone-time-card">
                          <span className="mhn-badge-pill-outline">&lt;50th</span>
                          <div className="mhn-zone-time-val">17.6%</div>
                          <h4 className="mhn-zone-time-title">NEUTRAL ZONE</h4>
                          <span className="mhn-zone-time-subtext">NHL Average: 16.8%</span>
                        </div>

                        {/* Offensive Zone Card */}
                        <div className="mhn-zone-time-card">
                          <span className="mhn-badge-pill-outline">&lt;50th</span>
                          <div className="mhn-zone-time-val">39.2%</div>
                          <h4 className="mhn-zone-time-title">OFFENSIVE ZONE</h4>
                          <span className="mhn-zone-time-subtext">NHL Average: 43.1%</span>
                        </div>
                      </div>
                    </div>

                    {/* Percentile Gradient Bar Legend */}
                    <div className="mhn-percentile-legend-bar">
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                        <span>Percentile</span>
                      </div>
                      <div className="mhn-legend-bar-img" />
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', color: '#64748B', fontWeight: 700 }}>
                        <span>1-50</span>
                        <span>51-80</span>
                        <span>81-99</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 4. ABOUT TAB */}
            {activeProfileTab === 'about' && (
              <div className="mhn-profile-tab-content-card-full mhn-about-card-padding-override">
                <div className="mhn-about-2col-container">
                  {/* Left Sidebar */}
                  <div className="mhn-about-sidebar">
                    <h3 className="mhn-about-sidebar-title">About</h3>

                    <nav className="mhn-about-menu-nav">
                      <button
                        onClick={() => setActiveAboutSection('intro')}
                        className={`mhn-about-menu-btn ${activeAboutSection === 'intro' ? 'mhn-about-btn-active' : ''}`}
                      >
                        Intro
                      </button>
                      <button
                        onClick={() => setActiveAboutSection('career')}
                        className={`mhn-about-menu-btn ${activeAboutSection === 'career' ? 'mhn-about-btn-active' : ''}`}
                      >
                        Career
                      </button>
                      <button
                        onClick={() => setActiveAboutSection('details')}
                        className={`mhn-about-menu-btn ${activeAboutSection === 'details' ? 'mhn-about-btn-active' : ''}`}
                      >
                        Personal details
                      </button>
                    </nav>
                  </div>

                  {/* Right Detail Panel */}
                  <div className="mhn-about-main-panel">
                    {activeAboutSection === 'intro' && (
                      <div className="mhn-about-intro-form">
                        {/* Bio */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">Bio</label>
                          <div style={{ position: 'relative' }}>
                            <textarea
                              value={bioText}
                              onChange={(e) => setBioText(e.target.value)}
                              className="mhn-about-input-box mhn-about-textarea-box"
                              rows={3}
                              placeholder="Write something about yourself..."
                            />
                          </div>
                        </div>

                        {/* Primary Role (Read-Only / System Managed) */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">
                            Role <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748B' }}>(Managed by system)</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={liveRole}
                              disabled
                              className="mhn-about-input-box mhn-about-input-disabled"
                              title="Role cannot be changed"
                            />
                          </div>
                        </div>

                        {/* Position */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">Position</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={positionText}
                              onChange={(e) => setPositionText(e.target.value)}
                              className="mhn-about-input-box"
                              placeholder="e.g. Center, Winger, Goalie"
                            />
                          </div>
                        </div>

                        {/* Jersey Number */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">Jersey Number</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="number"
                              value={jerseyText}
                              onChange={(e) => setJerseyText(e.target.value)}
                              className="mhn-about-input-box"
                              placeholder="e.g. 97"
                            />
                          </div>
                        </div>

                        {/* Save & Feedback Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                          <button
                            type="button"
                            className="mhn-about-btn-save"
                            style={{
                              height: '38px',
                              padding: '0 24px',
                              backgroundColor: '#1860C3',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onClick={handleSaveIntro}
                            disabled={isSavingIntro}
                          >
                            {isSavingIntro && <Spinner size="sm" color="#FFFFFF" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            className="mhn-about-btn-cancel"
                            style={{
                              height: '38px',
                              padding: '0 16px',
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              borderRadius: '8px',
                              fontWeight: 600,
                              border: '1px solid #CBD5E1',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              if (user?.profile) {
                                setBioText(user.profile.bio || '');
                                setPositionText(user.profile.position || '');
                                setJerseyText(user.profile.jerseyNumber !== null && user.profile.jerseyNumber !== undefined ? String(user.profile.jerseyNumber) : '');
                              }
                            }}
                          >
                            Cancel
                          </button>
                          {introSaveMsg && (
                            <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600 }}>
                              ✅ {introSaveMsg}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {activeAboutSection === 'career' && (
                      <div className="mhn-about-section-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Teams Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Teams</h4>
                          <button
                            type="button"
                            onClick={() => {
                              if (isAddTeamFormOpen && !editingTeamId) {
                                resetTeamForm();
                              } else {
                                resetTeamForm();
                                setIsAddTeamFormOpen(true);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Add Team"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                        </div>

                        {/* Add / Edit Team Form Card matching User Screenshot */}
                        {isAddTeamFormOpen && (
                          <div
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: '12px',
                              padding: '20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '16px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                          >
                            {/* Team Input */}
                            <div>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Team
                              </label>
                              <input
                                type="text"
                                value={teamNameInput}
                                onChange={(e) => setTeamNameInput(e.target.value)}
                                placeholder="Team name"
                                style={{
                                  width: '100%',
                                  height: '42px',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                  padding: '0 12px',
                                  fontSize: '14px',
                                  outline: 'none',
                                }}
                              />
                            </div>

                            {/* Position Select */}
                            <div>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Position
                              </label>
                              <select
                                value={teamPositionInput}
                                onChange={(e) => setTeamPositionInput(e.target.value)}
                                style={{
                                  width: '100%',
                                  height: '42px',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                  padding: '0 12px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  backgroundColor: '#FFFFFF',
                                  color: teamPositionInput ? '#0F172A' : '#94A3B8',
                                }}
                              >
                                <option value="">Select</option>
                                <option value="Center">Center</option>
                                <option value="Left Wing">Left Wing</option>
                                <option value="Right Wing">Right Wing</option>
                                <option value="Defense">Defense</option>
                                <option value="Goaltender">Goaltender</option>
                              </select>
                            </div>

                            {/* City/Town Select */}
                            <div>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                City/Town
                              </label>
                              <select
                                value={teamCityInput}
                                onChange={(e) => setTeamCityInput(e.target.value)}
                                style={{
                                  width: '100%',
                                  height: '42px',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                  padding: '0 12px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  backgroundColor: '#FFFFFF',
                                  color: teamCityInput ? '#0F172A' : '#94A3B8',
                                }}
                              >
                                <option value="">Select</option>
                                <option value="Dagestan, Russia">Dagestan, Russia</option>
                                <option value="Toronto, Canada">Toronto, Canada</option>
                                <option value="Austria, Europe">Austria, Europe</option>
                                <option value="Boston, MA">Boston, MA</option>
                              </select>
                            </div>

                            {/* Checkbox: I currently playing here */}
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                              <input
                                type="checkbox"
                                checked={isCurrentPlayingInput}
                                onChange={(e) => setIsCurrentPlayingInput(e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: '#1860C3', cursor: 'pointer' }}
                              />
                              <span>I currently playing here</span>
                            </label>

                            {/* Start Date: Month + Year side-by-side */}
                            <div>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Start date
                              </label>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <select
                                  value={startMonthInput}
                                  onChange={(e) => setStartMonthInput(e.target.value)}
                                  style={{
                                    height: '42px',
                                    borderRadius: '8px',
                                    border: '1px solid #CBD5E1',
                                    padding: '0 12px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: '#FFFFFF',
                                    color: startMonthInput ? '#0F172A' : '#94A3B8',
                                  }}
                                >
                                  <option value="">Month</option>
                                  <option value="January">January</option>
                                  <option value="February">February</option>
                                  <option value="March">March</option>
                                  <option value="April">April</option>
                                  <option value="May">May</option>
                                  <option value="June">June</option>
                                  <option value="July">July</option>
                                  <option value="August">August</option>
                                  <option value="September">September</option>
                                  <option value="October">October</option>
                                  <option value="November">November</option>
                                  <option value="December">December</option>
                                </select>

                                <select
                                  value={startYearInput}
                                  onChange={(e) => setStartYearInput(e.target.value)}
                                  style={{
                                    height: '42px',
                                    borderRadius: '8px',
                                    border: '1px solid #CBD5E1',
                                    padding: '0 12px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    backgroundColor: '#FFFFFF',
                                    color: startYearInput ? '#0F172A' : '#94A3B8',
                                  }}
                                >
                                  <option value="">Year</option>
                                  {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2010'].map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* End Date (if !isCurrentPlayingInput) */}
                            {!isCurrentPlayingInput && (
                              <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                  End date
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                  <select
                                    value={endMonthInput}
                                    onChange={(e) => setEndMonthInput(e.target.value)}
                                    style={{
                                      height: '42px',
                                      borderRadius: '8px',
                                      border: '1px solid #CBD5E1',
                                      padding: '0 12px',
                                      fontSize: '14px',
                                      outline: 'none',
                                      backgroundColor: '#FFFFFF',
                                      color: endMonthInput ? '#0F172A' : '#94A3B8',
                                    }}
                                  >
                                    <option value="">Month</option>
                                    <option value="January">January</option>
                                    <option value="February">February</option>
                                    <option value="March">March</option>
                                    <option value="April">April</option>
                                    <option value="May">May</option>
                                    <option value="June">June</option>
                                    <option value="July">July</option>
                                    <option value="August">August</option>
                                    <option value="September">September</option>
                                    <option value="October">October</option>
                                    <option value="November">November</option>
                                    <option value="December">December</option>
                                  </select>

                                  <select
                                    value={endYearInput}
                                    onChange={(e) => setEndYearInput(e.target.value)}
                                    style={{
                                      height: '42px',
                                      borderRadius: '8px',
                                      border: '1px solid #CBD5E1',
                                      padding: '0 12px',
                                      fontSize: '14px',
                                      outline: 'none',
                                      backgroundColor: '#FFFFFF',
                                      color: endYearInput ? '#0F172A' : '#94A3B8',
                                    }}
                                  >
                                    <option value="">Year</option>
                                    {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2010'].map((y) => (
                                      <option key={y} value={y}>{y}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}

                            {/* Description Textarea */}
                            <div>
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Description
                              </label>
                              <textarea
                                rows={3}
                                value={teamDescInput}
                                onChange={(e) => setTeamDescInput(e.target.value)}
                                placeholder="Tell us about it"
                                style={{
                                  width: '100%',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                  padding: '10px 12px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                }}
                              />
                            </div>

                            {/* Buttons Row: Cancel and Save */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                              <button
                                type="button"
                                onClick={resetTeamForm}
                                style={{
                                  backgroundColor: '#E2E8F0',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '8px 20px',
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: '#334155',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveTeam}
                                disabled={!teamNameInput.trim()}
                                style={{
                                  backgroundColor: teamNameInput.trim() ? '#1860C3' : '#CBD5E1',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '8px 24px',
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  color: '#FFFFFF',
                                  cursor: teamNameInput.trim() ? 'pointer' : 'not-allowed',
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Saved Career Teams List matching user screenshot */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {careerTeamsList.map((team) => (
                            <div
                              key={team.id}
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #F1F5F9',
                                borderRadius: '10px',
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '12px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                <img
                                  src={team.logo}
                                  alt={team.name}
                                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'contain' }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/kcBlue.png';
                                  }}
                                />
                                <div>
                                  <h5 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>
                                    {team.name}
                                  </h5>
                                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 4px 0', fontWeight: 500 }}>
                                    {team.subtitle}
                                  </p>
                                  {team.description && (
                                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, fontStyle: 'italic' }}>
                                      {team.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleEditClick(team)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title="Edit team details"
                              >
                                <img src="/edit3.png" alt="Edit" style={{ width: '16px', height: '16px' }} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeAboutSection === 'details' && (
                      <div className="mhn-about-section-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Location / City */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">Location (City)</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={locationText}
                              onChange={(e) => setLocationText(e.target.value)}
                              className="mhn-about-input-box"
                              placeholder="e.g. Toronto, ON"
                            />
                          </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">Date of Birth</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="date"
                              value={dobText}
                              onChange={(e) => setDobText(e.target.value)}
                              className="mhn-about-input-box"
                            />
                          </div>
                        </div>

                        {/* Gender Category */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">Gender</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={genderText}
                              onChange={(e) => setGenderText(e.target.value)}
                              className="mhn-about-input-box"
                              placeholder="e.g. Male, Female, Other"
                            />
                          </div>
                        </div>

                        {/* Public Reference ID (Read-Only) */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">
                            Public Reference ID <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748B' }}>(Read-Only)</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={(user?.profile as any)?.publicRef || 'HKY-B5E3EMET'}
                              disabled
                              className="mhn-about-input-box mhn-about-input-disabled"
                            />
                          </div>
                        </div>

                        {/* Account Status (Read-Only) */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">
                            Account Status <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748B' }}>(Read-Only)</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={user?.status || 'ACTIVE'}
                              disabled
                              className="mhn-about-input-box mhn-about-input-disabled"
                            />
                          </div>
                        </div>

                        {/* Save & Feedback Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                          <button
                            type="button"
                            className="mhn-about-btn-save"
                            style={{
                              height: '38px',
                              padding: '0 24px',
                              backgroundColor: '#1860C3',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onClick={handleSaveDetails}
                            disabled={isSavingDetails}
                          >
                            {isSavingDetails && <Spinner size="sm" color="#FFFFFF" />}
                            <span>Save Details</span>
                          </button>
                          <button
                            type="button"
                            className="mhn-about-btn-cancel"
                            style={{
                              height: '38px',
                              padding: '0 16px',
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              borderRadius: '8px',
                              fontWeight: 600,
                              border: '1px solid #CBD5E1',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              if (user?.profile) {
                                setLocationText(user.profile.city || '');
                                setDobText(user.profile.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '');
                                setGenderText(user.profile.genderCategory || '');
                              }
                            }}
                          >
                            Cancel
                          </button>
                          {detailsSaveMsg && (
                            <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600 }}>
                              ✅ {detailsSaveMsg}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onSubmit={handleCreatePost}
          isLoading={isCreatingPost}
          userName={liveName}
          userAvatar={liveAvatar}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Global Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

