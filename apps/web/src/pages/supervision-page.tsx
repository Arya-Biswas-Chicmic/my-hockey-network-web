import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/FormControls';
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
import { resolveMediaUrl } from '../utils/mediaUtils';
import { GUARDIAN_RELATION_OPTIONS, formatDobToIso, formatDobInput } from '../utils/guardianUtils';
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

  const [activeNavTab, setActiveNavTab] = useState('supervision');
  const [selectedWardId, setSelectedWardId] = useState(initialWardIdFromNav || '');
  const [activeMainTab, setActiveMainTab] = useState<'permissions' | 'requests' | 'logs'>('permissions');
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);

  // Interactive Flow View Mode for Add Button (+):
  // 'main' | 'choice' | 'create-details' | 'create-protect' | 'create-success' | 'link-existing' | 'link-sent'
  const [viewMode, setViewMode] = useState<
    'main' | 'choice' | 'create-details' | 'create-protect' | 'create-success' | 'link-existing' | 'link-sent'
  >('main');

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
    if (activeMainTab === 'requests') {
      loadPendingRequests();
    }
  }, [activeMainTab, selectedWardId]);

  const handleApproveApprovalItem = async (approvalId: string) => {
    setRequestActionLoading(true);
    setRequestNotice(null);
    try {
      await approveRequest(approvalId, { mode: 'INDEFINITE' });
      const successMsg = 'Request approved successfully!';
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
      const successMsg = 'Request declined.';
      setRequestNotice({ type: 'success', message: successMsg });
      showToast(successMsg, 'success');
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

  const [addedPlayerName, setAddedPlayerName] = useState('Noah');

  // Form State for "Link an existing player"
  const [linkChildEmail, setLinkChildEmail] = useState('');
  const [linkEmailError, setLinkEmailError] = useState<string | null>(null);

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
          const key = c.control || c.name;
          const val = c.value;
          if (key === 'VIEW_FEED' || key === 'view_feed' || key === 'viewFeed') setHomePermissions((p) => ({ ...p, viewFeed: Boolean(val) }));
          if (key === 'CREATE_POST' || key === 'create_posts' || key === 'createPosts') setHomePermissions((p) => ({ ...p, createPosts: Boolean(val) }));
          if (key === 'COMMENT_ON_POSTS' || key === 'comment_on_posts' || key === 'commentOnPosts') setHomePermissions((p) => ({ ...p, commentOnPosts: Boolean(val) }));
          if (key === 'REACT_TO_POSTS' || key === 'react_to_posts' || key === 'reactToPosts') setHomePermissions((p) => ({ ...p, reactToPosts: Boolean(val) }));
          if (key === 'SHARE_POSTS' || key === 'share_posts' || key === 'sharePosts') setHomePermissions((p) => ({ ...p, sharePosts: Boolean(val) }));

          if (key === 'FOLLOW_OTHERS' || key === 'follow_others' || key === 'followOthers') setNetworkPermissions((p) => ({ ...p, followOthers: Boolean(val) }));
          if (key === 'WHO_CAN_FOLLOW' || key === 'who_can_follow_them' || key === 'whoCanFollowThem') setNetworkPermissions((p) => ({ ...p, whoCanFollowThem: String(val) }));
          if (key === 'WHO_CAN_SEND_CONNECTION_REQUESTS' || key === 'who_can_send_requests' || key === 'whoCanSendRequests') setNetworkPermissions((p) => ({ ...p, whoCanSendRequests: String(val) }));
          if (key === 'ACCEPT_CONNECTIONS' || key === 'accept_requests' || key === 'acceptRequests') setNetworkPermissions((p) => ({ ...p, acceptRequests: Boolean(val) }));

          if (key === 'SEND_MESSAGES' || key === 'send_messages' || key === 'sendMessages') setMessagingPermissions((p) => ({ ...p, sendMessages: Boolean(val) }));
          if (key === 'RECEIVE_MESSAGES' || key === 'receive_messages' || key === 'receiveMessages') setMessagingPermissions((p) => ({ ...p, receiveMessages: Boolean(val) }));
          if (key === 'CREATE_GROUP_CHATS' || key === 'create_group_chats' || key === 'createGroupChats') setMessagingPermissions((p) => ({ ...p, createGroupChats: Boolean(val) }));
          if (key === 'WHO_CAN_MESSAGE_THEM' || key === 'who_can_message_them' || key === 'whoCanMessageThem') setMessagingPermissions((p) => ({ ...p, whoCanMessageThem: String(val) }));

          if (key === 'REQUIRE_APPROVAL_ADULT_CONTACT' || key === 'message_notifications' || key === 'messageNotifications') setNotificationPermissions((p) => ({ ...p, messageNotifications: Boolean(val) }));
          if (key === 'REQUIRE_APPROVAL_CONNECTIONS' || key === 'connection_notifications' || key === 'connectionNotifications') setNotificationPermissions((p) => ({ ...p, connectionNotifications: Boolean(val) }));
          if (key === 'REQUIRE_APPROVAL_TEAM_INVITES' || key === 'activity_notifications' || key === 'activityNotifications') setNotificationPermissions((p) => ({ ...p, activityNotifications: Boolean(val) }));
          if (key === 'REQUIRE_APPROVAL_MEDIA' || key === 'mention_notifications' || key === 'mentionNotifications') setNotificationPermissions((p) => ({ ...p, mentionNotifications: Boolean(val) }));
        });
      }
    } catch (err: any) {
      console.warn('Supervision controls fetch notice:', err);
    }
  };

  // Parallel simultaneous initial load on mount / when initialWardIdFromNav changes
  useEffect(() => {
    async function loadAllSupervisionData() {
      setApiLoading(true);
      setIsControlsLoading(true);
      try {
        const data = await getSupervisionData();
        const children = data?.children || (data as any)?.data?.children || [];
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
      } catch (err: any) {
        console.warn('Live supervision fetch notice:', err?.message || err);
        setWards([]);
        setSelectedWardId('');
      } finally {
        setApiLoading(false);
        setIsControlsLoading(false);
      }
    }
    loadAllSupervisionData();
  }, [initialWardIdFromNav]);

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

    setUpdatingControlKey(controlKey);
    setter((prev: any) => ({ ...prev, [controlKey]: newVal }));

    try {
      await updateSupervisionControls(selectedWardId, [{ control: backendControl, value: newVal }]);
      showToast(`${label} permission updated successfully!`, 'success');
    } catch (err: any) {
      setter((prev: any) => ({ ...prev, [controlKey]: currentVal }));
      showToast(err.message || `Failed to update ${label} permission.`, 'error');
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

  const sampleSupervisionRequests = [
    {
      id: 'req1',
      name: 'Connor McDavid',
      roleTag: 'C • #97',
      avatarUrl: '/connor.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
    {
      id: 'req2',
      name: 'Lucas Bennett',
      roleTag: 'Head Coach • U18 AAA',
      avatarUrl: '/lucas.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
    {
      id: 'req3',
      name: 'Columbus Blue Jackets',
      roleTag: 'Team',
      avatarUrl: '/columbus.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
    {
      id: 'req4',
      name: 'Connor McDavid',
      roleTag: 'C • #97',
      avatarUrl: '/connor.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
    {
      id: 'req5',
      name: 'Lucas Bennett',
      roleTag: 'Head Coach • U18 AAA',
      avatarUrl: '/lucas.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
    {
      id: 'req6',
      name: 'Columbus Blue Jackets',
      roleTag: 'Team',
      avatarUrl: '/columbus.png',
      teamName: 'HC Bloemendaal',
      teamLogo: '/kcBlue.png',
      location: 'Austria, Europe',
    },
  ];

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

      const childProfile = res?.child || (res as any)?.data?.profile;
      if (childProfile) {
        const newWardItem = {
          id: childProfile.id,
          name: childProfile.displayName || nameToUse,
          age: 12,
          avatar: resolveMediaUrl(childProfile.avatarUrl, '/userPlaceholder.png'),
        };
        setWards((prev) => [...prev, newWardItem]);
        setSelectedWardId(newWardItem.id);
      }
      showToast(`${nameToUse} has been added successfully!`, 'success');
      setViewMode('create-success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to create player.', 'error');
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

    setApiLoading(true);
    setIsControlsLoading(true);
    try {
      await sendGuardianInvite(linkChildEmail.trim());
      showToast('Guardian invitation sent successfully!', 'success');
      setViewMode('link-sent');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send invitation.', 'error');
    } finally {
      setApiLoading(false);
      setIsControlsLoading(false);
    }
  };

  const handlePlayerAddComplete = async () => {
    setIsAddPlayerModalOpen(false);
    showToast('Player updated successfully!', 'success');
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
                onClick={() => setViewMode('choice')}
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
                  <Button
                    key={ward.id}
                    onClick={() => {
                      setSelectedWardId(ward.id);
                      setViewMode('main');
                    }}
                    className={`mhn-supervision-ward-item ${selectedWardId === ward.id && viewMode === 'main' ? 'mhn-ward-active' : ''}`}
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
                  </Button>
                ))
              )}
            </div>
          </aside>

          {/* Right Main Content Area */}
          <section className="mhn-supervision-content-area">
            {/* STEP 1: Choice View ("How would you like to add them?") - Image 35 */}
            {viewMode === 'choice' && (
              <div className="mhn-flow-container">
                <h2 className="mhn-flow-title">
                  How would you like<br />to add them?
                </h2>
                <div className="mhn-flow-options-stack">
                  {/* Option 1: Create a new player profile */}
                  <Button
                    className="mhn-flow-card-option mhn-flow-option-active"
                    onClick={() => setViewMode('create-details')}
                  >
                    <div className="mhn-flow-option-icon-box mhn-icon-box-blue">
                      <img src='/add5.png' className='add5' />
                    </div>
                    <div className="mhn-flow-option-text">
                      <h4 className="mhn-flow-option-heading mhn-heading-blue">Create a new player profile</h4>
                      <p className="mhn-flow-option-sub">Set up a player profile for your child.</p>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B66C2" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Button>

                  {/* Option 2: Link an existing player */}
                  <Button
                    className="mhn-flow-card-option"
                    onClick={() => setViewMode('link-existing')}
                  >
                    <div className="mhn-flow-option-icon-box">
                      <img src='/link.png' className='add5' />
                    </div>
                    <div className="mhn-flow-option-text">
                      <h4 className="mhn-flow-option-heading">Link an existing player</h4>
                      <p className="mhn-flow-option-sub">Connect with a player who already has a My Hockey account.</p>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2A: Form 1 - Player Details (Image 36) */}
            {viewMode === 'create-details' && (
              <div className="mhn-flow-container mhn-flow-form-wrapper">
                <h2 className="mhn-flow-title">Player Details</h2>
                <p className="mhn-flow-subtitle">Tell us a little about your player.</p>

                <div className="mhn-form-fields-stack">
                  <div className="mhn-form-field-group">
                    <label className="mhn-form-field-label">Full Name</label>
                    <Input
                      type="text"
                      value={newPlayer.fullName}
                      onChange={(e) => setNewPlayer({ ...newPlayer, fullName: e.target.value })}
                      placeholder="enter your name"
                      className="mhn-form-input"
                    />
                  </div>

                  <div className="mhn-form-field-group">
                    <label className="mhn-form-field-label">DOB</label>
                    <div className="mhn-form-date-input-wrapper" style={{ position: 'relative' }}>
                      <Input
                        type="text"
                        value={newPlayer.dob}
                        onChange={(e) => setNewPlayer({ ...newPlayer, dob: formatDobInput(e.target.value) })}
                        maxLength={10}
                        placeholder="DD/MM/YYYY"
                        className="mhn-form-input"
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
                  </div>

                  <div className="mhn-form-field-group">
                    <label className="mhn-form-field-label">Relationship to player</label>
                    <Select
                      value={newPlayer.relationship}
                      onChange={(e) => setNewPlayer({ ...newPlayer, relationship: e.target.value })}
                      className="mhn-form-select"
                    >
                      {GUARDIAN_RELATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="mhn-form-field-group">
                    <label className="mhn-form-field-label">Email</label>
                    <Input
                      type="email"
                      value={newPlayer.email}
                      onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                      placeholder="admin@gmail.com"
                      className="mhn-form-input"
                    />
                  </div>
                </div>

                <div className="mhn-form-actions-stack">
                  <Button
                    className="mhn-btn-solid-blue"
                    onClick={() => setViewMode('create-protect')}
                  >
                    Continue
                  </Button>
                  <Button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode('choice')}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2A: Form 2 - Protect Profile (Image 37) */}
            {viewMode === 'create-protect' && (
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
                    className="mhn-btn-solid-blue"
                    onClick={handleCreatePlayerSubmit}
                    disabled={isCreatingPlayer}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isCreatingPlayer && <Spinner size="sm" color="#FFFFFF" />}
                    <span>{isCreatingPlayer ? 'Creating Profile...' : 'Create Player Profile'}</span>
                  </Button>
                  <Button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode('create-details')}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2A: Form 3 - Success Screen (Image 38) */}
            {viewMode === 'create-success' && (
              <div className="mhn-flow-container mhn-flow-success-box">
                <div className="mhn-success-circle-icon">
                  <img src='/CheckCircle.png' alt='check-circle' className='checkCircle' />
                </div>

                <h2 className="mhn-flow-title">{addedPlayerName} has been added</h2>
                <p className="mhn-flow-subtitle">You're now managing {addedPlayerName}'s hockey profile.</p>

                <div className="mhn-form-actions-stack mhn-form-actions-narrow">
                  <Button
                    className="mhn-btn-solid-blue"
                    onClick={() => {
                      setViewMode('main');
                      if (onNavigate) {
                        onNavigate('profile', { selectedWardId, childId: selectedWardId, childName: addedPlayerName });
                      }
                    }}
                  >
                    Go to {addedPlayerName}'s Profile
                  </Button>
                  <Button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode('choice')}
                  >
                    Add Another Player
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2B: Link An Existing Player Form (Image 39) */}
            {viewMode === 'link-existing' && (
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
                  >
                    Send Invitation
                  </Button>
                  <Button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode('choice')}
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
            {viewMode === 'link-sent' && (
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
                      setViewMode('main');
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* DEFAULT VIEW: Main Tabbed View (Permissions / Requests / Logs) */}
            {viewMode === 'main' && (
              <>
                {/* Top Sub-Tabs Navigation */}
                <div className="mhn-supervision-tabs-row">
                  <Button
                    onClick={() => setActiveMainTab('permissions')}
                    className={`mhn-supervision-tab-btn ${activeMainTab === 'permissions' ? 'mhn-tab-active' : ''}`}
                  >
                    Permissions
                  </Button>
                  <Button
                    onClick={() => setActiveMainTab('requests')}
                    className={`mhn-supervision-tab-btn ${activeMainTab === 'requests' ? 'mhn-tab-active' : ''}`}
                  >
                    Requests
                  </Button>
                  <Button
                    onClick={() => setActiveMainTab('logs')}
                    className={`mhn-supervision-tab-btn ${activeMainTab === 'logs' ? 'mhn-tab-active' : ''}`}
                  >
                    Logs
                  </Button>
                </div>

                <div className="mhn-supervision-tab-body">
                  {/* Content for Permissions Tab */}
                  {activeMainTab === 'permissions' && (
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
                              <Select
                                value={networkPermissions.whoCanFollowThem}
                                onChange={(e) => handleToggleControl('who_can_follow_them', 'Who can follow them', e.target.value, setNetworkPermissions)}
                                className="mhn-permission-select"
                                disabled={updatingControlKey === 'who_can_follow_them'}
                              >
                                <option value="Everyone">Everyone</option>
                                <option value="Connections Only">Connections Only</option>
                                <option value="Nobody">Nobody</option>
                              </Select>
                            </div>

                            {/* Who can send connection requests */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Who can send connection requests</h4>
                                <p className="mhn-permission-subtitle">Limits incoming connection requests</p>
                              </div>
                              <Select
                                value={networkPermissions.whoCanSendRequests}
                                onChange={(e) => handleToggleControl('who_can_send_requests', 'Who can send requests', e.target.value, setNetworkPermissions)}
                                className="mhn-permission-select"
                                disabled={updatingControlKey === 'who_can_send_requests'}
                              >
                                <option value="Everyone">Everyone</option>
                                <option value="Connections Only">Connections Only</option>
                                <option value="Nobody">Nobody</option>
                              </Select>
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
                              <Select
                                value={messagingPermissions.whoCanMessageThem}
                                onChange={(e) => handleToggleControl('who_can_message_them', 'Who can message them', e.target.value, setMessagingPermissions)}
                                className="mhn-permission-select"
                                disabled={updatingControlKey === 'who_can_message_them'}
                              >
                                <option value="Connections Only">Connections Only</option>
                                <option value="Everyone">Everyone</option>
                                <option value="Nobody">Nobody</option>
                              </Select>
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
                  {activeMainTab === 'requests' && (
                    <div className="mhn-supervision-requests-stack">
                      {requestNotice && (
                        <div className={`mhn-notice-banner ${requestNotice.type === 'success' ? 'mhn-notice-success' : 'mhn-notice-error'}`}>
                          {requestNotice.message}
                        </div>
                      )}

                      {/* Pending Requests List */}
                      <div>
                        <h3 className="mhn-supervision-section-subtitle">
                          Pending Minor Approval Requests ({livePendingRequests.length})
                        </h3>

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
                              const child = req.child || {};
                              const displayName = child.displayName || req.displayName || req.name || 'Minor Athlete';
                              const rawAvatar = child.avatarUrl || req.avatarUrl;
                              const avatarUrl = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');
                              const roleTag = child.roleTag || child.primaryRole || child.profileType || req.roleTag || 'PLAYER';
                              const teamName = child.teamName || req.teamName || null;
                              const teamLogo = child.teamLogo || req.teamLogo ? resolveMediaUrl(child.teamLogo || req.teamLogo, '/HC.png') : null;
                              const location = child.location || req.location || null;
                              const code = req.code || req.devCode || req.inviteCode;

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

                                  {teamName && (
                                    <div className="mhn-supervision-req-team-pill">
                                      {teamLogo && (
                                        <img
                                          src={teamLogo}
                                          alt="Team"
                                          className="mhn-supervision-req-team-logo"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      )}
                                      <span>{teamName}</span>
                                    </div>
                                  )}

                                  {location && (
                                    <div className="mhn-supervision-req-location">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                      </svg>
                                      <span>{location}</span>
                                    </div>
                                  )}

                                  <div className="mhn-supervision-req-actions">
                                    <Button
                                      type="button"
                                      className="mhn-supervision-btn-ignore"
                                      disabled={requestActionLoading}
                                      onClick={() => {
                                        if (req.isApprovalItem) {
                                          handleDeclineApprovalItem(reqId);
                                        } else {
                                          handleDeclineCodeSubmit(code || reqId);
                                        }
                                      }}
                                    >
                                      Decline
                                    </Button>
                                    <Button
                                      type="button"
                                      className="mhn-supervision-btn-accept"
                                      disabled={requestActionLoading}
                                      onClick={() => {
                                        if (req.isApprovalItem) {
                                          handleApproveApprovalItem(reqId);
                                        } else {
                                          setApprovalModalConfig({
                                            isOpen: true,
                                            targetName: displayName,
                                            code: code || '',
                                          });
                                        }
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
                    </div>
                  )}

                  {/* Content for Logs Tab matching Figma Image 34 */}
                  {activeMainTab === 'logs' && (
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
                            {(liveLogs.length > 0 ? liveLogs : sampleLogs)
                              .filter((log) => {
                                if (!logsSearchQuery.trim()) return true;
                                const q = logsSearchQuery.toLowerCase();
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
