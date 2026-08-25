import { Button } from '../components/common/Button';
import { Input, Select, Dropdown, FormField } from '../components/common/FormControls';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { NoDataFound } from '../components/common/no-data-found';
import { withRoleGuard } from '../hocs/with-role-guard';
import { UserRole } from '../enums/role';
import { GuardianRequestSkeleton } from '../components/supervision/guardian-request-skeleton';
import { PermissionSkeletonLoader } from '../components/supervision/permission-skeleton-loader';
import { SidebarWardSkeleton } from '../components/supervision/sidebar-ward-skeleton';
import { ApprovalCodeModal } from '../components/supervision/ApprovalCodeModal';
import { ParentOnboardingModal } from '../components/features/parent';
import { Spinner } from '../components/common/Spinner';
import { useAuth } from '../hooks/use-auth';
import { useDebounce } from '../hooks/use-debounce';
import { resolveMediaUrl } from '../utils/mediaUtils';
import { GUARDIAN_RELATION_OPTIONS, formatDobToIso, formatDobInput } from '../utils/guardianUtils';
import { QueryKeys, ToastTypeEnum, NavTabEnum, SupervisionMainTabEnum, SupervisionViewModeEnum, SupervisionControlKeyEnum } from '@my-hockey-network/contracts';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import { useQuery, useQueryClient, globalQueryClient } from '../query';


import {
  getSupervisionData,
  createManagedChild,
  getSupervisionControls,
  updateSupervisionControls,
  getSupervisionLogs,
  sendGuardianInvite,
  getPendingGuardianRequests,
  acceptGuardianRequest,
  declineGuardianRequest,
  getApprovals,
  approveRequest,
  declineRequest,
} from '@my-hockey-network/core';

interface SupervisionPageProps {
  onNavigate?: (screen: string, extraData?: any) => void;
  onLogout?: () => void;
}

