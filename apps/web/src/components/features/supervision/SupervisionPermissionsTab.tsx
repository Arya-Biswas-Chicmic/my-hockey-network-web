'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import NextImage from 'next/image';
import { ChevronDown, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Dropdown } from '@/components/common/FormControls';
import { PermissionSkeletonLoader } from '@/components/supervision/permission-skeleton-loader';
import type { PermissionState } from '@/hooks/use-supervision-permissions';

interface PermissionRowProps {
  title: string;
  subtitle: string;
  controlKey: string;
  isOn: boolean;
  isUpdating: boolean;
  onToggle: (controlKey: string, currentVal: boolean) => void;
}

function PermissionToggleRow({ title, subtitle, controlKey, isOn, isUpdating, onToggle }: Readonly<PermissionRowProps>) {
  return (
    <div className="mhn-permission-row">
      <div className="mhn-permission-meta">
        <h4 className="mhn-permission-title">{title}</h4>
        <p className="mhn-permission-subtitle">{subtitle}</p>
      </div>
      <Button
        type="button"
        onClick={() => onToggle(controlKey, isOn)}
        disabled={isUpdating}
        className={`mhn-toggle-switch ${isOn ? 'mhn-toggle-on' : 'mhn-toggle-off'} ${isUpdating ? 'mhn-updating-state' : ''}`}
      >
        {isUpdating ? <LoaderCircle size={14} className="mhn-spin-auto" aria-hidden="true" /> : <div className="mhn-toggle-handle" />}
      </Button>
    </div>
  );
}

export interface SupervisionPermissionsTabProps {
  isLoading: boolean;
  homePermissions: PermissionState;
  networkPermissions: PermissionState;
  messagingPermissions: PermissionState;
  notificationPermissions: PermissionState;
  updatingControlKey: string | null;
  onToggle: <T extends PermissionState>(controlKey: string, currentVal: boolean | string, setter: Dispatch<SetStateAction<T>>) => void;
  setHomePermissions: Dispatch<SetStateAction<PermissionState>>;
  setNetworkPermissions: Dispatch<SetStateAction<PermissionState>>;
  setMessagingPermissions: Dispatch<SetStateAction<PermissionState>>;
  setNotificationPermissions: Dispatch<SetStateAction<PermissionState>>;
}

/**
 * Supervision > Permissions tab: the four category accordions (Home,
 * Network, Messaging, Notifications) with their toggle/dropdown controls.
 * Extracted from `screens/supervision-page.tsx`; permission state and the
 * update API call live in `hooks/use-supervision-permissions.ts`.
 */
