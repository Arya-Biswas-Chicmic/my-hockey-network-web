import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import {
  getSupervisionData,
  createManagedChild,
  sendGuardianInvite,
  getApprovals,
  approveRequest,
  declineRequest,
} from '@my-hockey-network/core';

interface SupervisionPageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const SupervisionPage: React.FC<SupervisionPageProps> = ({ onNavigate, onLogout }) => {
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

  // Load live supervision wards on mount
  useEffect(() => {
    async function loadLiveSupervision() {
      try {
        setApiLoading(true);
        const data = await getSupervisionData();
        if (data && data.children && data.children.length > 0) {
          const mapped = data.children.map((c: any) => ({
            id: c.id,
            name: c.displayName || c.firstName || 'Minor Player',
            age: c.age || 12,
            avatar: c.avatarUrl || '/connor.png',
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

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleCreatePlayerSubmit = () => {
    const nameToUse = newPlayer.fullName.trim() || 'Noah';
    setAddedPlayerName(nameToUse);

    // Add new ward to sidebar list
    const newWardItem = {
      id: `w_${Date.now()}`,
      name: nameToUse,
      age: 12,
      avatar: '/connor.png',
    };
    setWards([...wards, newWardItem]);
    setSelectedWardId(newWardItem.id);
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
              <button
                className="mhn-supervision-add-btn"
                onClick={() => setViewMode('choice')}
                title="Add Minor Account"
              >
                <img src='/add4.png' className='add4' />
              </button>
            </div>

            <div className="mhn-supervision-wards-list">
              {wards.map((ward) => (
                <button
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
                </button>
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
                  <button
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
                  </button>

                  {/* Option 2: Link an existing player */}
                  <button
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
                  </button>
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
                    <input
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
                      <input
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
                    <select
                      value={newPlayer.relationship}
                      onChange={(e) => setNewPlayer({ ...newPlayer, relationship: e.target.value })}
                      className="mhn-form-select"
                    >
                      <option value="Select">Select</option>
                      <option value="Parent">Parent</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Coach">Coach</option>
                    </select>
                  </div>

                  <div className="mhn-form-field-group">
                    <label className="mhn-form-field-label">Email</label>
                    <input
                      type="email"
                      value={newPlayer.email}
                      onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                      placeholder="admin@gmail.com"
                      className="mhn-form-input"
                    />
                  </div>
                </div>

                <div className="mhn-form-actions-stack">
                  <button
                    className="mhn-btn-solid-blue"
                    onClick={() => setViewMode('create-protect')}
                  >
                    Continue
                  </button>
                  <button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode('choice')}
                  >
                    Back
                  </button>
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
                      <input
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
                      <input
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
                      <button
                        type="button"
                        onClick={() => setNewPlayer(p => ({ ...p, adultRequests: !p.adultRequests }))}
                        className={`mhn-toggle-switch ${newPlayer.adultRequests ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      >
                        <div className="mhn-toggle-handle" />
                      </button>
                    </div>

                    <div className="mhn-protect-toggle-row">
                      <div className="mhn-protect-toggle-text">
                        <h4 className="mhn-protect-toggle-heading">Connections</h4>
                        <p className="mhn-protect-toggle-sub">Require my approval</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewPlayer(p => ({ ...p, connections: !p.connections }))}
                        className={`mhn-toggle-switch ${newPlayer.connections ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      >
                        <div className="mhn-toggle-handle" />
                      </button>
                    </div>

                    <div className="mhn-protect-toggle-row">
                      <div className="mhn-protect-toggle-text">
                        <h4 className="mhn-protect-toggle-heading">Team invitations</h4>
                        <p className="mhn-protect-toggle-sub">Require my approval</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewPlayer(p => ({ ...p, teamInvitations: !p.teamInvitations }))}
                        className={`mhn-toggle-switch ${newPlayer.teamInvitations ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      >
                        <div className="mhn-toggle-handle" />
                      </button>
                    </div>

                    <div className="mhn-protect-toggle-row">
                      <div className="mhn-protect-toggle-text">
                        <h4 className="mhn-protect-toggle-heading">Media visibility</h4>
                        <p className="mhn-protect-toggle-sub">Require my approval</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewPlayer(p => ({ ...p, mediaVisibility: !p.mediaVisibility }))}
                        className={`mhn-toggle-switch ${newPlayer.mediaVisibility ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                      >
                        <div className="mhn-toggle-handle" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mhn-form-actions-stack">
                  <button
                    className="mhn-btn-solid-blue"
                    onClick={handleCreatePlayerSubmit}
                  >
                    Create Player Profile
                  </button>
                  <button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode('create-details')}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2A: Form 3 - Success Screen (Image 38) */}
            {viewMode === 'create-success' && (
              <div className="mhn-flow-container mhn-flow-success-box">
                <div className="mhn-success-circle-icon">
                <img src='/CheckCircle.png' alt='check-circle' className='checkCircle'/>
                </div>

                <h2 className="mhn-flow-title">{addedPlayerName} has been added</h2>
                <p className="mhn-flow-subtitle">You're now managing {addedPlayerName}'s hockey profile.</p>

                <div className="mhn-form-actions-stack" style={{ maxWidth: '320px', margin: '24px auto 0 auto' }}>
                  <button
                    className="mhn-btn-solid-blue"
                    onClick={() => setViewMode('main')}
                  >
                    Go to {addedPlayerName}'s Profile
                  </button>
                  <button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode('choice')}
                  >
                    Add Another Player
                  </button>
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
                    <input
                      type="email"
                      value={linkChildEmail}
                      onChange={(e) => {
                        setLinkChildEmail(e.target.value);
                        if (linkEmailError) setLinkEmailError(null);
                      }}
                      placeholder="email@example.com"
                      className={`mhn-form-input ${linkEmailError ? 'mhn-input-error' : ''}`}
                      style={linkEmailError ? { borderColor: '#EF4444', backgroundColor: '#FEF2F2' } : {}}
                    />
                    {linkEmailError && (
                      <div style={{ color: '#DC2626', fontSize: '13px', marginTop: '6px', fontWeight: 500 }}>
                        {linkEmailError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mhn-form-actions-stack">
                  <button
                    className="mhn-btn-solid-blue"
                    onClick={handleSendLinkInvitation}
                  >
                    Send Invitation
                  </button>
                  <button
                    className="mhn-btn-outline"
                    onClick={() => setViewMode('choice')}
                  >
                    Back
                  </button>
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
                 <img alt='request-sent' src='/emailSent.png'/>
                </div>

                <h2 className="mhn-flow-title" style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 12px 0', color: '#0C1014' }}>Request Sent!</h2>
                <p className="mhn-flow-subtitle" style={{ maxWidth: '440px', margin: '0 auto 32px auto', fontSize: '15px', color: '#5E6670', lineHeight: '1.6' }}>
                  We've emailed your child. Once they approve, you'll have full access to their MyHockey Network. You can explore some public content in the meantime.
                </p>

                <div style={{ maxWidth: '340px', width: '100%', margin: '0 auto' }}>
                  <button
                    className="mhn-btn-solid-blue"
                    onClick={() => {
                      setLinkChildEmail('');
                      setViewMode('main');
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* DEFAULT VIEW: Main Tabbed View (Permissions / Requests / Logs) */}
            {viewMode === 'main' && (
              <>
                {/* Top Sub-Tabs Navigation */}
                <div className="mhn-supervision-tabs-row">
                  <button
                    onClick={() => setActiveMainTab('permissions')}
                    className={`mhn-supervision-tab-btn ${activeMainTab === 'permissions' ? 'mhn-tab-active' : ''}`}
                  >
                    Permissions
                  </button>
                  <button
                    onClick={() => setActiveMainTab('requests')}
                    className={`mhn-supervision-tab-btn ${activeMainTab === 'requests' ? 'mhn-tab-active' : ''}`}
                  >
                    Requests
                  </button>
                  <button
                    onClick={() => setActiveMainTab('logs')}
                    className={`mhn-supervision-tab-btn ${activeMainTab === 'logs' ? 'mhn-tab-active' : ''}`}
                  >
                    Logs
                  </button>
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
                              <button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, viewFeed: !p.viewFeed }))}
                                className={`mhn-toggle-switch ${homePermissions.viewFeed ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Create posts */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Create posts</h4>
                                <p className="mhn-permission-subtitle">Can publish posts to their network</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, createPosts: !p.createPosts }))}
                                className={`mhn-toggle-switch ${homePermissions.createPosts ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Comment on posts */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Comment on posts</h4>
                                <p className="mhn-permission-subtitle">Can leave comments on others' posts</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, commentOnPosts: !p.commentOnPosts }))}
                                className={`mhn-toggle-switch ${homePermissions.commentOnPosts ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* React to posts */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">React to posts</h4>
                                <p className="mhn-permission-subtitle">Can like, celebrate, or react to content</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, reactToPosts: !p.reactToPosts }))}
                                className={`mhn-toggle-switch ${homePermissions.reactToPosts ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Share posts */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Share posts</h4>
                                <p className="mhn-permission-subtitle">Can reshare content to their feed</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setHomePermissions(p => ({ ...p, sharePosts: !p.sharePosts }))}
                                className={`mhn-toggle-switch ${homePermissions.sharePosts ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
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
                              <button
                                type="button"
                                onClick={() => setNetworkPermissions(p => ({ ...p, followOthers: !p.followOthers }))}
                                className={`mhn-toggle-switch ${networkPermissions.followOthers ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Who can follow them */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Who can follow them</h4>
                                <p className="mhn-permission-subtitle">Controls who can subscribe to their updates</p>
                              </div>
                              <select
                                value={networkPermissions.whoCanFollowThem}
                                onChange={(e) => setNetworkPermissions(p => ({ ...p, whoCanFollowThem: e.target.value }))}
                                className="mhn-permission-select"
                              >
                                <option value="Everyone">Everyone</option>
                                <option value="Connections Only">Connections Only</option>
                                <option value="Nobody">Nobody</option>
                              </select>
                            </div>

                            {/* Who can send connection requests */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Who can send connection requests</h4>
                                <p className="mhn-permission-subtitle">Limits incoming connection requests</p>
                              </div>
                              <select
                                value={networkPermissions.whoCanSendRequests}
                                onChange={(e) => setNetworkPermissions(p => ({ ...p, whoCanSendRequests: e.target.value }))}
                                className="mhn-permission-select"
                              >
                                <option value="Everyone">Everyone</option>
                                <option value="Connections Only">Connections Only</option>
                                <option value="Nobody">Nobody</option>
                              </select>
                            </div>

                            {/* Accept connection requests */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Accept connection requests</h4>
                                <p className="mhn-permission-subtitle">Can accept incoming requests from others</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNetworkPermissions(p => ({ ...p, acceptRequests: !p.acceptRequests }))}
                                className={`mhn-toggle-switch ${networkPermissions.acceptRequests ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
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
                              <button
                                type="button"
                                onClick={() => setMessagingPermissions(p => ({ ...p, sendMessages: !p.sendMessages }))}
                                className={`mhn-toggle-switch ${messagingPermissions.sendMessages ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Receive messages */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Receive messages</h4>
                                <p className="mhn-permission-subtitle">Others can send them messages</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setMessagingPermissions(p => ({ ...p, receiveMessages: !p.receiveMessages }))}
                                className={`mhn-toggle-switch ${messagingPermissions.receiveMessages ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Create group chats */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Create group chats</h4>
                                <p className="mhn-permission-subtitle">Can start group conversations</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setMessagingPermissions(p => ({ ...p, createGroupChats: !p.createGroupChats }))}
                                className={`mhn-toggle-switch ${messagingPermissions.createGroupChats ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Who can message them */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Who can message them</h4>
                                <p className="mhn-permission-subtitle">Controls who can start a conversation</p>
                              </div>
                              <select
                                value={messagingPermissions.whoCanMessageThem}
                                onChange={(e) => setMessagingPermissions(p => ({ ...p, whoCanMessageThem: e.target.value }))}
                                className="mhn-permission-select"
                              >
                                <option value="Connections Only">Connections Only</option>
                                <option value="Everyone">Everyone</option>
                                <option value="Nobody">Nobody</option>
                              </select>
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
                              <button
                                type="button"
                                onClick={() => setNotificationPermissions(p => ({ ...p, messageNotifications: !p.messageNotifications }))}
                                className={`mhn-toggle-switch ${notificationPermissions.messageNotifications ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Connection request notifications */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Connection request notifications</h4>
                                <p className="mhn-permission-subtitle">Get notified about incoming requests</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotificationPermissions(p => ({ ...p, connectionNotifications: !p.connectionNotifications }))}
                                className={`mhn-toggle-switch ${notificationPermissions.connectionNotifications ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Activity notifications */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Activity notifications</h4>
                                <p className="mhn-permission-subtitle">Reactions, comments on their posts</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotificationPermissions(p => ({ ...p, activityNotifications: !p.activityNotifications }))}
                                className={`mhn-toggle-switch ${notificationPermissions.activityNotifications ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>

                            {/* Mention notifications */}
                            <div className="mhn-permission-row">
                              <div className="mhn-permission-meta">
                                <h4 className="mhn-permission-title">Mention notifications</h4>
                                <p className="mhn-permission-subtitle">Get notified when someone mentions them</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotificationPermissions(p => ({ ...p, mentionNotifications: !p.mentionNotifications }))}
                                className={`mhn-toggle-switch ${notificationPermissions.mentionNotifications ? 'mhn-toggle-on' : 'mhn-toggle-off'}`}
                              >
                                <div className="mhn-toggle-handle" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content for Requests Tab matching Figma Image 33 */}
                  {activeMainTab === 'requests' && (
                    <div className="mhn-supervision-requests-grid">
                      {sampleSupervisionRequests.map((req) => (
                        <div key={req.id} className="mhn-supervision-req-card">
                          <div className="mhn-supervision-req-avatar-wrapper">
                            <img
                              src={req.avatarUrl}
                              alt={req.name}
                              className="mhn-supervision-req-avatar"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                              }}
                            />
                          </div>
                          <h4 className="mhn-supervision-req-name">{req.name}</h4>
                          <p className="mhn-supervision-req-role">{req.roleTag}</p>

                          <div className="mhn-supervision-req-team-pill">
                            <img
                              src={req.teamLogo}
                              alt={req.teamName}
                              className="mhn-supervision-req-team-logo"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/HC.png';
                              }}
                            />
                            <span>{req.teamName}</span>
                          </div>

                          <div className="mhn-supervision-req-location">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{req.location}</span>
                          </div>

                          <div className="mhn-supervision-req-actions">
                            <button className="mhn-supervision-btn-ignore">Ignore</button>
                            <button className="mhn-supervision-btn-accept">Accept</button>
                          </div>
                        </div>
                      ))}
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
                          <input
                            type="text"
                            placeholder="Search Logs"
                            className="mhn-logs-search-input"
                          />
                        </div>

                        <button className="mhn-logs-filter-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                          </svg>
                          <span>Filters</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
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
                            {sampleLogs.map((log) => (
                              <tr key={log.id}>
                                <td className="mhn-td-date">{log.dateTime}</td>
                                <td className="mhn-td-activity">{log.activity}</td>
                                <td className="mhn-td-initiated">{log.initiatedBy}</td>
                                <td className="mhn-td-action">
                                  <button className="mhn-log-action-link">{log.actionText}</button>
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
                          <button className="mhn-page-btn" disabled>Previous</button>
                          <button className="mhn-page-btn">Next</button>
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
    </div>
  );
};
