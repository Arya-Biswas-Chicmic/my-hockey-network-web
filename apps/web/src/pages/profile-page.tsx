import { Button } from '@/components/common/Button';
import { Input, Select, Textarea } from '@/components/common/FormControls';
import React, { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { PendingBanner } from '@/components/common/PendingBanner';
import { NoDataFound } from '@/components/common/no-data-found';
import { FeedPostCard } from '@/components/features/home/FeedPostCard';
import { CreatePostModal } from '@/components/features/home/CreatePostModal';
import { EditProfileModal, EditProfileFormData, ProfileSkeletonLoader } from '@/components/features/profile';
import { FeedPostSkeleton } from '@/components/features/home/HomeSkeletonLoader';
import { Spinner } from '@/components/common/Spinner';
import { DeleteCareerModal } from '@/components/common/DeleteCareerModal';
import { useAuth } from '@/hooks/use-auth';
import { resolveMediaUrl, resolveCoverUrl } from '@/utils/mediaUtils';
import { isEmailValid } from '@my-hockey-network/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { NavTabEnum, ProfileTabEnum, ProfileAboutSectionEnum, PostAudienceEnum } from '@my-hockey-network/contracts';
import { ApprovalCodeModal } from '@/components/supervision/ApprovalCodeModal';
import { NetworkSkeletonGrid } from '@/components/features/network/NetworkSkeletonLoader';


import {
  createPost,
  getFeed,
  getUserPosts,
  updateAuthProfile,
  uploadMediaFile,
  getPendingGuardianRequests,
  acceptGuardianRequest,
  declineGuardianRequest,
  getProfile,
  createCareerEntry,
  updateCareerEntry,
  deleteCareerEntry,
  CareerEntry,
  type GuardianRelationshipRequest,
  type PostItem,
} from '@my-hockey-network/core';
import { QueryKeys } from '@my-hockey-network/contracts';
import { globalQueryClient, invalidateQueryPrefix, useQuery } from '@/query';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { validateProfileField, validateCareerField } from '@my-hockey-network/validation';
import { Dropdown } from '@/components/common/FormControls';
import { CareerFormFields } from '@/components/features/profile/CareerFormFields';
import { PersonalDetailsFields } from '@/components/features/profile/PersonalDetailsFields';
import { RinkZoneOverlayIcon, ShotZoneMapIcon } from '@/components/icons/HockeyAnalyticsVisuals';
import { BadgeCheck, Camera, Plus, Trash2 } from 'lucide-react';

interface PageProps {
  onNavigate?: (screen: string, extraData?: Record<string, unknown>) => void;
  onLogout?: () => void;
}

export const ProfilePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { user, setUserProfile, loadAuthMe } = useAuth();
  const { permissions, requirePermission } = useFeedPermissions(onNavigate);
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [coverUploadMsg, setCoverUploadMsg] = useState<string | null>(null);

  const handleOpenCreatePost = () => {
    if (requirePermission()) {
      setIsCreatePostOpen(true);
    }
  };

  const handleEditCoverClick = () => {
    coverFileInputRef.current?.click();
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setCoverUploadMsg(null);

    try {
      const uploadRes = await uploadMediaFile(file, 'COVER');
      if (uploadRes?.storageKey) {
        const updated = await updateAuthProfile({ coverImageKey: uploadRes.storageKey });
        if (updated) {
          setUserProfile(updated);
        }
        await loadAuthMe(true, true);
        setCoverUploadMsg('Cover image updated successfully!');
        setTimeout(() => setCoverUploadMsg(null), 3000);
      }
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_UPLOAD_COVER);
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
      const uploadRes = await uploadMediaFile(file, 'AVATAR');
      if (uploadRes?.storageKey) {
        const updated = await updateAuthProfile({ avatarKey: uploadRes.storageKey });
        if (updated) {
          setUserProfile(updated);
        }
        await loadAuthMe(true, true);
      }
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_UPLOAD_AVATAR);
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };
  const [activeNavTab, setActiveNavTab] = useState<NavTabEnum | string>(NavTabEnum.PROFILE);
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTabEnum>(ProfileTabEnum.ABOUT);
  const [activeAboutSection, setActiveAboutSection] = useState<ProfileAboutSectionEnum>(ProfileAboutSectionEnum.INTRO);

  const [pendingGuardianReqs, setPendingGuardianReqs] = useState<GuardianRelationshipRequest[]>([]);
  const [isGuardianReqsLoading, setIsGuardianReqsLoading] = useState<boolean>(false);
  const [guardianReqActionLoading, setGuardianReqActionLoading] = useState<boolean>(false);
  const [guardianApprovalModalConfig, setGuardianApprovalModalConfig] = useState<{
    isOpen: boolean;
    targetName: string;
    code?: string;
  }>({ isOpen: false, targetName: '', code: '' });

  const fetchPendingGuardianRequestsList = async () => {
    try {
      setIsGuardianReqsLoading(true);
      const res = await getPendingGuardianRequests();
      const items = res.items;
      setPendingGuardianReqs(Array.isArray(items) ? items : []);
    } catch (err: unknown) {
      console.warn('Pending guardian requests load notice:', err);
    } finally {
      setIsGuardianReqsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS) {
      fetchPendingGuardianRequestsList();
    }
  }, [activeProfileTab]);

  const handleAcceptGuardianReq = async (code: string) => {
    if (!code) return;
    setGuardianReqActionLoading(true);
    try {
      const res = await acceptGuardianRequest(code);
      showSuccessToast(res.message || SUCCESS_MESSAGES.GUARDIAN_REQUEST_APPROVED);
      fetchPendingGuardianRequestsList();
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_APPROVE_REQUEST);
      throw err;
    } finally {
      setGuardianReqActionLoading(false);
    }
  };

  const handleDeclineGuardianReq = async (code: string) => {
    if (!code) return;
    setGuardianReqActionLoading(true);
    try {
      const res = await declineGuardianRequest(code);
      showSuccessToast(res.message || SUCCESS_MESSAGES.GUARDIAN_REQUEST_DECLINED);
      fetchPendingGuardianRequestsList();
    } catch (err: unknown) {
      showErrorToast(err, ERROR_MESSAGES.FAILED_DECLINE_REQUEST);
    } finally {
      setGuardianReqActionLoading(false);
    }
  };


  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigationState = location.state as { userId?: string; selectedWardId?: string; childId?: string } | null;
  const targetUserId =
    searchParams.get('userId') ||
    searchParams.get('selectedWardId') ||
    searchParams.get('childId') ||
    navigationState?.userId ||
    navigationState?.selectedWardId ||
    navigationState?.childId;

  const ownProfileId = user?.profile?.id || user?.id;
  const effectiveProfileId = targetUserId || ownProfileId || null;
  const isOwnProfile = !targetUserId || targetUserId === ownProfileId || targetUserId === user?.id;
  const isParentRole = user?.primaryRole === 'PARENT' || user?.roleAssignments?.some((r) => r.role === 'PARENT');
  const canEditProfile = isOwnProfile || isParentRole;

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
  const [introErrors, setIntroErrors] = useState<Record<string, string>>({});
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({});

  // Synchronize inputs with live user profile data
  React.useEffect(() => {
    setBioText(liveBio);
    setPositionText(livePosition);
    setJerseyText(liveJersey);
    setLocationText(liveCity);
    setDobText(liveDob);
    setGenderText(liveGender);
  }, [liveBio, livePosition, liveJersey, liveCity, liveDob, liveGender]);

  const handleSaveIntro = async () => {
    const errs: Record<string, string> = {};
    const bioErr = validateProfileField('bio', bioText);
    if (bioErr) errs.bio = bioErr;
    const jerseyErr = validateProfileField('jerseyNumber', jerseyText);
    if (jerseyErr) errs.jerseyNumber = jerseyErr;

    if (Object.keys(errs).length > 0) {
      setIntroErrors(errs);
      return;
    }

    setIntroErrors({});
    setIsSavingIntro(true);
    setIntroSaveMsg(null);
    try {
      const ALLOWED_POSITIONS = ['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goaltender'];
      const validPosition = ALLOWED_POSITIONS.includes(positionText) ? positionText : 'Center';
      const dto = {
        bio: bioText || undefined,
        position: validPosition,
        jerseyNumber: jerseyText !== '' ? Number(jerseyText) : undefined,
      };
      const res = await updateAuthProfile(dto);
      if (res) {
        setUserProfile(res);
      }
      await loadAuthMe(true, true);
      setIntroSaveMsg('Intro saved successfully!');
      setTimeout(() => setIntroSaveMsg(null), 3000);
    } catch (err: unknown) {
      console.error('❌ Save Intro error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_SAVE_INTRO);
    } finally {
      setIsSavingIntro(false);
    }
  };

  const handleSaveDetails = async () => {
    const errs: Record<string, string> = {};
    const cityErr = validateProfileField('city', locationText);
    if (cityErr) errs.city = cityErr;
    const dobErr = validateProfileField('dateOfBirth', dobText);
    if (dobErr) errs.dateOfBirth = dobErr;

    if (Object.keys(errs).length > 0) {
      setDetailsErrors(errs);
      return;
    }

    setDetailsErrors({});
    setIsSavingDetails(true);
    setDetailsSaveMsg(null);
    try {
      const dto = {
        city: locationText || undefined,
        dateOfBirth: dobText || undefined,
        genderCategory: genderText || undefined,
      };
      const res = await updateAuthProfile(dto);
      if (res) {
        setUserProfile(res);
      }
      await loadAuthMe(true, true);
      setDetailsSaveMsg('Personal details saved successfully!');
      setTimeout(() => setDetailsSaveMsg(null), 3000);
    } catch (err: unknown) {
      console.error('❌ Save Details error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_SAVE_PERSONAL_DETAILS);
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
  const [liveUserPosts, setLiveUserPosts] = useState<PostItem[]>([]);

  const { data: postsRes, isLoading: isPostsLoading } = useQuery(
    effectiveProfileId ? `${QueryKeys.USER_POSTS}:${effectiveProfileId}` : null,
    effectiveProfileId ? () => getUserPosts(effectiveProfileId) : null,
    { staleTime: 0 }
  );

  React.useEffect(() => {
    if (postsRes?.items && Array.isArray(postsRes.items)) {
      setLiveUserPosts(postsRes.items);
    } else {
      setLiveUserPosts([]);
    }
  }, [postsRes]);

  const handleSaveProfile = async (data: EditProfileFormData) => {

    // Format dateOfBirth as YYYY-MM-DD (e.g., "2004-03-11") matching backend payload
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
      const res = await updateAuthProfile(dto);
      if (res) {
        setUserProfile(res);
        void globalQueryClient.invalidateQueries({ queryKey: [QueryKeys.AUTH_ME] });
        await loadAuthMe(true, true);

        // Update local preview state
        if (data?.position) setPositionText(data?.position);
        if (data?.jerseyNumber) setJerseyText(data?.jerseyNumber);
        if (data?.bio) setBioText(data?.bio);
        if (data?.city) setLocationText(data?.city);
        if (data?.genderCategory) setGenderText(data?.genderCategory);
        if (data?.dateOfBirth) setDobText(data?.dateOfBirth);

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
    postImage?: string,
    privacySettings?: { audience: string; shareWith?: string; dontShareWith?: string; locationTag?: string }
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
      content,
      mediaUrls: postImage ? [postImage] : undefined,
      audience: audienceEnum,
      placeName: privacySettings?.locationTag || undefined,
      shareWithEmails: parseEmails(privacySettings?.shareWith),
      hideFromEmails: parseEmails(privacySettings?.dontShareWith),
    };

    setIsCreatingPost(true);
    try {
      await createPost(dto);
      globalQueryClient.removeQueries({ queryKey: [QueryKeys.FEED_POSTS] });
      await invalidateQueryPrefix(globalQueryClient, QueryKeys.FEED_POSTS);
      await getFeed({ limit: 20, sortBy: 'RECENT' });
      setIsCreatePostOpen(false);
    } catch (err: unknown) {
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

  // Real Career Entries from API (GET /v1/profiles/:profileId)
  const [careerEntries, setCareerEntries] = useState<CareerEntry[] | null>([
    {
      id: 't1',
      groupId: null,
      teamName: 'Boston Bruins',
      teamLogoUrl: '/kcBlue.png',
      position: 'Center',
      location: 'Dagestan, Russia',
      note: 'Good times',
      startDate: '2024-01-02T00:00:00.000Z',
      endDate: null,
      verified: false,
    },
    {
      id: 't2',
      groupId: '44444444-4444-4444-8444-444444444410',
      teamName: 'Carolina Hurricanes',
      teamLogoUrl: '/HC.png',
      position: 'Center',
      location: 'Toronto, Canada',
      note: 'Good times',
      startDate: '2022-01-01T00:00:00.000Z',
      endDate: '2024-01-01T00:00:00.000Z',
      verified: true,
    },
  ]);

  const [isAddTeamFormOpen, setIsAddTeamFormOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [isDeletingTeamId, setIsDeletingTeamId] = useState<string | null>(null);
  const [deletingEntryTarget, setDeletingEntryTarget] = useState<CareerEntry | null>(null);

  // Load real profile data and career entries from targetProfileRes
  React.useEffect(() => {
    const entries = targetProfileRes?.profile?.career || targetProfileRes?.profile?.careerEntries;
    if (entries !== undefined && entries !== null && Array.isArray(entries)) {
      setCareerEntries(entries);
    }
  }, [targetProfileRes]);

  // Form Fields matching specification
  const [teamNameInput, setTeamNameInput] = useState('');
  const [teamPositionInput, setTeamPositionInput] = useState('');
  const [teamCityInput, setTeamCityInput] = useState('');
  const [isCurrentPlayingInput, setIsCurrentPlayingInput] = useState(true);
  const [startMonthInput, setStartMonthInput] = useState('');
  const [startYearInput, setStartYearInput] = useState('');
  const [endMonthInput, setEndMonthInput] = useState('');
  const [endYearInput, setEndYearInput] = useState('');
  const [teamDescInput, setTeamDescInput] = useState('');
  const [careerErrors, setCareerErrors] = useState<Record<string, string>>({});

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
    setCareerErrors({});
    setIsAddTeamFormOpen(false);
  };

  const getMonthNumber = (monthName: string): string => {
    const months: Record<string, string> = {
      January: '01', February: '02', March: '03', April: '04',
      May: '05', June: '06', July: '07', August: '08',
      September: '09', October: '10', November: '11', December: '12'
    };
    return months[monthName] || '01';
  };

  const formatIsoDateString = (year?: string, month?: string): string | null => {
    if (!year) return null;
    const m = month ? getMonthNumber(month) : '01';
    return `${year}-${m}-01T00:00:00.000Z`;
  };

  const handleSaveTeam = async () => {
    const careerData = {
      teamName: teamNameInput,
      position: teamPositionInput,
      location: teamCityInput,
      note: teamDescInput,
      startMonth: startMonthInput,
      startYear: startYearInput,
      endMonth: endMonthInput,
      endYear: endYearInput,
      isCurrentPlaying: isCurrentPlayingInput,
    };

    const errs: Record<string, string> = {};
    const teamNameErr = validateCareerField('teamName', teamNameInput, careerData);
    if (teamNameErr) errs.teamName = teamNameErr;
    const posErr = validateCareerField('position', teamPositionInput, careerData);
    if (posErr) errs.position = posErr;
    const locErr = validateCareerField('location', teamCityInput, careerData);
    if (locErr) errs.location = locErr;
    const noteErr = validateCareerField('note', teamDescInput, careerData);
    if (noteErr) errs.note = noteErr;
    const startMonthErr = validateCareerField('startMonth', startMonthInput, careerData);
    if (startMonthErr) errs.startMonth = startMonthErr;
    const startYrErr = validateCareerField('startYear', startYearInput, careerData);
    if (startYrErr) errs.startYear = startYrErr;

    if (!isCurrentPlayingInput) {
      const endMonthErr = validateCareerField('endMonth', endMonthInput, careerData);
      if (endMonthErr) errs.endMonth = endMonthErr;
      const endYrErr = validateCareerField('endYear', endYearInput, careerData);
      if (endYrErr) errs.endYear = endYrErr;
    }

    if (Object.keys(errs).length > 0) {
      setCareerErrors(errs);
      return;
    }

    setCareerErrors({});
    setIsSavingTeam(true);

    try {
      const startDate = formatIsoDateString(startYearInput, startMonthInput) || undefined;
      const endDate = !isCurrentPlayingInput ? (formatIsoDateString(endYearInput, endMonthInput) || undefined) : undefined;

      if (editingTeamId) {
        // PATCH /v1/profiles/me/career/:id
        const updated = await updateCareerEntry(editingTeamId, {
          teamName: teamNameInput.trim(),
          position: teamPositionInput.trim() || undefined,
          location: teamCityInput.trim() || undefined,
          note: teamDescInput.trim() || undefined,
          startDate,
          endDate: isCurrentPlayingInput ? null : endDate,
        });

        setCareerEntries((prev) => (prev || []).map((t) => (t.id === editingTeamId ? updated : t)));
        showSuccessToast(SUCCESS_MESSAGES.CAREER_UPDATED);
      } else {
        // POST /v1/profiles/me/career
        const created = await createCareerEntry({
          teamName: teamNameInput.trim(),
          position: teamPositionInput.trim() || undefined,
          location: teamCityInput.trim() || undefined,
          note: teamDescInput.trim() || undefined,
          startDate,
          endDate,
        });

        setCareerEntries((prev) => [created, ...(prev || [])]);
        showSuccessToast(SUCCESS_MESSAGES.CAREER_CREATED);
      }

      resetTeamForm();
    } catch (err: unknown) {
      console.error('❌ Save Career Team Error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_SAVE_CAREER_TEAM);
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (isDeletingTeamId) return;
    setIsDeletingTeamId(id);
    try {
      await deleteCareerEntry(id);
      setCareerEntries((prev) => (prev || []).filter((t) => t.id !== id));
      showSuccessToast(SUCCESS_MESSAGES.CAREER_REMOVED);
      if (editingTeamId === id) {
        resetTeamForm();
      }
    } catch (err: unknown) {
      console.error('❌ Delete Career Team Error:', err);
      showErrorToast(err, ERROR_MESSAGES.FAILED_REMOVE_CAREER_TEAM);
    } finally {
      setIsDeletingTeamId(null);
    }
  };

  const handleEditClick = (team: CareerEntry) => {
    setEditingTeamId(team.id);
    setTeamNameInput(team.teamName || '');
    setTeamPositionInput(team.position || '');
    setTeamCityInput(team.location || '');
    setIsCurrentPlayingInput(!team.endDate);
    if (team.startDate) {
      const d = new Date(team.startDate);
      if (!isNaN(d.getTime())) {
        setStartYearInput(String(d.getFullYear()));
      }
    } else {
      setStartYearInput('');
    }
    if (team.endDate) {
      const d = new Date(team.endDate);
      if (!isNaN(d.getTime())) {
        setEndYearInput(String(d.getFullYear()));
      }
    } else {
      setEndYearInput('');
    }
    setTeamDescInput(team.note || '');
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

      {/* Main Centered Content Container */}
      {!user || (Boolean(effectiveProfileId) && (isProfileTargetLoading || (isProfileTargetFetching && !targetProfileRes))) ? (
        <ProfileSkeletonLoader />
      ) : (
        <main className="mhn-profile-main-container">
          {/* Profile Hero Card */}
          <div className="mhn-profile-hero-card">
            {/* Cover Banner Area */}
            <div className="mhn-profile-cover-banner mhn-relative-container">
              <img
                src={liveCoverImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <Input
                type="file"
                ref={coverFileInputRef}
                accept="image/*"
                className="mhn-display-none"
                onChange={handleCoverFileChange}
              />

              {/* Full Cover Banner Uploading Overlay */}
              {isUploadingCover && (
                <div
                  className="mhn-cover-uploading-overlay"
                >
                  <Spinner size="lg" color="#38BDF8" />
                  <span className="mhn-cover-uploading-text">
                    Uploading cover image...
                  </span>
                </div>
              )}

              {/* Edit Cover Pencil Button */}
              {isOwnProfile && (
                <Button
                  className="mhn-btn-edit-cover mhn-z-6"
                  aria-label="Edit cover photo"
                  onClick={handleEditCoverClick}
                  disabled={isUploadingCover}
                  title="Upload new cover image"
                >
                  {isUploadingCover ? (
                    <Spinner size="sm" color="#1860C3" />
                  ) : (
                    <img src="/edit2.png" className="edit2-icon" alt="edit-icon" />
                  )}
                </Button>
              )}

              {coverUploadMsg && (
                <div
                  className="mhn-cover-success-badge"
                >
                  ✅ {coverUploadMsg}
                </div>
              )}
            </div>

            {/* Profile Header Content Row */}
            <div className="mhn-profile-header-content">
              {/* Hidden Avatar File Input */}
              <Input
                type="file"
                ref={avatarFileInputRef}
                accept="image/*"
                className="mhn-display-none"
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
                {isOwnProfile && (
                  <Button
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
                      <Camera size={15} aria-hidden="true" />
                    )}
                  </Button>
                )}
              </div>

              {/* User Meta & Action Buttons */}
              <div className="mhn-profile-meta-and-actions">
                <div className="mhn-profile-top-info-row">
                  <h2 className="mhn-profile-hero-name" title={liveName}>{liveName}</h2>
                  <div className="mhn-profile-action-buttons">
                    <Button
                      onClick={() => showSuccessToast(SUCCESS_MESSAGES.PROFILE_LINK_COPIED)}
                      className="mhn-btn-share-profile"
                    >
                      <div className="share-profile-text">Share Profile</div>
                    </Button>



                    {canEditProfile && (
                      <Button
                        onClick={() => setIsEditProfileOpen(true)}
                        className="mhn-btn-edit-profile"
                      >
                        <div className="edit-profile-text">Edit Profile</div>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mhn-profile-hero-stats">
                  <span><strong>{user?.counts?.followers ?? 0}</strong> Followers</span>
                  <span><strong>{user?.counts?.following ?? 0}</strong> Following</span>
                </div>

                <p className="mhn-profile-hero-role">
                  {(() => {
                    const primaryTeam = (careerEntries && careerEntries.length > 0 && careerEntries[0]?.teamName)
                      ? careerEntries[0].teamName
                      : (targetProfileRes?.profile?.career?.[0]?.teamName ||
                        targetProfileRes?.profile?.careerEntries?.[0]?.teamName ||
                        targetProfileRes?.profile?.teamName ||
                        user?.profile?.career?.[0]?.teamName ||
                        user?.profile?.careerEntries?.[0]?.teamName ||
                        user?.profile?.teamName || null);
                    const isParent = String(liveRole).toUpperCase() === 'PARENT';
                    if (isParent) return liveRole;
                    const teamString = primaryTeam ? ` • @${primaryTeam}` : '';
                    if (isPlayer) {
                      return `${positionText === 'Left Wing' ? 'LW' : positionText === 'Right Wing' ? 'RW' : positionText === 'Center' ? 'C' : positionText === 'Defense' ? 'D' : positionText === 'Goaltender' ? 'G' : (positionText || 'LW')} • #${jerseyText || '8'}${teamString}`;
                    }
                    return `${liveRole}${teamString}`;
                  })()}
                </p>

                {liveCity && liveCity !== '-' && (
                  <div className="mhn-profile-hero-location">
                    {liveCity}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content Navigation Tabs Bar */}
            <div className="mhn-profile-tabs-bar">
              <Button
                onClick={() => setActiveProfileTab(ProfileTabEnum.POSTS)}
                className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.POSTS ? 'mhn-profile-tab-active' : ''}`}
              >
                <span>Posts</span>
                {activeProfileTab === ProfileTabEnum.POSTS && <div className="mhn-profile-tab-indicator" />}
              </Button>
              <Button
                onClick={() => setActiveProfileTab(ProfileTabEnum.MEDIA)}
                className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.MEDIA ? 'mhn-profile-tab-active' : ''}`}
              >
                <span>Media</span>
                {activeProfileTab === ProfileTabEnum.MEDIA && <div className="mhn-profile-tab-indicator" />}
              </Button>
              <Button
                onClick={() => setActiveProfileTab(ProfileTabEnum.STATS)}
                className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.STATS ? 'mhn-profile-tab-active' : ''}`}
              >
                <span>Stats</span>
                {activeProfileTab === ProfileTabEnum.STATS && <div className="mhn-profile-tab-indicator" />}
              </Button>
              <Button
                onClick={() => setActiveProfileTab(ProfileTabEnum.ABOUT)}
                className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.ABOUT ? 'mhn-profile-tab-active' : ''}`}
              >
                <span>About</span>
                {activeProfileTab === ProfileTabEnum.ABOUT && <div className="mhn-profile-tab-indicator" />}
              </Button>
              {(liveRole.toUpperCase() === 'PARENT' || user?.roleAssignments.some(({ role }) => role === 'PARENT') || user?.primaryRole === 'PARENT') && (
                <Button
                  onClick={() => setActiveProfileTab(ProfileTabEnum.GUARDIAN_REQUESTS)}
                  className={`mhn-profile-tab-btn ${activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS ? 'mhn-profile-tab-active' : ''}`}
                >
                  <span>Guardian Requests</span>
                  {activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS && <div className="mhn-profile-tab-indicator" />}
                </Button>
              )}
            </div>
          </div>

          {/* Tab Content Panel */}
          <div>
            {/* 1. POSTS TAB */}
            {activeProfileTab === ProfileTabEnum.POSTS && (
              <div className="mhn-posts-container-card">
                <div className="mhn-posts-header-bar">
                  <h3 className="mhn-posts-title">Posts</h3>
                  <Button className="mhn-btn-create-post" onClick={handleOpenCreatePost}>Create Post</Button>
                </div>

                {liveUserPosts.length === 0 ? (
                  <NoDataFound
                    title="No Posts Found"
                    description="There are no posts in your feed right now. Be the first to share an update with your network!"
                    actionLabel="Create Post"
                    onAction={handleOpenCreatePost}
                  />
                ) : (
                  <>
                    <div className="mhn-posts-grid-wrapper">
                      {liveUserPosts.map((post: PostItem) => {
                        const author: NonNullable<PostItem['author']> = post.authorProfile || post.author || { id: '', displayName: '' };
                        const postName = author.displayName || liveName;
                        const postAvatar = author.avatarUrl || liveAvatar;
                        const postRole = author.position && author.jerseyNumber ? `${author.position} • #${author.jerseyNumber}` : `${liveRole} • #${jerseyText}`;
                        const mediaUrl = post.media && post.media.length > 0 ? post.media[0].url : null;
                        const formattedDate = post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';

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
                            onNavigate={onNavigate}
                            onDeleteSuccess={(deletedId) => {
                              setLiveUserPosts((prev) => prev.filter((p) => p.id !== deletedId));
                            }}
                            onUpdateSuccess={(updatedId, newContent) => {
                              setLiveUserPosts((previousPosts) => previousPosts.map((item) =>
                                item.id === updatedId ? { ...item, body: newContent } : item
                              ));
                            }}
                          />
                        );
                      })}
                    </div>

                    <div className="mhn-posts-show-all-divider">
                      <Button className="mhn-btn-show-all">Show All</Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. MEDIA TAB */}
            {activeProfileTab === ProfileTabEnum.MEDIA && (
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
            {activeProfileTab === ProfileTabEnum.STATS && (
              <div className="mhn-profile-tab-content-card-full">
                <div className="mhn-profile-stats-container">
                  {/* 1. Filter Dropdowns Row */}
                  <div className="mhn-stats-filters-row">
                    <Dropdown
                      value={selectedSeason}
                      options={['2025-26', '2024-25']}
                      onChange={(val) => setSelectedSeason(val)}
                      placeholder=""
                      className="mhn-w-160"
                    />

                    <Dropdown
                      value={selectedSeasonType}
                      options={['Regular Season', 'Playoffs']}
                      onChange={(val) => setSelectedSeasonType(val)}
                      placeholder=""
                      className="mhn-w-200"
                    />

                    <Dropdown
                      value={selectedUnit}
                      options={['Miles • MI', 'KM • KPH']}
                      onChange={(val) => setSelectedUnit(val)}
                      placeholder=""
                      className="mhn-w-160"
                    />
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
                      <span className="mhn-percentile-info-icon mhn-info-icon-sm">i</span>
                    </h3>

                    <div className="mhn-zone-map-content-row">
                      {/* Left: SVG Zone Map Visual */}
                      <div className="mhn-zone-map-visual">
                        <ShotZoneMapIcon />

                        {/* Percentile Gradient Bar Legend */}
                        <div className="mhn-percentile-legend-bar">
                          <div className="mhn-toggle-row-between mhn-text-xs-sub">
                            <span>Percentile</span>
                          </div>
                          <div className="mhn-legend-bar-img" />
                          <div className="mhn-toggle-row-between mhn-text-xs-bold">
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
                            <div className="mhn-comment-skeleton-meta">
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
                            <div className="mhn-comment-skeleton-meta">
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
                            <div className="mhn-comment-skeleton-meta">
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
                            <div className="mhn-comment-skeleton-meta">
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
                      <span className="mhn-percentile-info-icon mhn-info-icon-sm">i</span>
                    </h3>

                    <div className="mhn-zone-time-visual-wrapper">
                      {/* SVG Rink Overlay Lines */}
                      <RinkZoneOverlayIcon />

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
                      <div className="mhn-toggle-row-between mhn-text-xs-sub">
                        <span>Percentile</span>
                      </div>
                      <div className="mhn-legend-bar-img" />
                      <div className="mhn-toggle-row-between mhn-text-xs-bold">
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
            {activeProfileTab === ProfileTabEnum.ABOUT && (
              <div className="mhn-profile-tab-content-card-full mhn-about-card-padding-override">
                <div className="mhn-about-2col-container">
                  {/* Left Sidebar */}
                  <div className="mhn-about-sidebar">
                    <h3 className="mhn-about-sidebar-title">About</h3>

                    <aside className="mhn-about-sidebar-card">
                      <Button
                        onClick={() => setActiveAboutSection(ProfileAboutSectionEnum.INTRO)}
                        className={`mhn-about-menu-btn ${activeAboutSection === ProfileAboutSectionEnum.INTRO ? 'mhn-about-btn-active' : ''}`}
                      >
                        Intro
                      </Button>
                      {canHaveCareer && (
                        <Button
                          onClick={() => setActiveAboutSection(ProfileAboutSectionEnum.CAREER)}
                          className={`mhn-about-menu-btn ${activeAboutSection === ProfileAboutSectionEnum.CAREER ? 'mhn-about-btn-active' : ''}`}
                        >
                          Career
                        </Button>
                      )}
                      <Button
                        onClick={() => setActiveAboutSection(ProfileAboutSectionEnum.DETAILS)}
                        className={`mhn-about-menu-btn ${activeAboutSection === ProfileAboutSectionEnum.DETAILS ? 'mhn-about-btn-active' : ''}`}
                      >
                        Personal Details
                      </Button>
                    </aside>
                  </div>

                  {/* Right Detail Panel */}
                  <div className="mhn-about-main-panel">
                    {activeAboutSection === ProfileAboutSectionEnum.INTRO && (
                      <div className="mhn-about-intro-form">
                        {/* Bio */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">Bio</label>
                          <div className="mhn-relative-container">
                            <Textarea
                              value={bioText}
                              onChange={(e) => {
                                setBioText(e.target.value);
                                if (introErrors.bio) setIntroErrors((prev) => ({ ...prev, bio: '' }));
                              }}
                              className={`mhn-about-input-box mhn-about-textarea-box ${introErrors.bio ? 'mhn-edit-profile-input-error' : ''}`}
                              rows={3}
                              placeholder="Write something about yourself..."
                            />
                            {introErrors.bio && (
                              <div className="mhn-edit-profile-field-error">
                                <span>{introErrors.bio}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Primary Role (Read-Only / System Managed) */}
                        <div className="mhn-about-field-group">
                          <label className="mhn-about-field-label">
                            Role <span className="mhn-sub-label-light">(Managed by system)</span>
                          </label>
                          <div className="mhn-relative-container">
                            <Input
                              type="text"
                              value={liveRole}
                              disabled
                              className="mhn-about-input-box mhn-about-input-disabled"
                              title="Role cannot be changed"
                            />
                          </div>
                        </div>

                        {/* Position (Only for Players) */}
                        {isPlayer && (
                          <Dropdown
                            label="Position"
                            value={positionText && ['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goaltender'].includes(positionText) ? positionText : 'Center'}
                            options={['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goaltender']}
                            onChange={(val) => setPositionText(val)}
                            placeholder="Select position"
                          />
                        )}

                        {/* Jersey Number (Only for Players) */}
                        {isPlayer && (
                          <div className="mhn-about-field-group">
                            <label className="mhn-about-field-label">Jersey Number</label>
                            <div className="mhn-relative-container">
                              <Input
                                type="number"
                                value={jerseyText}
                                onChange={(e) => {
                                  setJerseyText(e.target.value);
                                  if (introErrors.jerseyNumber) setIntroErrors((prev) => ({ ...prev, jerseyNumber: '' }));
                                }}
                                className={`mhn-about-input-box ${introErrors.jerseyNumber ? 'mhn-edit-profile-input-error' : ''}`}
                                placeholder="e.g. 97"
                              />
                              {introErrors.jerseyNumber && (
                                <div className="mhn-edit-profile-field-error">
                                  <span>{introErrors.jerseyNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Save & Feedback Row */}
                        <div className="mhn-btn-loading-flex mhn-mt-12">
                          <Button
                            type="button"
                            className="mhn-about-btn-save mhn-btn-primary-compact"
                            onClick={handleSaveIntro}
                            disabled={isSavingIntro}
                          >
                            {isSavingIntro && <Spinner size="sm" color="#FFFFFF" />}
                            <span>Save Changes</span>
                          </Button>
                          <Button
                            type="button"
                            className="mhn-about-btn-cancel mhn-btn-cancel-compact"
                            onClick={() => {
                              if (user?.profile) {
                                setBioText(user.profile.bio || '');
                                setPositionText(user.profile.position || '');
                                setJerseyText(user.profile.jerseyNumber !== null && user.profile.jerseyNumber !== undefined ? String(user.profile.jerseyNumber) : '');
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          {introSaveMsg && (
                            <span className="mhn-success-text-sm">
                              ✅ {introSaveMsg}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {activeAboutSection === ProfileAboutSectionEnum.CAREER && canHaveCareer && (
                      <div className="mhn-about-section-content mhn-col-flex-gap-20">
                        {/* Teams Header */}
                        <div className="mhn-toggle-row-between mhn-mb-4">
                          <h4 className="mhn-about-section-heading">Teams</h4>
                          <Button
                            type="button"
                            onClick={() => {
                              if (isAddTeamFormOpen && !editingTeamId) {
                                resetTeamForm();
                              } else {
                                resetTeamForm();
                                setIsAddTeamFormOpen(true);
                              }
                            }}
                            className="mhn-btn-icon-clear"
                            title="Add Team"
                          >
                            <Plus size={20} aria-hidden="true" />
                          </Button>
                        </div>

                        {/* Add / Edit Team Form Card matching User Screenshot */}
                        {isAddTeamFormOpen && (
                          <div
                            className="mhn-add-team-card-form"
                          >
                            <CareerFormFields
                              values={{
                                teamName: teamNameInput,
                                position: teamPositionInput,
                                location: teamCityInput,
                                isCurrentPlaying: isCurrentPlayingInput,
                                startMonth: startMonthInput,
                                startYear: startYearInput,
                                endMonth: endMonthInput,
                                endYear: endYearInput,
                                note: teamDescInput,
                              }}
                              onChange={(field, val) => {
                                if (field === 'teamName') setTeamNameInput(val as string);
                                if (field === 'position') setTeamPositionInput(val as string);
                                if (field === 'location') setTeamCityInput(val as string);
                                if (field === 'isCurrentPlaying') setIsCurrentPlayingInput(val as boolean);
                                if (field === 'startMonth') setStartMonthInput(val as string);
                                if (field === 'startYear') setStartYearInput(val as string);
                                if (field === 'endMonth') setEndMonthInput(val as string);
                                if (field === 'endYear') setEndYearInput(val as string);
                                if (field === 'note') setTeamDescInput(val as string);
                                if (careerErrors[field]) setCareerErrors((prev) => ({ ...prev, [field]: '' }));
                              }}
                              errors={careerErrors}
                            />

                            {/* Buttons Row: Cancel and Save */}
                            <div className="mhn-team-actions-row">
                              <Button
                                type="button"
                                onClick={resetTeamForm}
                                className="mhn-btn-team-cancel"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={handleSaveTeam}
                                disabled={isSavingTeam}
                                className={`mhn-btn-team-save ${isSavingTeam ? 'disabled' : 'active'}`}
                              >
                                {isSavingTeam && <Spinner size="sm" color="#FFFFFF" />}
                                <span>Save</span>
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Saved Career Teams List matching API spec */}
                        <div className="mhn-col-flex-gap-12">
                          {careerEntries === null ? (
                            <div className="mhn-career-privacy-hidden-box">
                              Career history is hidden based on user privacy settings.
                            </div>
                          ) : careerEntries.length === 0 && !isAddTeamFormOpen ? (
                            <div className="mhn-career-empty-dashed-box">
                              <p className="mhn-parent-card-sub mhn-mb-12">No career teams added yet.</p>
                              <Button
                                type="button"
                                onClick={() => {
                                  resetTeamForm();
                                  setIsAddTeamFormOpen(true);
                                }}
                                className="mhn-btn-add-team-blue"
                              >
                                + Add a Team
                              </Button>
                            </div>
                          ) : (
                            (careerEntries || []).map((team) => {
                              const formatIsoReadable = (iso?: string | null) => {
                                if (!iso) return 'Present';
                                try {
                                  const d = new Date(iso);
                                  if (isNaN(d.getTime())) return iso;
                                  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                                } catch {
                                  return iso;
                                }
                              };

                              const posText = team.position ? `${team.position} · ` : '';
                              const startText = team.startDate ? formatIsoReadable(team.startDate) : '';
                              const endText = team.endDate ? formatIsoReadable(team.endDate) : 'Present';
                              const dateRange = startText ? `${startText} - ${endText}` : endText;
                              const locText = team.location ? ` · ${team.location}` : '';
                              const subtitleStr = `${posText}${dateRange}${locText}`;

                              return (
                                <div
                                  key={team.id}
                                  className="mhn-career-item-card"
                                >
                                  <div className="mhn-career-item-left">
                                    <img
                                      src={team.teamLogoUrl || '/kcBlue.png'}
                                      alt={team.teamName || 'Team Logo'}
                                      className="mhn-career-team-logo-img"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/kcBlue.png';
                                      }}
                                    />
                                    <div>
                                      <div className="mhn-btn-loading-flex">
                                        <h5 className="mhn-career-team-title">
                                          {team.teamName || 'Team Name'}
                                        </h5>
                                        {team.verified && (
                                          <span title="Verified Team on Platform" className="mhn-btn-loading-flex">
                                            <BadgeCheck size={16} fill="#0B66C2" aria-hidden="true" />
                                          </span>
                                        )}
                                      </div>
                                      <p className="mhn-career-team-sub">
                                        {subtitleStr}
                                      </p>
                                      {team.note && (
                                        <p className="mhn-career-team-note">
                                          {team.note}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mhn-btn-loading-flex">
                                    <Button
                                      type="button"
                                      onClick={() => handleEditClick(team)}
                                      className="mhn-btn-icon-clear"
                                      title="Edit team details"
                                    >
                                      <img src="/edit3.png" alt="Edit" className="mhn-edit-icon-img" />
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => setDeletingEntryTarget(team)}
                                      className="mhn-btn-icon-clear"
                                      title="Delete career entry"
                                    >
                                      <Trash2 size={16} color="#EF4444" aria-hidden="true" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {activeAboutSection === ProfileAboutSectionEnum.DETAILS && (
                      <div className="mhn-about-section-content mhn-col-flex-gap-20">
                        <PersonalDetailsFields
                          values={{
                            city: locationText,
                            dateOfBirth: dobText,
                            genderCategory: genderText,
                          }}
                          onChange={(field, val) => {
                            if (field === 'city') setLocationText(val);
                            if (field === 'dateOfBirth') setDobText(val);
                            if (field === 'genderCategory') setGenderText(val);
                            if (detailsErrors[field]) setDetailsErrors((prev) => ({ ...prev, [field]: '' }));
                          }}
                          errors={detailsErrors}
                        />

                        {/* Save & Feedback Row */}
                        <div className="mhn-btn-loading-flex mhn-mt-4">
                          <Button
                            type="button"
                            className="mhn-about-btn-save mhn-btn-primary-compact"
                            onClick={handleSaveDetails}
                            disabled={isSavingDetails}
                          >
                            {isSavingDetails && <Spinner size="sm" color="#FFFFFF" />}
                            <span>Save Details</span>
                          </Button>
                          <Button
                            type="button"
                            className="mhn-about-btn-cancel mhn-btn-cancel-compact"
                            onClick={() => {
                              if (user?.profile) {
                                setLocationText(user.profile.city || '');
                                setDobText(user.profile.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '');
                                setGenderText(user.profile.genderCategory || '');
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          {detailsSaveMsg && (
                            <span className="mhn-success-text-sm">
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

            {/* 5. GUARDIAN REQUESTS TAB (PARENT Role Only) */}
            {activeProfileTab === ProfileTabEnum.GUARDIAN_REQUESTS && (
              <div className="mhn-posts-container-card mhn-p-24">
                <div className="mhn-posts-header-bar mhn-mb-20">
                  <h3 className="mhn-posts-title">Pending Guardian Requests</h3>
                </div>

                {isGuardianReqsLoading ? (
                  <NetworkSkeletonGrid count={3} />
                ) : pendingGuardianReqs.length === 0 ? (
                  <NoDataFound
                    title="No Pending Guardian Requests"
                    description="There are currently no pending guardian requests."
                  />
                ) : (
                  <div className="mhn-supervision-requests-grid">
                    {pendingGuardianReqs.map((req: GuardianRelationshipRequest, idx: number) => {
                      const reqId = req.id || `greq_${idx}`;
                      const child = req.child || req.minor || {};
                      const displayName = child.displayName || req.displayName || req.name || 'Minor Athlete';
                      const rawAvatar = child.avatarUrl || req.avatarUrl;
                      const avatarUrl = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
                      const roleTag = child.roleTag || child.primaryRole || req.roleTag || 'PLAYER';
                      const code = req.code || req.devCode || req.inviteCode || '';

                      return (
                        <div key={reqId} className="mhn-supervision-req-card">
                          <div className="mhn-supervision-req-avatar-wrapper">
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="mhn-supervision-req-avatar"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                              }}
                            />
                          </div>
                          <h4 className="mhn-supervision-req-name">{displayName}</h4>
                          <p className="mhn-supervision-req-role">{roleTag}</p>

                          <div className="mhn-supervision-req-actions mhn-mt-12">
                            <Button
                              type="button"
                              className="mhn-supervision-btn-ignore"
                              disabled={guardianReqActionLoading}
                              onClick={() => handleDeclineGuardianReq(code || reqId)}
                            >
                              Decline
                            </Button>
                            <Button
                              type="button"
                              className="mhn-supervision-btn-accept"
                              disabled={guardianReqActionLoading}
                              onClick={() => {
                                setGuardianApprovalModalConfig({
                                  isOpen: true,
                                  targetName: displayName,
                                  code: code || '',
                                });
                              }}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Approval Code Modal for Guardian Requests */}
      <ApprovalCodeModal
        isOpen={guardianApprovalModalConfig.isOpen}
        targetName={guardianApprovalModalConfig.targetName}
        initialCode={guardianApprovalModalConfig.code}
        loading={guardianReqActionLoading}
        onClose={() => setGuardianApprovalModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={async (enteredCode) => {
          await handleAcceptGuardianReq(enteredCode);
          setGuardianApprovalModalConfig((prev) => ({ ...prev, isOpen: false }));
        }}
      />

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
          profileData={activeProfile}
        />
      )}

      {/* Delete Career Entry Confirmation Modal matching LogoutModal styling */}
      <DeleteCareerModal
        isOpen={!!deletingEntryTarget}
        teamName={deletingEntryTarget?.teamName || null}
        onClose={() => setDeletingEntryTarget(null)}
        isLoading={!!isDeletingTeamId}
        onConfirm={async () => {
          if (deletingEntryTarget) {
            await handleDeleteTeam(deletingEntryTarget.id);
            setDeletingEntryTarget(null);
          }
        }}
      />
    </div>
  );
};