export function SupervisionPermissionsTab({
  isLoading,
  homePermissions,
  networkPermissions,
  messagingPermissions,
  notificationPermissions,
  updatingControlKey,
  onToggle,
  setHomePermissions,
  setNetworkPermissions,
  setMessagingPermissions,
  setNotificationPermissions,
}: Readonly<SupervisionPermissionsTabProps>) {
  const [expandedCategories, setExpandedCategories] = useState({
    home: true,
    network: true,
    messaging: true,
    notifications: true,
  });

  const toggleCategory = (cat: keyof typeof expandedCategories) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (isLoading) return <PermissionSkeletonLoader />;

  return (
    <div className="mhn-supervision-permissions-stack">
      {/* 1. Home Section Accordion */}
      <div className={`mhn-supervision-accordion ${expandedCategories.home ? 'mhn-accordion-expanded' : ''}`}>
        <div className="mhn-accordion-header" onClick={() => toggleCategory('home')}>
          <div className="mhn-accordion-title-left">
            <NextImage src="/home.webp" alt="" width={32} height={32} className="home" />
            <span className="superTitle">Home</span>
          </div>
          <ChevronDown className={`mhn-accordion-chevron ${expandedCategories.home ? 'mhn-chevron-up' : ''}`} size={16} aria-hidden="true" />
        </div>

        {expandedCategories.home && (
          <div className="mhn-accordion-body">
            <PermissionToggleRow title="View feed" subtitle="Can see posts from their network" controlKey="view_feed" isOn={Boolean(homePermissions.viewFeed)} isUpdating={updatingControlKey === 'view_feed'} onToggle={(k, v) => onToggle(k, v, setHomePermissions)} />
            <PermissionToggleRow title="Create posts" subtitle="Can publish posts to their network" controlKey="create_posts" isOn={Boolean(homePermissions.createPosts)} isUpdating={updatingControlKey === 'create_posts'} onToggle={(k, v) => onToggle(k, v, setHomePermissions)} />
            <PermissionToggleRow title="Comment on posts" subtitle="Can leave comments on others' posts" controlKey="comment_on_posts" isOn={Boolean(homePermissions.commentOnPosts)} isUpdating={updatingControlKey === 'comment_on_posts'} onToggle={(k, v) => onToggle(k, v, setHomePermissions)} />
            <PermissionToggleRow title="React to posts" subtitle="Can like, celebrate, or react to content" controlKey="react_to_posts" isOn={Boolean(homePermissions.reactToPosts)} isUpdating={updatingControlKey === 'react_to_posts'} onToggle={(k, v) => onToggle(k, v, setHomePermissions)} />
            <PermissionToggleRow title="Share posts" subtitle="Can reshare content to their feed" controlKey="share_posts" isOn={Boolean(homePermissions.sharePosts)} isUpdating={updatingControlKey === 'share_posts'} onToggle={(k, v) => onToggle(k, v, setHomePermissions)} />
          </div>
        )}
      </div>

      {/* 2. My Network Section Accordion */}
      <div className={`mhn-supervision-accordion ${expandedCategories.network ? 'mhn-accordion-expanded' : ''}`}>
        <div className="mhn-accordion-header" onClick={() => toggleCategory('network')}>
          <div className="mhn-accordion-title-left">
            <NextImage src="/myNetwork.webp" alt="" width={32} height={32} className="home" />
            <span className="superTitle">My Network</span>
          </div>
          <ChevronDown className={`mhn-accordion-chevron ${expandedCategories.network ? 'mhn-chevron-up' : ''}`} size={16} aria-hidden="true" />
        </div>

        {expandedCategories.network && (
          <div className="mhn-accordion-body">
            <PermissionToggleRow title="Follow others" subtitle="Can follow people and pages" controlKey="follow_others" isOn={Boolean(networkPermissions.followOthers)} isUpdating={updatingControlKey === 'follow_others'} onToggle={(k, v) => onToggle(k, v, setNetworkPermissions)} />

            <div className="mhn-permission-row">
              <div className="mhn-permission-meta">
                <h4 className="mhn-permission-title">Who can follow them</h4>
                <p className="mhn-permission-subtitle">Controls who can subscribe to their updates</p>
              </div>
              <Dropdown
                value={String(networkPermissions.whoCanFollowThem)}
                options={['Everyone', 'Connections Only', 'Nobody']}
                onChange={(val) => onToggle('who_can_follow_them', val, setNetworkPermissions)}
                disabled={updatingControlKey === 'who_can_follow_them'}
                placeholder=""
                className="mhn-w-180"
              />
            </div>

            <div className="mhn-permission-row">
              <div className="mhn-permission-meta">
                <h4 className="mhn-permission-title">Who can send connection requests</h4>
                <p className="mhn-permission-subtitle">Limits incoming connection requests</p>
              </div>
              <Dropdown
                value={String(networkPermissions.whoCanSendRequests)}
                options={['Everyone', 'Connections Only', 'Nobody']}
                onChange={(val) => onToggle('who_can_send_requests', val, setNetworkPermissions)}
                disabled={updatingControlKey === 'who_can_send_requests'}
                placeholder=""
                className="mhn-w-180"
              />
            </div>

            <PermissionToggleRow title="Accept connection requests" subtitle="Can accept incoming requests from others" controlKey="accept_requests" isOn={Boolean(networkPermissions.acceptRequests)} isUpdating={updatingControlKey === 'accept_requests'} onToggle={(k, v) => onToggle(k, v, setNetworkPermissions)} />
          </div>
        )}
      </div>

      {/* 3. Messaging Section Accordion */}
      <div className={`mhn-supervision-accordion ${expandedCategories.messaging ? 'mhn-accordion-expanded' : ''}`}>
        <div className="mhn-accordion-header" onClick={() => toggleCategory('messaging')}>
          <div className="mhn-accordion-title-left">
            <NextImage src="/messaging2.webp" alt="" width={32} height={32} className="home" />
            <span className="superTitle">Messaging</span>
          </div>
          <ChevronDown className={`mhn-accordion-chevron ${expandedCategories.messaging ? 'mhn-chevron-up' : ''}`} size={16} aria-hidden="true" />
        </div>

        {expandedCategories.messaging && (
          <div className="mhn-accordion-body">
            <PermissionToggleRow title="Send messages" subtitle="Can initiate and reply to conversations" controlKey="send_messages" isOn={Boolean(messagingPermissions.sendMessages)} isUpdating={updatingControlKey === 'send_messages'} onToggle={(k, v) => onToggle(k, v, setMessagingPermissions)} />
            <PermissionToggleRow title="Receive messages" subtitle="Others can send them messages" controlKey="receive_messages" isOn={Boolean(messagingPermissions.receiveMessages)} isUpdating={updatingControlKey === 'receive_messages'} onToggle={(k, v) => onToggle(k, v, setMessagingPermissions)} />
            <PermissionToggleRow title="Create group chats" subtitle="Can start group conversations" controlKey="create_group_chats" isOn={Boolean(messagingPermissions.createGroupChats)} isUpdating={updatingControlKey === 'create_group_chats'} onToggle={(k, v) => onToggle(k, v, setMessagingPermissions)} />

            <div className="mhn-permission-row">
              <div className="mhn-permission-meta">
                <h4 className="mhn-permission-title">Who can message them</h4>
                <p className="mhn-permission-subtitle">Controls who can start a conversation</p>
              </div>
              <Dropdown
                value={String(messagingPermissions.whoCanMessageThem)}
                options={['Connections Only', 'Everyone', 'Nobody']}
                onChange={(val) => onToggle('who_can_message_them', val, setMessagingPermissions)}
                disabled={updatingControlKey === 'who_can_message_them'}
                placeholder=""
                className="mhn-w-180"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Notifications Section Accordion */}
      <div className={`mhn-supervision-accordion ${expandedCategories.notifications ? 'mhn-accordion-expanded' : ''}`}>
        <div className="mhn-accordion-header" onClick={() => toggleCategory('notifications')}>
          <div className="mhn-accordion-title-left">
            <NextImage src="/notifications.webp" alt="" width={32} height={32} className="home" />
            <span className="superTitle">Notifications</span>
          </div>
          <ChevronDown className={`mhn-accordion-chevron ${expandedCategories.notifications ? 'mhn-chevron-up' : ''}`} size={16} aria-hidden="true" />
        </div>

        {expandedCategories.notifications && (
          <div className="mhn-accordion-body">
            <PermissionToggleRow title="Message notifications" subtitle="Get notified when they receive a message" controlKey="message_notifications" isOn={Boolean(notificationPermissions.messageNotifications)} isUpdating={updatingControlKey === 'message_notifications'} onToggle={(k, v) => onToggle(k, v, setNotificationPermissions)} />
            <PermissionToggleRow title="Connection request notifications" subtitle="Get notified about incoming requests" controlKey="connection_notifications" isOn={Boolean(notificationPermissions.connectionNotifications)} isUpdating={updatingControlKey === 'connection_notifications'} onToggle={(k, v) => onToggle(k, v, setNotificationPermissions)} />
            <PermissionToggleRow title="Activity notifications" subtitle="Reactions, comments on their posts" controlKey="activity_notifications" isOn={Boolean(notificationPermissions.activityNotifications)} isUpdating={updatingControlKey === 'activity_notifications'} onToggle={(k, v) => onToggle(k, v, setNotificationPermissions)} />
            <PermissionToggleRow title="Mention notifications" subtitle="Get notified when someone mentions them" controlKey="mention_notifications" isOn={Boolean(notificationPermissions.mentionNotifications)} isUpdating={updatingControlKey === 'mention_notifications'} onToggle={(k, v) => onToggle(k, v, setNotificationPermissions)} />
          </div>
        )}
      </div>
    </div>
  );
}
