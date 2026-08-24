import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/FormControls';
import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { NoDataFound } from '../components/common/no-data-found';
import { withRoleGuard } from '../hocs/with-role-guard';
import { UserRole } from '../enums/role';
import { GuardianRequestSkeleton } from '../components/supervision/guardian-request-skeleton';
import { ApprovalCodeModal } from '../components/supervision/ApprovalCodeModal';
import { useAuth } from '../hooks/use-auth';
import { resolveMediaUrl } from '../utils/mediaUtils';
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
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

const SupervisionPageBase: React.FC<SupervisionPageProps> = ({ onNavigate, onLogout }) => {
  const { showToast } = useAuth();
  const [activeNavTab, setActiveNavTab] = useState('supervision');
  const [selectedWardId, setSelectedWardId] = useState('w1'); // 'w1' = Steve (14), 'w2' = David (10)
  const [activeMainTab, setActiveMainTab] = useState<'permissions' | 'requests' | 'logs'>('permissions');

  // Interactive Flow View Mode for Add Button (+):
  // 'main' | 'choice' | 'create-details' | 'create-protect' | 'create-success' | 'link-existing' | 'link-sent'
  const [viewMode, setViewMode] = useState<
    'main' | 'choice' | 'create-details' | 'create-protect' | 'create-success' | 'link-existing' | 'link-sent'
  >('main');

  // Supervised Wards list (Dynamic)
  const [wards, setWards] = useState([
    { id: 'w1', name: 'Steve', age: 14, avatar: '/jack.png' },
    { id: 'w2', name: 'David', age: 10, avatar: '/lucas.png' },
  ]);

  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Load live pending requests when tab is opened
  useEffect(() => {
    async function loadPendingRequests() {
      try {
        setIsRequestsLoading(true);
        const res = await getPendingGuardianRequests();
        const items = res?.items || (res as any)?.data?.items || [];
        if (Array.isArray(items)) {
          setLivePendingRequests(items);
        }
      } catch (err: any) {
        console.warn('Pending requests fetch notice:', err);
      } finally {
        setIsRequestsLoading(false);
      }
    }
    if (activeMainTab === 'requests') {
      loadPendingRequests();
    }
  }, [activeMainTab]);

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
      if (supData?.children && supData.children.length > 0) {
        const mapped = supData.children.map((c: any) => ({
          id: c.id,
          name: c.displayName || c.firstName || 'Minor Player',
          age: c.age || 12,
          avatar: resolveMediaUrl(c.avatarUrl, '/userPlaceholder.png'),
        }));
        setWards(mapped);
      }

      const reqRes = await getPendingGuardianRequests();
      setLivePendingRequests(reqRes?.items || (reqRes as any)?.data?.items || []);
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
      const reqRes = await getPendingGuardianRequests();
      setLivePendingRequests(reqRes?.items || (reqRes as any)?.data?.items || []);
    } catch (err: any) {
      setRequestNotice({ type: 'error', message: err.message || 'Failed to decline request.' });
    } finally {
      setRequestActionLoading(false);
    }
  };

  // Load live supervision wards on mount
  useEffect(() => {
    async function loadLiveSupervision() {
      try {
        setApiLoading(true);
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
          setSelectedWardId(mapped[0].id);
        }
      } catch (err: any) {
        console.warn('Live supervision fetch notice:', err.message || err);
      } finally {
        setApiLoading(false);
      }
    }
    loadLiveSupervision();
  }, []);

  // Form States for "Create a new player profile"
  const [newPlayer, setNewPlayer] = useState({
    fullName: '',
    dob: '',
    relationship: 'Parent',
    email: '',
    visibility: 'private' as 'private' | 'network',
    adultRequests: true,
    connections: true,
    teamInvitations: true,
    mediaVisibility: true,
  });

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

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePlayerSubmit = async () => {
    const nameToUse = newPlayer.fullName.trim() || 'Noah';
    setAddedPlayerName(nameToUse);

    const nameParts = nameToUse.split(' ');
    const firstName = nameParts[0] || 'Minor';
    const lastName = nameParts.slice(1).join(' ') || 'Player';

    try {
      const res = await createManagedChild({
        displayName: nameToUse,
        firstName,
        lastName,
        dateOfBirth: newPlayer.dob || '2015-05-15',
        guardianRelation: (newPlayer.relationship.toUpperCase() as any) || 'FATHER',
      });

      const childProfile = res?.child || (res as any)?.data?.profile;
      if (childProfile) {
        const newWardItem = {
          id: childProfile.id,
          name: childProfile.displayName || nameToUse,
          age: 12,
          avatar: childProfile.avatarUrl || '/connor.png',
        };
        setWards((prev) => [...prev, newWardItem]);
        setSelectedWardId(newWardItem.id);
      }
    } catch (err: any) {
      console.warn('❌ [SupervisionPage] createManagedChild notice:', err?.message || err);
    }

    setViewMode('create-success');
  };

  const handleSendLinkInvitation = () => {
    setViewMode('link-sent');
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
              {wards.map((ward) => (
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
              ))}
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
                    <div className="mhn-form-date-input-wrapper">
                      <Input
                        type="text"
                        value={newPlayer.dob}
                        onChange={(e) => setNewPlayer({ ...newPlayer, dob: e.target.value })}
                        placeholder="DD/MM/YYYY"
                        className="mhn-form-input"
                      />
                      <svg className="mhn-calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>

                  <div className="mhn-form-field-group">
                    <label className="mhn-form-field-label">Relationship to player</label>
                    <Select
                      value={newPlayer.relationship}
                      onChange={(e) => setNewPlayer({ ...newPlayer, relationship: e.target.value })}
                      className="mhn-form-select"
                    >
                      <option value="Select">Select</option>
                      <option value="Parent">Parent</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Coach">Coach</option>
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
                  >
                    Create Player Profile
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
                    onClick={() => setViewMode('main')}
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
                              <Button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, viewFeed: !p.viewFeed }))}
                                className={`mhn-toggle-switch ${homePermissions.viewFeed ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Create posts */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Create posts</h4>
                                <p className="mhn-permission-subtitle">Can publish posts to their network</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, createPosts: !p.createPosts }))}
                                className={`mhn-toggle-switch ${homePermissions.createPosts ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Comment on posts */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Comment on posts</h4>
                                <p className="mhn-permission-subtitle">Can leave comments on others' posts</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, commentOnPosts: !p.commentOnPosts }))}
                                className={`mhn-toggle-switch ${homePermissions.commentOnPosts ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* React to posts */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">React to posts</h4>
                                <p className="mhn-permission-subtitle">Can like, celebrate, or react to content</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, reactToPosts: !p.reactToPosts }))}
                                className={`mhn-toggle-switch ${homePermissions.reactToPosts ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Share posts */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Share posts</h4>
                                <p className="mhn-permission-subtitle">Can reshare content to their feed</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, sharePosts: !p.sharePosts }))}
                                className={`mhn-toggle-switch ${homePermissions.sharePosts ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
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
                              <Button
                                type="button"
                                onClick={() => setNetworkPermissions(p => ({ ...p, followOthers: !p.followOthers }))}
                                className={`mhn-toggle-switch ${networkPermissions.followOthers ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Who can follow them */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Who can follow them</h4>
                                <p className="mhn-permission-subtitle">Controls who can subscribe to their updates</p>
                              </div>
                              <Select
                                value={networkPermissions.whoCanFollowThem}
                                onChange={(e) => setNetworkPermissions(p => ({ ...p, whoCanFollowThem: e.target.value }))}
                                className="mhn-permission-select"
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
                                onChange={(e) => setNetworkPermissions(p => ({ ...p, whoCanSendRequests: e.target.value }))}
                                className="mhn-permission-select"
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
                              <Button
                                type="button"
                                onClick={() => setNetworkPermissions(p => ({ ...p, acceptRequests: !p.acceptRequests }))}
                                className={`mhn-toggle-switch ${networkPermissions.acceptRequests ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
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
                              <Button
                                type="button"
                                onClick={() => setMessagingPermissions(p => ({ ...p, sendMessages: !p.sendMessages }))}
                                className={`mhn-toggle-switch ${messagingPermissions.sendMessages ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Receive messages */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Receive messages</h4>
                                <p className="mhn-permission-subtitle">Others can send them messages</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setMessagingPermissions(p => ({ ...p, receiveMessages: !p.receiveMessages }))}
                                className={`mhn-toggle-switch ${messagingPermissions.receiveMessages ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Create group chats */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Create group chats</h4>
                                <p className="mhn-permission-subtitle">Can start group conversations</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setMessagingPermissions(p => ({ ...p, createGroupChats: !p.createGroupChats }))}
                                className={`mhn-toggle-switch ${messagingPermissions.createGroupChats ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Who can message them */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Who can message them</h4>
                                <p className="mhn-permission-subtitle">Controls who can start a conversation</p>
                              </div>
                              <Select
                                value={messagingPermissions.whoCanMessageThem}
                                onChange={(e) => setMessagingPermissions(p => ({ ...p, whoCanMessageThem: e.target.value }))}
                                className="mhn-permission-select"
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
                              <Button
                                type="button"
                                onClick={() => setNotificationPermissions(p => ({ ...p, messageNotifications: !p.messageNotifications }))}
                                className={`mhn-toggle-switch ${notificationPermissions.messageNotifications ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Connection request notifications */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Connection request notifications</h4>
                                <p className="mhn-permission-subtitle">Get notified about incoming requests</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setNotificationPermissions(p => ({ ...p, connectionNotifications: !p.connectionNotifications }))}
                                className={`mhn-toggle-switch ${notificationPermissions.connectionNotifications ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Activity notifications */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Activity notifications</h4>
                                <p className="mhn-permission-subtitle">Reactions, comments on their posts</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setNotificationPermissions(p => ({ ...p, activityNotifications: !p.activityNotifications }))}
                                className={`mhn-toggle-switch ${notificationPermissions.activityNotifications ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>

                            {/* Mention notifications */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Mention notifications</h4>
                                <p className="mhn-permission-subtitle">Get notified when someone mentions them</p>
                              </div>
                              <Button
                                type="button"
                                onClick={() => setNotificationPermissions(p => ({ ...p, mentionNotifications: !p.mentionNotifications }))}
                                className={`mhn-toggle-switch ${notificationPermissions.mentionNotifications ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
                                      onClick={() => handleDeclineCodeSubmit(code || reqId)}
                                    >
                                      Decline
                                    </Button>
                                    <Button
                                      type="button"
                                      className="mhn-supervision-btn-accept"
                                      disabled={requestActionLoading}
                                      onClick={() => {
                                        setApprovalModalConfig({
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
                            {(liveLogs.length > 0 ? liveLogs : sampleLogs).map((log) => (
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
    </div>
  );
};

export const SupervisionPage = withRoleGuard(SupervisionPageBase, [UserRole.PARENT]);