const SupervisionPageBase: React.FC<SupervisionPageProps> = ({ onNavigate, onLogout }) => {
  const { showToast } = useAuth();
  const location = useLocation();
  const navState = location.state as { selectedWardId?: string; childId?: string } | null;
  const initialWardIdFromNav = navState?.selectedWardId || navState?.childId || new URLSearchParams(location.search).get('childId');

  const [activeNavTab, setActiveNavTab] = useState<NavTabEnum | string>(NavTabEnum.SUPERVISION);
  const [selectedWardId, setSelectedWardId] = useState(initialWardIdFromNav || '');
  const [activeMainTab, setActiveMainTab] = useState<SupervisionMainTabEnum>(SupervisionMainTabEnum.PERMISSIONS);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

  // Interactive Flow View Mode for Add Button (+):
  const [viewMode, setViewMode] = useState<SupervisionViewModeEnum>(SupervisionViewModeEnum.MAIN);

  // Supervised Wards list (Dynamic)
  const [wards, setWards] = useState<Array<{ id: string; name: string; age: number; avatar: string }>>([]);

  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isControlsLoading, setIsControlsLoading] = useState<boolean>(true);

  // Approval Code Modal State
  const [approvalModalConfig, setApprovalModalConfig] = useState<{
    isOpen: boolean;
    targetName: string;
    code?: string;
  }>({
    isOpen: false,
    targetName: '',
    code: '',
  });

  // Live Pending Guardian Requests & Approval Code State
  const [livePendingRequests, setLivePendingRequests] = useState<any[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState<boolean>(false);
  const [approvalCodeInput, setApprovalCodeInput] = useState('');
  const [requestActionLoading, setRequestActionLoading] = useState(false);
  const [requestNotice, setRequestNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load live pending requests when tab is opened or ward selected
  const loadPendingRequests = async () => {
    try {
      setIsRequestsLoading(true);
      let list: any[] = [];

      const isRealUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(selectedWardId);
      const approvalsRes = await getApprovals({ status: 'PENDING', minorId: isRealUuid ? selectedWardId : undefined, limit: 20 });
      const approvalItems = approvalsRes?.items || (approvalsRes as any)?.data?.items || [];
      if (Array.isArray(approvalItems)) {
        list = [...list, ...approvalItems.map((i: any) => ({ ...i, isApprovalItem: true }))];
      }

      const reqRes = await getPendingGuardianRequests();
      const guardianItems = reqRes?.items || (reqRes as any)?.data?.items || [];
      if (Array.isArray(guardianItems)) {
        list = [...list, ...guardianItems.map((i: any) => ({ ...i, isGuardianInviteItem: true }))];
      }

      setLivePendingRequests(list);
    } catch (err: any) {
      console.warn('Pending requests fetch notice:', err);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeMainTab === SupervisionMainTabEnum.REQUESTS) {
      loadPendingRequests();
    }
  }, [activeMainTab, selectedWardId]);

  const handleApproveApprovalItem = async (approvalId: string) => {
    setRequestActionLoading(true);
    setRequestNotice(null);
    try {
      const res = await approveRequest(approvalId, { mode: 'SINGLE_USE' });
      const isPublished = res?.advanced === 'POST_PUBLISHED';
      const successMsg = isPublished
        ? 'Request approved! The post has been published to the feed.'
        : 'Request approved successfully!';
      setRequestNotice({ type: 'success', message: successMsg });
      showToast(successMsg, 'success');
      loadPendingRequests();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to approve request.';
      setRequestNotice({ type: 'error', message: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleDeclineApprovalItem = async (approvalId: string) => {
    setRequestActionLoading(true);
    setRequestNotice(null);
    try {
      await declineRequest(approvalId, 'Declined by parent');
      const successMsg = 'Request declined. The item will remain unpublished.';
      setRequestNotice({ type: 'success', message: successMsg });
      showToast(successMsg, 'info');
      loadPendingRequests();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to decline request.';
      setRequestNotice({ type: 'error', message: errMsg });
      showToast(errMsg, 'error');
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleApproveCodeSubmit = async (codeToSubmit?: string) => {
    const code = (codeToSubmit || approvalCodeInput).trim();
    if (!code || code.length !== 6) {
      const msg = 'Please enter a valid 6-digit approval code.';
      setRequestNotice({ type: 'error', message: msg });
      showToast(msg, 'error');
      throw new Error(msg);
    }

    setRequestActionLoading(true);
    setRequestNotice(null);

    try {
      const res = await acceptGuardianRequest(code);
      const successMsg = res.message || 'Player approval accepted! You are now supervising this player.';
      setRequestNotice({ type: 'success', message: successMsg });
      showToast(successMsg, 'success');
      setApprovalCodeInput('');

      // Refresh supervision list & pending requests
      const supData = await getSupervisionData();
      const children = supData?.children || (supData as any)?.data?.children || [];
      if (Array.isArray(children) && children.length > 0) {
        const mapped = children.map((c: any) => ({
          id: c.userId || c.profileId || c.id,
          name: c.displayName || c.firstName || 'Minor Player',
          age: c.age || 12,
          avatar: resolveMediaUrl(c.avatarUrl, '/userPlaceholder.png'),
        }));
        setWards(mapped);
        setSelectedWardId(mapped[0].id);
      }

      loadPendingRequests();
    } catch (err: any) {
      console.error('Accept Request Error:', err);
      const errMsg = err.key === 'GUARDIAN_REQUEST_CHILD_SETUP_INCOMPLETE' || err.message?.includes('setup')
        ? "This player hasn't finished setting up their profile yet — try again shortly."
        : err.message || 'Failed to approve request. Please verify the code and try again.';

      setRequestNotice({ type: 'error', message: errMsg });
      showToast(errMsg, 'error');
      throw err;
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleDeclineCodeSubmit = async (codeToDecline: string) => {
    if (!codeToDecline) return;
    setRequestActionLoading(true);
    setRequestNotice(null);

    try {
      await declineGuardianRequest(codeToDecline);
      setRequestNotice({ type: 'success', message: 'Guardian request declined.' });
      loadPendingRequests();
    } catch (err: any) {
      setRequestNotice({ type: 'error', message: err.message || 'Failed to decline request.' });
    } finally {
      setRequestActionLoading(false);
    }
  };



  // Form States for "Create a new player profile"
  const [newPlayer, setNewPlayer] = useState({
    fullName: '',
    dob: '',
    relationship: 'MOTHER',
    email: '',
    visibility: 'private' as 'private' | 'network',
    adultRequests: true,
    connections: true,
    teamInvitations: true,
    mediaVisibility: true,
  });

  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [hasAttemptedSupervisionCreate, setHasAttemptedSupervisionCreate] = useState(false);
  const [supervisionPlayerTouched, setSupervisionPlayerTouched] = useState<Record<string, boolean>>({});

  const getSupervisionFullNameError = (): string | null => {
    const trimmed = newPlayer.fullName.trim();
    if (!trimmed) return 'Full Name is required.';
    if (trimmed.length < 2) return 'Full Name must be at least 2 characters.';
    if (newPlayer.fullName.length >= 50) return 'Maximum 50 characters allowed.';
    return null;
  };

  const getSupervisionDobError = (): string | null => {
    if (!newPlayer.dob) return 'Date of Birth is required.';
    if (newPlayer.dob.length < 10) return 'Please enter a valid Date of Birth (DD/MM/YYYY).';
    return null;
  };

  const getSupervisionRelationError = (): string | null => {
    if (!newPlayer.relationship) return 'Relationship to player is required.';
    return null;
  };

  const getSupervisionEmailError = (): string | null => {
    const trimmed = newPlayer.email.trim();
    if (!trimmed) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
    return null;
  };
  const supervisionDateInputRef = useRef<HTMLInputElement>(null);

  const handleSupervisionCalendarClick = () => {
    if (supervisionDateInputRef.current) {
      if (typeof supervisionDateInputRef.current.showPicker === 'function') {
        supervisionDateInputRef.current.showPicker();
      } else {
        supervisionDateInputRef.current.click();
      }
    }
  };

  const formatShortPlayerName = (name: string, maxLen = 14): string => {
    if (!name) return 'Player';
    const trimmed = name.trim();
    if (trimmed.length <= maxLen) return trimmed;
    const words = trimmed.split(/\s+/);
    if (words.length > 1 && words[0].length <= maxLen) {
      return `${words[0]}...`;
    }
    return `${trimmed.slice(0, maxLen)}...`;
  };

  const [addedPlayerName, setAddedPlayerName] = useState('Noah');
  const [createdWardId, setCreatedWardId] = useState<string | null>(null);

  // Form State for "Link an existing player"
  const [linkChildEmail, setLinkChildEmail] = useState('');
  const [linkEmailError, setLinkEmailError] = useState<string | null>(null);
  const [isSendingLinkInvite, setIsSendingLinkInvite] = useState(false);

  // Accordion collapsed state for Permission Categories
  const [expandedCategories, setExpandedCategories] = useState({
    home: true,
    network: true,
    messaging: true,
    notifications: true,
  });

  const toggleCategory = (cat: keyof typeof expandedCategories) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Permission Toggle States matching Figma Images 31 & 32
  const [homePermissions, setHomePermissions] = useState({
    homeVisibility: true,
    activityLogSharing: true,
    discoverability: false,
    viewFeed: true,
    createPosts: true,
    commentOnPosts: true,
    reactToPosts: true,
    sharePosts: true,
  });

  const [networkPermissions, setNetworkPermissions] = useState({
    followOthers: true,
    whoCanFollowThem: 'Everyone',
    whoCanSendRequests: 'Everyone',
    acceptRequests: true,
  });

  const [messagingPermissions, setMessagingPermissions] = useState({
    sendMessages: true,
    receiveMessages: true,
    createGroupChats: false,
    whoCanMessageThem: 'Connections Only',
  });

  const [notificationPermissions, setNotificationPermissions] = useState({
    messageNotifications: true,
    connectionNotifications: true,
    activityNotifications: false,
    mentionNotifications: true,
  });

  const CONTROL_KEY_TO_BACKEND_ENUM: Record<string, string> = {
    view_feed: 'VIEW_FEED',
    viewFeed: 'VIEW_FEED',
    create_posts: 'CREATE_POST',
    createPosts: 'CREATE_POST',
    comment_on_posts: 'COMMENT_ON_POSTS',
    commentOnPosts: 'COMMENT_ON_POSTS',
    react_to_posts: 'REACT_TO_POSTS',
    reactToPosts: 'REACT_TO_POSTS',
    share_posts: 'SHARE_POSTS',
    sharePosts: 'SHARE_POSTS',
    follow_others: 'FOLLOW_OTHERS',
    followOthers: 'FOLLOW_OTHERS',
    accept_requests: 'ACCEPT_CONNECTIONS',
    acceptRequests: 'ACCEPT_CONNECTIONS',
    who_can_follow_them: 'WHO_CAN_FOLLOW',
    whoCanFollowThem: 'WHO_CAN_FOLLOW',
    who_can_send_requests: 'WHO_CAN_SEND_CONNECTION_REQUESTS',
    whoCanSendRequests: 'WHO_CAN_SEND_CONNECTION_REQUESTS',
    send_messages: 'SEND_MESSAGES',
    sendMessages: 'SEND_MESSAGES',
    receive_messages: 'RECEIVE_MESSAGES',
    receiveMessages: 'RECEIVE_MESSAGES',
    create_group_chats: 'CREATE_GROUP_CHATS',
    createGroupChats: 'CREATE_GROUP_CHATS',
    who_can_message_them: 'WHO_CAN_MESSAGE_THEM',
    whoCanMessageThem: 'WHO_CAN_MESSAGE_THEM',
    message_notifications: 'REQUIRE_APPROVAL_ADULT_CONTACT',
    connection_notifications: 'REQUIRE_APPROVAL_CONNECTIONS',
    activity_notifications: 'REQUIRE_APPROVAL_TEAM_INVITES',
    mention_notifications: 'REQUIRE_APPROVAL_MEDIA',
  };

  const fetchControlsForWard = async (wardId: string) => {
    if (!wardId) return;
    try {
      const res = await getSupervisionControls(wardId);
      const controls = res?.controls || (res as any)?.data?.controls || [];
      if (Array.isArray(controls) && controls.length > 0) {
        controls.forEach((c: any) => {
          const rawKey = String(c.control || c.name || '').toUpperCase();
          const val = c.value;

          // Feed Controls
          if (rawKey === SupervisionControlKeyEnum.VIEW_FEED || rawKey === 'VIEWFEED') {
            setHomePermissions((p) => ({ ...p, viewFeed: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.CREATE_POST || rawKey === 'CREATEPOSTS') {
            setHomePermissions((p) => ({ ...p, createPosts: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.COMMENT_ON_POSTS || rawKey === 'COMMENTONPOSTS') {
            setHomePermissions((p) => ({ ...p, commentOnPosts: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.REACT_TO_POSTS || rawKey === 'REACTTOPOSTS') {
            setHomePermissions((p) => ({ ...p, reactToPosts: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.SHARE_POSTS || rawKey === 'SHAREPOSTS') {
            setHomePermissions((p) => ({ ...p, sharePosts: Boolean(val) }));
          }

          // Network Controls
          if (rawKey === SupervisionControlKeyEnum.FOLLOW_OTHERS || rawKey === 'FOLLOWOTHERS') {
            setNetworkPermissions((p) => ({ ...p, followOthers: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.WHO_CAN_FOLLOW || rawKey === 'WHOCANFOLLOWTHEM') {
            setNetworkPermissions((p) => ({ ...p, whoCanFollowThem: String(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.WHO_CAN_SEND_CONNECTION_REQUESTS || rawKey === 'WHOCANSENDREQUESTS') {
            setNetworkPermissions((p) => ({ ...p, whoCanSendRequests: String(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.ACCEPT_CONNECTIONS || rawKey === 'ACCEPTREQUESTS') {
            setNetworkPermissions((p) => ({ ...p, acceptRequests: Boolean(val) }));
          }

          // Messaging Controls
          if (rawKey === SupervisionControlKeyEnum.SEND_MESSAGES || rawKey === 'SENDMESSAGES') {
            setMessagingPermissions((p) => ({ ...p, sendMessages: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.RECEIVE_MESSAGES || rawKey === 'RECEIVEMESSAGES') {
            setMessagingPermissions((p) => ({ ...p, receiveMessages: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.CREATE_GROUP_CHATS || rawKey === 'CREATEGROUPCHATS') {
            setMessagingPermissions((p) => ({ ...p, createGroupChats: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.WHO_CAN_MESSAGE_THEM || rawKey === 'WHOCANMESSAGETHEM') {
            setMessagingPermissions((p) => ({ ...p, whoCanMessageThem: String(val) }));
          }

          // Approval / Notification Controls
          if (rawKey === SupervisionControlKeyEnum.REQUIRE_APPROVAL_ADULT_CONTACT || rawKey === 'MESSAGENOTIFICATIONS') {
            setNotificationPermissions((p) => ({ ...p, messageNotifications: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.REQUIRE_APPROVAL_CONNECTIONS || rawKey === 'CONNECTIONNOTIFICATIONS') {
            setNotificationPermissions((p) => ({ ...p, connectionNotifications: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.REQUIRE_APPROVAL_TEAM_INVITES || rawKey === 'ACTIVITYNOTIFICATIONS') {
            setNotificationPermissions((p) => ({ ...p, activityNotifications: Boolean(val) }));
          }
          if (rawKey === SupervisionControlKeyEnum.REQUIRE_APPROVAL_MEDIA || rawKey === 'MENTIONNOTIFICATIONS') {
            setNotificationPermissions((p) => ({ ...p, mentionNotifications: Boolean(val) }));
          }
        });
      }
    } catch (err: any) {
      console.warn('Supervision controls fetch notice:', err);
    }
  };

  const queryClient = useQueryClient();

  const { data: rawSupervisionData, isLoading: isSupDataLoading } = useQuery(
    QueryKeys.SUPERVISION_DATA,
    getSupervisionData,
    { staleTime: 5 * 60 * 1000 }
  );

  useEffect(() => {
    async function processSupervisionData() {
      if (rawSupervisionData) {
        const children = (rawSupervisionData as any)?.children || (rawSupervisionData as any)?.data?.children || [];
        if (Array.isArray(children) && children.length > 0) {
          const mapped = children.map((c: any) => ({
            id: c.userId || c.profileId || c.id,
            name: c.displayName || c.firstName || 'Minor Player',
            age: c.age || 12,
            avatar: resolveMediaUrl(c.avatarUrl, '/userPlaceholder.png'),
          }));
          setWards(mapped);

          let targetId = initialWardIdFromNav || mapped[0].id;
          if (!mapped.some((w) => w.id === targetId)) {
            targetId = mapped[0].id;
          }
          setSelectedWardId(targetId);
          if (targetId) {
            await fetchControlsForWard(targetId);
          }
        } else {
          setWards([]);
          setSelectedWardId('');
        }
      }
      setApiLoading(isSupDataLoading);
      setIsControlsLoading(isSupDataLoading);
    }
    processSupervisionData();
  }, [rawSupervisionData, isSupDataLoading, initialWardIdFromNav]);

  // When parent selects a ward from the sidebar list
  const handleSelectWard = async (wardId: string) => {
    setSelectedWardId(wardId);
    setIsControlsLoading(true);
    try {
      await fetchControlsForWard(wardId);
    } finally {
      setIsControlsLoading(false);
    }
  };

  const [updatingControlKey, setUpdatingControlKey] = useState<string | null>(null);

  const handleToggleControl = async (
    controlKey: string,
    label: string,
    currentVal: boolean | string,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    if (!selectedWardId || updatingControlKey) return;
    const newVal = typeof currentVal === 'boolean' ? !currentVal : currentVal;

    const backendControl = CONTROL_KEY_TO_BACKEND_ENUM[controlKey] || controlKey.toUpperCase();
    const stateKeyMap: Record<string, string> = {
      view_feed: 'viewFeed',
      create_posts: 'createPosts',
      comment_on_posts: 'commentOnPosts',
      react_to_posts: 'reactToPosts',
      share_posts: 'sharePosts',
      follow_others: 'followOthers',
      accept_requests: 'acceptRequests',
      who_can_follow_them: 'whoCanFollowThem',
      who_can_send_requests: 'whoCanSendRequests',
      send_messages: 'sendMessages',
      receive_messages: 'receiveMessages',
      create_group_chats: 'createGroupChats',
      who_can_message_them: 'whoCanMessageThem',
      message_notifications: 'messageNotifications',
      connection_notifications: 'connectionNotifications',
      activity_notifications: 'activityNotifications',
      mention_notifications: 'mentionNotifications',
    };
    const targetPropKey = stateKeyMap[controlKey] || controlKey;

    setUpdatingControlKey(controlKey);
    setter((prev: any) => ({
      ...prev,
      [controlKey]: newVal,
      [targetPropKey]: newVal,
    }));

    try {
      await updateSupervisionControls(selectedWardId, [{ control: backendControl, value: newVal }]);
      showToast(SUCCESS_MESSAGES.PERMISSION_UPDATED, ToastTypeEnum.SUCCESS);
      await fetchControlsForWard(selectedWardId);
    } catch (err: any) {
      setter((prev: any) => ({
        ...prev,
        [controlKey]: currentVal,
        [targetPropKey]: currentVal,
      }));
      showToast(err.message || ERROR_MESSAGES.FAILED_UPDATE_PERMISSION, ToastTypeEnum.ERROR);
    } finally {
      setUpdatingControlKey(null);
    }
  };

  const renderToggleSwitch = (
    controlKey: string,
    label: string,
    isOn: boolean,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const isUpdating = updatingControlKey === controlKey;
    return (
      <Button
        type="button"
        onClick={() => handleToggleControl(controlKey, label, isOn, setter)}
        disabled={isUpdating}
        className={`mhn-toggle-switch ${isOn ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
        style={isUpdating ? { opacity: 0.8, cursor: 'wait', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } : undefined}
      >
        {isUpdating ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            style={{ animation: 'mhn-spin 0.8s linear infinite', margin: 'auto' }}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" fill="none" />
          </svg>
        ) : (
          <div className="mhn-toggle-handle" />
        )}
      </Button>
    );
  };

 

  const sampleLogs = [
    {
      id: 'log1',
      dateTime: 'Aug 10, 2026 20:30',
      activity: 'Team invitation received',
      initiatedBy: 'Connor McDavid',
      actionText: 'View',
    },
    {
      id: 'log2',
      dateTime: 'Aug 10, 2026 20:30',
      activity: 'Profile information updated',
      initiatedBy: 'Noah Carter',
      actionText: 'View',
    },
    {
      id: 'log3',
      dateTime: 'Aug 10, 2026 20:30',
      activity: 'New coach message',
      initiatedBy: 'David Chen (Coach)',
      actionText: 'View',
    },
    {
      id: 'log4',
      dateTime: 'Aug 10, 2026 20:30',
      activity: 'Profile visibility changed',
      initiatedBy: 'Sarah Carter (Parent)',
      actionText: 'Manage',
    },
    {
      id: 'log5',
      dateTime: 'Aug 10, 2026 20:30',
      activity: 'User blocked',
      initiatedBy: 'Sarah Carter (Parent)',
      actionText: 'Manage',
    },
    {
      id: 'log6',
      dateTime: 'Aug 10, 2026 20:30',
      activity: 'Team invitation received',
      initiatedBy: 'Connor McDavid',
      actionText: 'View',
    },
    {
      id: 'log7',
      dateTime: 'Aug 10, 2026 20:30',
      activity: 'Team invitation received',
      initiatedBy: 'Connor McDavid',
      actionText: 'View',
    },
  ];

  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const debouncedLogsSearchQuery = useDebounce(logsSearchQuery, 800);

  // Load live controls and logs for selected minor child
  useEffect(() => {
    if (!selectedWardId) return;

    // Validate that selectedWardId is a valid 36-character UUID (skips mock IDs like 'w1')
    const isRealUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(selectedWardId);
    if (!isRealUuid) return;

    async function loadWardControlsAndLogs() {
      try {
        const controlsRes = await getSupervisionControls(selectedWardId);
        const controls = controlsRes?.controls || (controlsRes as any)?.data?.controls;
        if (Array.isArray(controls)) {
          controls.forEach((c: any) => {
            if (c.control === 'VIEW_FEED') setHomePermissions((prev) => ({ ...prev, viewFeed: !!c.value }));
            if (c.control === 'CREATE_POST') setHomePermissions((prev) => ({ ...prev, createPosts: !!c.value }));
            if (c.control === 'COMMENT_ON_POSTS') setHomePermissions((prev) => ({ ...prev, commentOnPosts: !!c.value }));
            if (c.control === 'REACT_TO_POSTS') setHomePermissions((prev) => ({ ...prev, reactToPosts: !!c.value }));
            if (c.control === 'SHARE_POSTS') setHomePermissions((prev) => ({ ...prev, sharePosts: !!c.value }));
            if (c.control === 'FOLLOW_OTHERS') setNetworkPermissions((prev) => ({ ...prev, followOthers: !!c.value }));
            if (c.control === 'ACCEPT_CONNECTIONS') setNetworkPermissions((prev) => ({ ...prev, acceptRequests: !!c.value }));
            if (c.control === 'WHO_CAN_FOLLOW') setNetworkPermissions((prev) => ({ ...prev, whoCanFollowThem: String(c.value) }));
            if (c.control === 'WHO_CAN_SEND_CONNECTION_REQUESTS') setNetworkPermissions((prev) => ({ ...prev, whoCanSendRequests: String(c.value) }));
            if (c.control === 'SEND_MESSAGES') setMessagingPermissions((prev) => ({ ...prev, sendMessages: !!c.value }));
            if (c.control === 'RECEIVE_MESSAGES') setMessagingPermissions((prev) => ({ ...prev, receiveMessages: !!c.value }));
            if (c.control === 'CREATE_GROUP_CHATS') setMessagingPermissions((prev) => ({ ...prev, createGroupChats: !!c.value }));
            if (c.control === 'WHO_CAN_MESSAGE_THEM') setMessagingPermissions((prev) => ({ ...prev, whoCanMessageThem: String(c.value) }));
          });
        }

        const logsRes = await getSupervisionLogs(selectedWardId);
        const logItems = logsRes?.items || (logsRes as any)?.data?.items;
        if (Array.isArray(logItems) && logItems.length > 0) {
          const mappedLogs = logItems.map((l: any) => ({
            id: l.id,
            dateTime: new Date(l.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            activity: l.summary || l.type || 'Supervision activity log',
            initiatedBy: l.actorRoleLabel || 'Parent',
            actionText: 'View',
          }));
          setLiveLogs(mappedLogs);
        }
      } catch (err: any) {
        console.warn('❌ [SupervisionPage] Controls/Logs load notice:', err?.message || err);
      }
    }
    loadWardControlsAndLogs();
  }, [selectedWardId]);

  const handleTabChange = (tab: string, extraData?: any) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab, extraData);
    }
  };

  const handleCreatePlayerSubmit = async () => {
    const nameToUse = newPlayer.fullName.trim() || 'Noah';
    setAddedPlayerName(nameToUse);

    const nameParts = nameToUse.split(' ');
    const firstName = nameParts[0] || 'Minor';
    const lastName = nameParts.slice(1).join(' ') || 'Player';

    setApiLoading(true);
    setIsControlsLoading(true);
    setIsCreatingPlayer(true);
    try {
      const formattedDob = formatDobToIso(newPlayer.dob) || '2015-05-15';
      const validRelation = (newPlayer.relationship as any) || 'MOTHER';

      const res = await createManagedChild({
        displayName: nameToUse,
        firstName,
        lastName,
        dateOfBirth: formattedDob,
        guardianRelation: validRelation,
        email: newPlayer.email.trim() || undefined,
      });

      const childProfile = res?.child || (res as any)?.data?.profile || (res as any)?.data?.child || (res as any)?.profile;
      const newChildId = childProfile?.id || (res as any)?.childId || (res as any)?.id;
      if (newChildId) {
        setCreatedWardId(newChildId);
        setSelectedWardId(newChildId);
      }

      // Call supervision API immediately with no cache
      try {
        await globalQueryClient.invalidateQueries(QueryKeys.SUPERVISION_DATA);
        const freshSupData = await getSupervisionData();
        if (freshSupData?.children && Array.isArray(freshSupData.children)) {
          const mapped = freshSupData.children.map((c: any) => ({
            id: c.id,
            name: c.displayName || c.firstName || nameToUse,
            age: c.age || 12,
            avatar: resolveMediaUrl(c.avatarUrl, '/userPlaceholder.png'),
          }));
          setWards(mapped);
          const targetId = newChildId || (mapped.length > 0 ? mapped[mapped.length - 1].id : null);
          if (targetId) {
            setSelectedWardId(targetId);
            setCreatedWardId(targetId);
          }
        }
      } catch (refetchErr) {
        console.warn('Supervision API refetch after creation notice:', refetchErr);
      }

      showToast(SUCCESS_MESSAGES.PLAYER_ADDED, ToastTypeEnum.SUCCESS);
      setViewMode(SupervisionViewModeEnum.CREATE_SUCCESS);
    } catch (err: any) {
      showToast(err?.message || ERROR_MESSAGES.FAILED_CREATE_PLAYER, ToastTypeEnum.ERROR);
    } finally {
      setApiLoading(false);
      setIsControlsLoading(false);
      setIsCreatingPlayer(false);
    }
  };

  const handleSendLinkInvitation = async () => {
    if (!linkChildEmail.trim() || !linkChildEmail.includes('@')) {
      setLinkEmailError('Please enter a valid email address.');
      return;
    }

    setIsSendingLinkInvite(true);
    try {
      await sendGuardianInvite(linkChildEmail.trim());
      showToast(SUCCESS_MESSAGES.INVITATION_SENT, ToastTypeEnum.SUCCESS);
      setViewMode(SupervisionViewModeEnum.LINK_SENT);
    } catch (err: any) {
      showToast(err?.message || ERROR_MESSAGES.FAILED_SEND_INVITATION, ToastTypeEnum.ERROR);
    } finally {
      setIsSendingLinkInvite(false);
    }
  };

  const handlePlayerAddComplete = async () => {
    setIsAddPlayerModalOpen(false);
    showToast(SUCCESS_MESSAGES.PLAYER_UPDATED, ToastTypeEnum.SUCCESS);
    try {
      const supData = await getSupervisionData();
      if (supData?.children && supData.children.length > 0) {
        const mapped = supData.children.map((c: any) => ({
          id: c.id,
          name: c.displayName || c.firstName || 'Minor Player',
          age: c.age || 12,
          avatar: resolveMediaUrl(c.avatarUrl, '/userPlaceholder.png'),
        }));
        setWards(mapped);
        if (mapped[0]?.id) {
          setSelectedWardId(mapped[0].id);
        }
      }
    } catch (err) {
      console.warn('Supervision data reload notice:', err);
    }
  };

  return (
    <div className="mhn-supervision-page-root">
      {/* Top Header Navbar */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Main Content Layout */}
      <main className="mhn-supervision-main-container">
        <div className="mhn-supervision-card-wrapper">
          {/* Left Column: Wards List */}
          <aside className="mhn-supervision-sidebar">
            <div className="mhn-supervision-sidebar-header">
              <h2 className="mhn-supervision-sidebar-title">Supervision</h2>
              <Button
                className="mhn-supervision-add-btn"
                onClick={() => setViewMode(SupervisionViewModeEnum.CHOICE)}
                title="Add Minor Account"
              >
                <img src='/add4.png' className='add4' />
              </Button>
            </div>

            <div className="mhn-supervision-wards-list">
              {apiLoading ? (
                <SidebarWardSkeleton count={2} />
              ) : wards.length === 0 ? (
                <div style={{ padding: '16px 12px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
                  No managed players found.
                </div>
              ) : (
                wards.map((ward) => (
                  <div
                    key={ward.id}
                    onClick={() => {
                      setSelectedWardId(ward.id);
                      setViewMode(SupervisionViewModeEnum.MAIN);
                    }}
                    className={`mhn-supervision-ward-item ${selectedWardId === ward.id && viewMode === SupervisionViewModeEnum.MAIN ? 'mhn-ward-active' : ''}`}
                  >
                    <img
                      src={ward.avatar}
                      alt={ward.name}
                      className="mhn-ward-avatar"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                      }}
                    />
                    <span className="mhn-ward-name-label">
                      {ward.name} <span className="mhn-ward-age">({ward.age})</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Right Main Content Area */}
          <section className="mhn-supervision-content-area">
            {/* STEP 1: Choice View ("How would you like to add them?") - Image 35 */}
            {viewMode === SupervisionViewModeEnum.CHOICE && (
              <div className="mhn-supervision-choice-view">
                <h3 className="mhn-choice-title">Add Player Account</h3>
                <p className="mhn-choice-desc">Choose how you would like to connect your athlete to your supervision hub.</p>

                <div className="mhn-choice-options-grid">
                  {/* Option 1: Create New Player Account */}
                  <div
                    onClick={() => setViewMode(SupervisionViewModeEnum.CREATE_DETAILS)}
                    className="mhn-choice-card"
                  >
                    <div className="mhn-choice-icon-badge mhn-icon-create">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="17" y1="11" x2="23" y2="11" />
                      </svg>
                    </div>
                    <h4 className="mhn-choice-card-title">Create Player Account</h4>
                    <p className="mhn-choice-card-desc">Create a new account for a child under 13 or an athlete without an account.</p>
                  </div>

                  {/* Option 2: Link Existing Account */}
                  <div
                    onClick={() => setViewMode(SupervisionViewModeEnum.LINK_EXISTING)}
                    className="mhn-choice-card"
                  >
                    <div className="mhn-choice-icon-badge mhn-icon-link">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <h4 className="mhn-choice-card-title">Link Existing Account</h4>
                    <p className="mhn-choice-card-desc">Send a supervision request to an athlete who already has an email account.</p>
                  </div>
                </div>
              </div>
            )}

            {/* B. STEP 1: CREATE PLAYER ACCOUNT DETAILS */}
            {viewMode === SupervisionViewModeEnum.CREATE_DETAILS && (() => {
              const fullNameErr = (supervisionPlayerTouched.fullName || hasAttemptedSupervisionCreate) ? getSupervisionFullNameError() : null;
              const dobErr = (supervisionPlayerTouched.dob || hasAttemptedSupervisionCreate) ? getSupervisionDobError() : null;
              const relationErr = (supervisionPlayerTouched.relationship || hasAttemptedSupervisionCreate) ? getSupervisionRelationError() : null;
              const emailErr = (supervisionPlayerTouched.email || hasAttemptedSupervisionCreate) ? getSupervisionEmailError() : null;

              const isStep1Valid = !getSupervisionFullNameError() && !getSupervisionDobError() && !getSupervisionRelationError() && !getSupervisionEmailError();

              const handleStep1Continue = () => {
                setHasAttemptedSupervisionCreate(true);
                setSupervisionPlayerTouched({ fullName: true, dob: true, relationship: true, email: true });
                if (isStep1Valid) {
                  setViewMode(SupervisionViewModeEnum.CREATE_PROTECT);
                }
              };

              return (
                <div className="mhn-flow-container mhn-flow-form-wrapper">
                  <h2 className="mhn-flow-title">Player Details</h2>
                  <p className="mhn-flow-subtitle">Tell us a little about your player.</p>

                  <div className="mhn-form-fields-stack">
                    <FormField label="Full Name" required error={fullNameErr} maxLength={50} valueLength={newPlayer.fullName?.length}>
                      <Input
                        type="text"
                        value={newPlayer.fullName}
                        onChange={(e) => {
                          setNewPlayer({ ...newPlayer, fullName: e.target.value });
                          if (!supervisionPlayerTouched.fullName) setSupervisionPlayerTouched((p) => ({ ...p, fullName: true }));
                        }}
                        onBlur={() => setSupervisionPlayerTouched((p) => ({ ...p, fullName: true }))}
                        maxLength={50}
                        placeholder="e.g. Connor McDavid"
                        className={`mhn-form-input ${fullNameErr || (newPlayer.fullName && newPlayer.fullName.length >= 50) ? 'mhn-input-error' : ''}`}
                      />
                    </FormField>

                    <FormField label="DOB" required error={dobErr}>
                      <div className="mhn-form-date-input-wrapper" style={{ position: 'relative' }}>
                        <Input
                          type="text"
                          value={newPlayer.dob}
                          onChange={(e) => {
                            setNewPlayer({ ...newPlayer, dob: formatDobInput(e.target.value) });
                            if (!supervisionPlayerTouched.dob) setSupervisionPlayerTouched((p) => ({ ...p, dob: true }));
                          }}
                          onBlur={() => setSupervisionPlayerTouched((p) => ({ ...p, dob: true }))}
                          maxLength={10}
                          placeholder="DD/MM/YYYY"
                          className={`mhn-form-input ${dobErr ? 'mhn-input-error' : ''}`}
                        />
                        <svg
                          className="mhn-calendar-icon"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="2"
                          onClick={handleSupervisionCalendarClick}
                          style={{ cursor: 'pointer', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <Input
                          type="date"
                          ref={supervisionDateInputRef}
                          onChange={(e) => {
                            const dateVal = e.target.value;
                            if (dateVal) {
                              const parts = dateVal.split('-');
                              if (parts.length === 3) {
                                const [yyyy, mm, dd] = parts;
                                setNewPlayer((prev) => ({ ...prev, dob: `${dd}/${mm}/${yyyy}` }));
                                setSupervisionPlayerTouched((p) => ({ ...p, dob: true }));
                              }
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: '12px',
                            width: '32px',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            zIndex: 2,
                          }}
                        />
                      </div>
                    </FormField>

                    <Dropdown
                      label="Relationship to player"
                      required
                      error={relationErr}
                      value={newPlayer.relationship}
                      options={GUARDIAN_RELATION_OPTIONS}
                      onChange={(val) => {
                        setNewPlayer({ ...newPlayer, relationship: val });
                        setSupervisionPlayerTouched((p) => ({ ...p, relationship: true }));
                      }}
                      placeholder="Select relationship"
                    />

                    <FormField label="Email" required error={emailErr}>
                      <Input
                        type="email"
                        value={newPlayer.email}
                        onChange={(e) => {
                          setNewPlayer({ ...newPlayer, email: e.target.value });
                          if (!supervisionPlayerTouched.email) setSupervisionPlayerTouched((p) => ({ ...p, email: true }));
                        }}
                        onBlur={() => setSupervisionPlayerTouched((p) => ({ ...p, email: true }))}
                        placeholder="admin@gmail.com"
                        className={`mhn-form-input ${emailErr ? 'mhn-input-error' : ''}`}
                      />
                    </FormField>
                  </div>

                  <div className="mhn-form-actions-stack">
                    <Button
                      className="mhn-btn-modal-cancel"
                      onClick={() => setViewMode(SupervisionViewModeEnum.CHOICE)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreatingPlayer}
                      className="mhn-btn-modal-submit"
                      onClick={handleStep1Continue}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              );
            })()}

            {/* C. STEP 2: CREATE PLAYER ACCOUNT PROTECTION */}
            {viewMode === SupervisionViewModeEnum.CREATE_PROTECT && (
              <div className="mhn-flow-container mhn-flow-form-wrapper">
                <h2 className="mhn-flow-title">Protect {newPlayer.fullName.trim() || 'Noah'}'s profile</h2>
                <p className="mhn-flow-subtitle">You can change these settings anytime.</p>

                <div className="mhn-protect-section">
                  <span className="mhn-protect-section-title">PROFILE VISIBILITY</span>
                  <div className="mhn-protect-cards-stack">
                    <label
                      className={`mhn-protect-radio-card ${newPlayer.visibility === 'private' ? 'mhn-radio-selected' : ''}`}
                      onClick={() => setNewPlayer({ ...newPlayer, visibility: 'private' })}
                    >
                      <Input
                        type="radio"
                        name="visibility"
                        checked={newPlayer.visibility === 'private'}
                        onChange={() => setNewPlayer({ ...newPlayer, visibility: 'private' })}
                        className="mhn-radio-input"
                      />
                      <div className="mhn-radio-card-text">
                        <h4 className="mhn-radio-heading">Private</h4>
                        <p className="mhn-radio-sub">Only approved hockey relationships can see {newPlayer.fullName.trim() || 'Noah'}'s profile.</p>
                      </div>
                    </label>

                    <label
                      className={`mhn-protect-radio-card ${newPlayer.visibility === 'network' ? 'mhn-radio-selected' : ''}`}
                      onClick={() => setNewPlayer({ ...newPlayer, visibility: 'network' })}
                    >
                      <Input
                        type="radio"
                        name="visibility"
                        checked={newPlayer.visibility === 'network'}
                        onChange={() => setNewPlayer({ ...newPlayer, visibility: 'network' })}
                        className="mhn-radio-input"
                      />
                      <div className="mhn-radio-card-text">
                        <h4 className="mhn-radio-heading">Hockey Network</h4>
                        <p className="mhn-radio-sub">Approved team and association members may see limited information.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mhn-protect-section">
                  <span className="mhn-protect-section-title">CONTACT & CONNECTIONS</span>
                  <div className="mhn-protect-toggles-stack">
                    <div className="mhn-protect-toggle-row">
                      <div className="mhn-protect-toggle-text">
                        <h4 className="mhn-protect-toggle-heading">Adult contact requests</h4>
                        <p className="mhn-protect-toggle-sub">Require my approval</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setNewPlayer(p => ({ ...p, adultRequests: !p.adultRequests }))}
                        className={`mhn-toggle-switch ${newPlayer.adultRequests ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      >
                        <div className="mhn-toggle-handle" />
                      </Button>
                    </div>

                    <div className="mhn-protect-toggle-row">
                      <div className="mhn-protect-toggle-text">
                        <h4 className="mhn-protect-toggle-heading">Connections</h4>
                        <p className="mhn-protect-toggle-sub">Require my approval</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setNewPlayer(p => ({ ...p, connections: !p.connections }))}
                        className={`mhn-toggle-switch ${newPlayer.connections ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      >
                        <div className="mhn-toggle-handle" />
                      </Button>
                    </div>

                    <div className="mhn-protect-toggle-row">
                      <div className="mhn-protect-toggle-text">
                        <h4 className="mhn-protect-toggle-heading">Team invitations</h4>
                        <p className="mhn-protect-toggle-sub">Require my approval</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setNewPlayer(p => ({ ...p, teamInvitations: !p.teamInvitations }))}
                        className={`mhn-toggle-switch ${newPlayer.teamInvitations ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      >
                        <div className="mhn-toggle-handle" />
                      </Button>
                    </div>

                    <div className="mhn-protect-toggle-row">
                      <div className="mhn-protect-toggle-text">
                        <h4 className="mhn-protect-toggle-heading">Media visibility</h4>
                        <p className="mhn-protect-toggle-sub">Require my approval</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setNewPlayer(p => ({ ...p, mediaVisibility: !p.mediaVisibility }))}
                        className={`mhn-toggle-switch ${newPlayer.mediaVisibility ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      >
                        <div className="mhn-toggle-handle" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mhn-form-actions-stack">
                  <Button
                    className="mhn-btn-modal-cancel"
                    onClick={() => setViewMode(SupervisionViewModeEnum.CREATE_DETAILS)}
                    disabled={isCreatingPlayer}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreatePlayerSubmit}
                    disabled={isCreatingPlayer}
                    className="mhn-btn-modal-submit"
                  >
                    {isCreatingPlayer ? <Spinner size="sm" color="#FFFFFF" /> : 'Create Account'}
                  </Button>
                </div>
              </div>
            )}

            {/* D. STEP 3: CREATE PLAYER ACCOUNT SUCCESS */}
            {viewMode === SupervisionViewModeEnum.CREATE_SUCCESS && (
              <div className="mhn-flow-container mhn-flow-success-box">
                <div className="mhn-success-circle-icon">
                  <img src='/CheckCircle.png' alt='check-circle' className='checkCircle' />
                </div>

                <h2 className="mhn-flow-title">{formatShortPlayerName(addedPlayerName, 14)} has been added</h2>
                <p className="mhn-flow-subtitle">You're now managing {formatShortPlayerName(addedPlayerName, 14)}'s hockey profile.</p>

                <div className="mhn-form-actions-stack mhn-form-actions-narrow">
                  <Button
                    className="mhn-btn-modal-submit"
                    onClick={() => {
                      setViewMode(SupervisionViewModeEnum.MAIN);
                      const targetId = createdWardId || selectedWardId;
                      if (onNavigate) {
                        onNavigate('profile', { selectedWardId: targetId, userId: targetId, childId: targetId, childName: addedPlayerName });
                      }
                    }}
                    title={`Go to ${addedPlayerName}'s Profile`}
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      display: 'block',
                      textAlign: 'center',
                    }}
                  >
                    Go to Supervision Hub
                  </Button>
                </div>
              </div>
            )}

            {/* E. LINK EXISTING ACCOUNT FORM */}
            {viewMode === SupervisionViewModeEnum.LINK_EXISTING && (
              <div className="mhn-flow-container mhn-flow-form-wrapper">
                <h2 className="mhn-flow-title">Supervise your child</h2>
                <p className="mhn-flow-subtitle">Invite your teen to partner with you on supervising their Teen Account.</p>

                <div className="mhn-form-fields-stack">
                  <div className="mhn-form-field-group">
                    <label className="mhn-form-field-label">Child Email Address</label>
                    <Input
                      type="email"
                      value={linkChildEmail}
                      onChange={(e) => {
                        setLinkChildEmail(e.target.value);
                        if (linkEmailError) setLinkEmailError(null);
                      }}
                      placeholder="email@example.com"
                      className={`mhn-form-input ${linkEmailError ? 'mhn-input-error' : ''}`}
                    />
                    {linkEmailError && (
                      <div className="mhn-input-error-msg">
                        {linkEmailError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mhn-form-actions-stack">
                  <Button
                    className="mhn-btn-solid-blue"
                    onClick={handleSendLinkInvitation}
                    disabled={isSendingLinkInvite}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isSendingLinkInvite && <Spinner size="sm" color="#FFFFFF" />}
                    <span>{isSendingLinkInvite ? 'Sending Invitation...' : 'Send Invitation'}</span>
                  </Button>
                  <Button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode(SupervisionViewModeEnum.CHOICE)}
                  >
                    Back
                  </Button>
                </div>

                <div className="mhn-trouble-footer">
                  <span className='having'>Having trouble? </span>
                  <a href="#support" onClick={(e) => { e.preventDefault(); alert('Redirecting to Support...'); }} className="mhn-trouble-link">
                    Contact Support
                  </a>
                </div>
              </div>
            )}

            {/* STEP 2B: Request Sent Screen (Image 40) */}
            {viewMode === SupervisionViewModeEnum.LINK_SENT && (
              <div className="mhn-flow-container mhn-flow-success-box">
                <div className="mhn-request-sent-icon-wrapper">
                  <img alt='request-sent' src='/emailSent.png' />
                </div>

                <h2 className="mhn-flow-title mhn-flow-title-large">Request Sent!</h2>
                <p className="mhn-flow-subtitle mhn-flow-subtitle-wide">
                  We've emailed your child. Once they approve, you'll have full access to their MyHockey Network. You can explore some public content in the meantime.
                </p>

                <div className="mhn-flow-button-container">
                  <Button
                    className="mhn-btn-solid-blue"
                    onClick={() => {
                      setLinkChildEmail('');
                      setViewMode(SupervisionViewModeEnum.MAIN);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* DEFAULT VIEW: Main Tabbed View (Permissions / Requests / Logs) */}
            {viewMode === SupervisionViewModeEnum.MAIN && (
              <>
                {/* Top Sub-Tabs Navigation */}
                <div className="mhn-supervision-tabs-row">
                  <Button
                    onClick={() => setActiveMainTab(SupervisionMainTabEnum.PERMISSIONS)}
                    className={`mhn-supervision-tab-btn ${activeMainTab === SupervisionMainTabEnum.PERMISSIONS ? 'mhn-tab-active' : ''}`}
                  >
                    Permissions
                  </Button>
                  <Button
                    onClick={() => setActiveMainTab(SupervisionMainTabEnum.REQUESTS)}
                    className={`mhn-supervision-tab-btn ${activeMainTab === SupervisionMainTabEnum.REQUESTS ? 'mhn-tab-active' : ''}`}
                  >
                    Requests
                  </Button>
                  <Button
                    onClick={() => setActiveMainTab(SupervisionMainTabEnum.LOGS)}
                    className={`mhn-supervision-tab-btn ${activeMainTab === SupervisionMainTabEnum.LOGS ? 'mhn-tab-active' : ''}`}
                  >
                    Logs
                  </Button>
                </div>

                <div className="mhn-supervision-tab-body">
                  {/* Content for Permissions Tab */}
                  {activeMainTab === SupervisionMainTabEnum.PERMISSIONS && (
                    isControlsLoading ? (
                      <PermissionSkeletonLoader />
                    ) : (
                      <div className="mhn-supervision-permissions-stack">
                        {/* 1. Home Section Accordion */}
                        <div className={`mhn-supervision-accordion ${expandedCategories.home ? 'mhn-accordion-expanded' : ''}`}>
                          <div
                            className="mhn-accordion-header"
                            onClick={() => toggleCategory('home')}
                          >
                            <div className="mhn-accordion-title-left">
                              <img src='/home.png' className='home' />
                              <span className='superTitle'>Home</span>
                            </div>
                            <svg
                              className={`mhn-accordion-chevron ${expandedCategories.home ? 'mhn-chevron-up' : ''}`}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#64748B"
                              strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>

                          {expandedCategories.home && (
                            <div className="mhn-accordion-body">
                              {/* View feed */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">View feed</h4>
                                  <p className="mhn-permission-subtitle">Can see posts from their network</p>
                                </div>
                                {renderToggleSwitch('view_feed', 'View feed', homePermissions.viewFeed, setHomePermissions)}
                              </div>

                              {/* Create posts */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Create posts</h4>
                                  <p className="mhn-permission-subtitle">Can publish posts to their network</p>
                                </div>
                                {renderToggleSwitch('create_posts', 'Create posts', homePermissions.createPosts, setHomePermissions)}
                              </div>

                              {/* Comment on posts */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Comment on posts</h4>
                                  <p className="mhn-permission-subtitle">Can leave comments on others' posts</p>
                                </div>
                                {renderToggleSwitch('comment_on_posts', 'Comment on posts', homePermissions.commentOnPosts, setHomePermissions)}
                              </div>

                              {/* React to posts */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">React to posts</h4>
                                  <p className="mhn-permission-subtitle">Can like, celebrate, or react to content</p>
                                </div>
                                {renderToggleSwitch('react_to_posts', 'React to posts', homePermissions.reactToPosts, setHomePermissions)}
                              </div>

                              {/* Share posts */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Share posts</h4>
                                  <p className="mhn-permission-subtitle">Can reshare content to their feed</p>
                                </div>
                                {renderToggleSwitch('share_posts', 'Share posts', homePermissions.sharePosts, setHomePermissions)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. My Network Section Accordion */}
                        <div className={`mhn-supervision-accordion ${expandedCategories.network ? 'mhn-accordion-expanded' : ''}`}>
                          <div
                            className="mhn-accordion-header"
                            onClick={() => toggleCategory('network')}
                          >
                            <div className="mhn-accordion-title-left">
                              <img src='/myNetwork.png' className='home' />
                              <span className='superTitle'>My Network</span>
                            </div>
                            <svg
                              className={`mhn-accordion-chevron ${expandedCategories.network ? 'mhn-chevron-up' : ''}`}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#64748B"
                              strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>

                          {expandedCategories.network && (
                            <div className="mhn-accordion-body">
                              {/* Follow others */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Follow others</h4>
                                  <p className="mhn-permission-subtitle">Can follow people and pages</p>
                                </div>
                                {renderToggleSwitch('follow_others', 'Follow others', networkPermissions.followOthers, setNetworkPermissions)}
                              </div>

                              {/* Who can follow them */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Who can follow them</h4>
                                  <p className="mhn-permission-subtitle">Controls who can subscribe to their updates</p>
                                </div>
                                <Dropdown
                                  value={networkPermissions.whoCanFollowThem}
                                  options={['Everyone', 'Connections Only', 'Nobody']}
                                  onChange={(val) => handleToggleControl('who_can_follow_them', 'Who can follow them', val, setNetworkPermissions)}
                                  disabled={updatingControlKey === 'who_can_follow_them'}
                                  placeholder=""
                                  style={{ width: '180px' }}
                                />
                              </div>

                              {/* Who can send connection requests */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Who can send connection requests</h4>
                                  <p className="mhn-permission-subtitle">Limits incoming connection requests</p>
                                </div>
                                <Dropdown
                                  value={networkPermissions.whoCanSendRequests}
                                  options={['Everyone', 'Connections Only', 'Nobody']}
                                  onChange={(val) => handleToggleControl('who_can_send_requests', 'Who can send requests', val, setNetworkPermissions)}
                                  disabled={updatingControlKey === 'who_can_send_requests'}
                                  placeholder=""
                                  style={{ width: '180px' }}
                                />
                              </div>

                              {/* Accept connection requests */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Accept connection requests</h4>
                                  <p className="mhn-permission-subtitle">Can accept incoming requests from others</p>
                                </div>
                                {renderToggleSwitch('accept_requests', 'Accept connection requests', networkPermissions.acceptRequests, setNetworkPermissions)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. Messaging Section Accordion */}
                        <div className={`mhn-supervision-accordion ${expandedCategories.messaging ? 'mhn-accordion-expanded' : ''}`}>
                          <div
                            className="mhn-accordion-header"
                            onClick={() => toggleCategory('messaging')}
                          >
                            <div className="mhn-accordion-title-left">
                              <img src='/messaging2.png' className='home' />
                              <span className='superTitle'>Messaging</span>
                            </div>
                            <svg
                              className={`mhn-accordion-chevron ${expandedCategories.messaging ? 'mhn-chevron-up' : ''}`}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#64748B"
                              strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>

                          {expandedCategories.messaging && (
                            <div className="mhn-accordion-body">
                              {/* Send messages */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Send messages</h4>
                                  <p className="mhn-permission-subtitle">Can initiate and reply to conversations</p>
                                </div>
                                {renderToggleSwitch('send_messages', 'Send messages', messagingPermissions.sendMessages, setMessagingPermissions)}
                              </div>

                              {/* Receive messages */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Receive messages</h4>
                                  <p className="mhn-permission-subtitle">Others can send them messages</p>
                                </div>
                                {renderToggleSwitch('receive_messages', 'Receive messages', messagingPermissions.receiveMessages, setMessagingPermissions)}
                              </div>

                              {/* Create group chats */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Create group chats</h4>
                                  <p className="mhn-permission-subtitle">Can start group conversations</p>
                                </div>
                                {renderToggleSwitch('create_group_chats', 'Create group chats', messagingPermissions.createGroupChats, setMessagingPermissions)}
                              </div>

                              {/* Who can message them */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Who can message them</h4>
                                  <p className="mhn-permission-subtitle">Controls who can start a conversation</p>
                                </div>
                                <Dropdown
                                  value={messagingPermissions.whoCanMessageThem}
                                  options={['Connections Only', 'Everyone', 'Nobody']}
                                  onChange={(val) => handleToggleControl('who_can_message_them', 'Who can message them', val, setMessagingPermissions)}
                                  disabled={updatingControlKey === 'who_can_message_them'}
                                  placeholder=""
                                  style={{ width: '180px' }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4. Notifications Section Accordion */}
                        <div className={`mhn-supervision-accordion ${expandedCategories.notifications ? 'mhn-accordion-expanded' : ''}`}>
                          <div
                            className="mhn-accordion-header"
                            onClick={() => toggleCategory('notifications')}
                          >
                            <div className="mhn-accordion-title-left">
                              <img src='/notifications.png' className='home' />
                              <span className='superTitle'>Notifications</span>
                            </div>
                            <svg
                              className={`mhn-accordion-chevron ${expandedCategories.notifications ? 'mhn-chevron-up' : ''}`}
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#64748B"
                              strokeWidth="2"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>

                          {expandedCategories.notifications && (
                            <div className="mhn-accordion-body">
                              {/* Message notifications */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Message notifications</h4>
                                  <p className="mhn-permission-subtitle">Get notified when they receive a message</p>
                                </div>
                                {renderToggleSwitch('message_notifications', 'Message notifications', notificationPermissions.messageNotifications, setNotificationPermissions)}
                              </div>

                              {/* Connection request notifications */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Connection request notifications</h4>
                                  <p className="mhn-permission-subtitle">Get notified about incoming requests</p>
                                </div>
                                {renderToggleSwitch('connection_notifications', 'Connection notifications', notificationPermissions.connectionNotifications, setNotificationPermissions)}
                              </div>

                              {/* Activity notifications */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Activity notifications</h4>
                                  <p className="mhn-permission-subtitle">Reactions, comments on their posts</p>
                                </div>
                                {renderToggleSwitch('activity_notifications', 'Activity notifications', notificationPermissions.activityNotifications, setNotificationPermissions)}
                              </div>

                              {/* Mention notifications */}
                              <div className="mhn-permission-row">
                                <div className="mhn-permission-meta">
                                  <h4 className="mhn-permission-title">Mention notifications</h4>
                                  <p className="mhn-permission-subtitle">Get notified when someone mentions them</p>
                                </div>
                                {renderToggleSwitch('mention_notifications', 'Mention notifications', notificationPermissions.mentionNotifications, setNotificationPermissions)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}

                  {/* Content for Requests Tab */}
                  {activeMainTab === SupervisionMainTabEnum.REQUESTS && (
                    <div className="mhn-supervision-requests-stack">
                      {requestNotice && (
                        <div className={`mhn-notice-banner ${requestNotice.type === 'success' ? 'mhn-notice-success' : 'mhn-notice-error'}`}>
                          {requestNotice.message}
                        </div>
                      )}

                      {/* Pending Requests List */}
                      <div>


                        {isRequestsLoading ? (
                          <GuardianRequestSkeleton />
                        ) : livePendingRequests.length === 0 ? (
                          <NoDataFound
                            title="No Pending Approval Requests"
                            description="There are currently no pending minor approval requests."
                          />
                        ) : (
                          <div className="mhn-supervision-requests-grid">
                            {livePendingRequests.map((req: any, idx: number) => {
                              const reqId = req.id || `req_${idx}`;
                              const isApprovalItem = Boolean(req.isApprovalItem);

                              const child = req.child || req.minorCard || req.minor || {};
                              const requester = req.requester || req.minorCard || req.minor || {};

                              const displayName = isApprovalItem
                                ? (req.requester?.displayName || req.minorCard?.displayName || req.minor?.displayName || 'Connection Request')
                                : (child.displayName || req.displayName || req.name || 'Minor Athlete');

                              const rawAvatar = isApprovalItem
                                ? (req.requester?.avatarUrl || req.minorCard?.avatarUrl || req.minor?.avatarUrl)
                                : (child.avatarUrl || req.avatarUrl);

                              const avatarUrl = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');

                              const roleTag = isApprovalItem
                                ? (req.requester?.roleTag || req.minorCard?.roleTag || (req.requester?.primaryRole ? String(req.requester.primaryRole) : 'Parent'))
                                : (child.roleTag || (child.position ? `${child.position}${child.jerseyNumber ? ` • #${child.jerseyNumber}` : ''}` : child.primaryRole || child.profileType || 'PLAYER'));

                              const teamName = isApprovalItem
                                ? (req.requester?.teamName || req.minorCard?.teamName)
                                : (child.teamName || req.teamName);

                              const teamLogo = (isApprovalItem ? req.requester?.teamLogo : child.teamLogo)
                                ? resolveMediaUrl(isApprovalItem ? req.requester.teamLogo : child.teamLogo, '/HC.png')
                                : '/HC.png';

                              const location = isApprovalItem
                                ? (req.requester?.location || req.minorCard?.location || req.minor?.city || 'Austria, Europe')
                                : (child.location || req.location || child.city || 'Austria, Europe');

                              const code = req.code || req.devCode || req.inviteCode;

                              return (
                                <div
                                  key={reqId}
                                  className="mhn-supervision-req-card"
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    padding: '24px 20px 20px',
                                    borderRadius: '16px',
                                    background: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                    width: '100%',
                                    minWidth: 0,
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  {/* Centered Large Circular Avatar */}
                                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                                    <img
                                      src={avatarUrl}
                                      alt={displayName}
                                      style={{
                                        width: '72px',
                                        height: '72px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid #F1F5F9',
                                      }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                                      }}
                                    />
                                  </div>

                                  {/* Centered Name */}
                                  <h4
                                    title={displayName}
                                    style={{
                                      fontSize: '16px',
                                      fontWeight: 700,
                                      color: '#0F172A',
                                      margin: '0 0 4px 0',
                                      lineHeight: '1.3',
                                      width: '100%',
                                      maxWidth: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      wordBreak: 'break-all',
                                    }}
                                  >
                                    {displayName}
                                  </h4>

                                  {/* Centered Role Tag */}
                                  <p
                                    style={{
                                      fontSize: '13px',
                                      color: '#64748B',
                                      margin: '0 0 10px 0',
                                      fontWeight: 500,
                                      width: '100%',
                                      maxWidth: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {roleTag}
                                  </p>

                                  {/* Centered Team Pill */}
                                  {teamName && (
                                    <div
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: '#0B66C2',
                                        marginBottom: '6px',
                                        maxWidth: '100%',
                                      }}
                                    >
                                      <img
                                        src={teamLogo}
                                        alt="Team"
                                        style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamName}</span>
                                    </div>
                                  )}

                                  {/* Centered Location */}
                                  {location && (
                                    <div
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        color: '#64748B',
                                        marginBottom: '16px',
                                        maxWidth: '100%',
                                      }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" style={{ flexShrink: 0 }}>
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                      </svg>
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{location}</span>
                                    </div>
                                  )}

                                  {/* Action Type Badge for Approval Requests */}
                                  {isApprovalItem && req.action && (
                                    <div
                                      style={{
                                        marginBottom: '10px',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        backgroundColor: '#EFF6FF',
                                        color: '#0B66C2',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                      }}
                                    >
                                      {req.action === 'POST_MEDIA' || req.action === 'CREATE_POST' ? '🏒 Post Approval' :
                                       req.action === 'COMMENT_ON_POSTS' ? '💬 Comment Approval' :
                                       req.action === 'REACT_TO_POSTS' ? '❤️ Reaction Approval' :
                                       `🛡️ ${String(req.action).replace(/_/g, ' ')}`}
                                    </div>
                                  )}

                                  {/* Post Subject Content Preview Box */}
                                  {isApprovalItem && req.subject && (
                                    <div
                                      style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
                                        marginBottom: '14px',
                                        textAlign: 'left',
                                        fontSize: '12px',
                                        boxSizing: 'border-box',
                                      }}
                                    >
                                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        {req.subject.kind || 'Post'} {req.subject.audience ? `(${req.subject.audience})` : ''}
                                      </div>
                                      {req.subject.body && (
                                        <p style={{ margin: 0, color: '#1E293B', fontWeight: 500, lineHeight: '1.4', fontStyle: 'italic' }}>
                                          "{req.subject.body}"
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Action Buttons Row */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      width: '100%',
                                      marginTop: 'auto',
                                    }}
                                  >
                                    <Button
                                      type="button"
                                      style={{
                                        flex: 1,
                                        height: '36px',
                                        borderRadius: '8px',
                                        border: '1px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        color: '#334155',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                      }}
                                      disabled={requestActionLoading}
                                      onClick={() => {
                                        if (isApprovalItem) {
                                          handleDeclineApprovalItem(reqId);
                                        } else {
                                          handleDeclineCodeSubmit(code || reqId);
                                        }
                                      }}
                                    >
                                      {isApprovalItem ? 'Ignore' : 'Decline'}
                                    </Button>
                                    <Button
                                      type="button"
                                      style={{
                                        flex: 1,
                                        height: '36px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#0B66C2',
                                        color: '#FFFFFF',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                      }}
                                      disabled={requestActionLoading}
                                      onClick={() => {
                                        if (isApprovalItem) {
                                          handleApproveApprovalItem(reqId);
                                        } else {
                                          setApprovalModalConfig({
                                            isOpen: true,
                                            targetName: displayName,
                                            code: '',
                                          });
                                        }
                                      }}
                                    >
                                      {isApprovalItem ? 'Accept' : 'Approve'}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content for Logs Tab matching Figma Image 34 */}
                  {activeMainTab === SupervisionMainTabEnum.LOGS && (
                    <div className="mhn-supervision-logs-wrapper">
                      {/* Search Bar & Filter Header */}
                      <div className="mhn-logs-top-controls">
                        <div className="mhn-logs-search-box">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <Input
                            type="text"
                            placeholder="Search Logs"
                            className="mhn-logs-search-input"
                            value={logsSearchQuery}
                            onChange={(e) => setLogsSearchQuery(e.target.value)}
                          />
                        </div>

                        <Button className="mhn-logs-filter-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                          </svg>
                          <span>Filters</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </Button>
                      </div>

                      {/* Table Data Container */}
                      <div className="mhn-logs-table-container">
                        <table className="mhn-logs-table">
                          <thead>
                            <tr>
                              <th>
                                <div className="mhn-th-flex">
                                  DATE & TIME
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12l7 7 7-7" />
                                  </svg>
                                </div>
                              </th>
                              <th>
                                <div className="mhn-th-flex">
                                  ACTIVITY
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12l7 7 7-7" />
                                  </svg>
                                </div>
                              </th>
                              <th>
                                <div className="mhn-th-flex">
                                  INITIATED BY
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12l7 7 7-7" />
                                  </svg>
                                </div>
                              </th>
                              <th>
                                <div className="mhn-th-flex">
                                  STATUS
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12l7 7 7-7" />
                                  </svg>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(liveLogs.length > 0 ? liveLogs : [])
                              .filter((log) => {
                                if (!debouncedLogsSearchQuery.trim()) return true;
                                const q = debouncedLogsSearchQuery.toLowerCase();
                                return (
                                  (log.activity && log.activity.toLowerCase().includes(q)) ||
                                  (log.initiatedBy && log.initiatedBy.toLowerCase().includes(q)) ||
                                  (log.dateTime && log.dateTime.toLowerCase().includes(q))
                                );
                              })
                              .map((log) => (
                                <tr key={log.id}>
                                  <td className="mhn-td-date">{log.dateTime}</td>
                                  <td className="mhn-td-activity">{log.activity}</td>
                                  <td className="mhn-td-initiated">{log.initiatedBy}</td>
                                  <td className="mhn-td-action">
                                    <Button className="mhn-log-action-link">{log.actionText}</Button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Table Footer Pagination */}
                      <div className="mhn-logs-pagination-footer">
                        <span className="mhn-logs-count-info">1 - 5 of 5 items</span>
                        <div className="mhn-logs-pagination-buttons">
                          <Button className="mhn-page-btn" disabled>Previous</Button>
                          <Button className="mhn-page-btn">Next</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
      <ApprovalCodeModal
        isOpen={approvalModalConfig.isOpen}
        targetName={approvalModalConfig.targetName}
        initialCode={approvalModalConfig.code}
        loading={requestActionLoading}
        onClose={() => setApprovalModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={async (enteredCode) => {
          await handleApproveCodeSubmit(enteredCode);
          setApprovalModalConfig((prev) => ({ ...prev, isOpen: false }));
        }}
      />
      <ParentOnboardingModal
        isOpen={isAddPlayerModalOpen}
        isStandaloneModal={true}
        onClose={() => setIsAddPlayerModalOpen(false)}
        onComplete={handlePlayerAddComplete}
      />
    </div>
  );
};

export const SupervisionPage = withRoleGuard(SupervisionPageBase, [UserRole.PARENT]);
