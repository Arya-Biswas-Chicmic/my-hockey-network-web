'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { getSupervisionControls, updateSupervisionControls, type SupervisionControlItem } from '@my-hockey-network/core';
import { SupervisionControlKeyEnum, ToastTypeEnum } from '@my-hockey-network/contracts';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';

import { extractErrorMessage } from '@/utils/toast';

export type PermissionState = Record<string, boolean | string>;

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

const STATE_KEY_MAP: Record<string, string> = {
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

/**
 * Supervision > Permissions tab: the four permission-category states, the
 * `GET`/`PATCH` supervision-controls calls, and the backend
 * enum/state-key mapping tables. Extracted from `screens/supervision-page.tsx`.
 */
export function useSupervisionPermissions(showToast: (message: string, type: ToastTypeEnum) => void) {
  const [homePermissions, setHomePermissions] = useState<PermissionState>({
    homeVisibility: true,
    activityLogSharing: true,
    discoverability: false,
    viewFeed: true,
    createPosts: true,
    commentOnPosts: true,
    reactToPosts: true,
    sharePosts: true,
  });

  const [networkPermissions, setNetworkPermissions] = useState<PermissionState>({
    followOthers: true,
    whoCanFollowThem: 'Everyone',
    whoCanSendRequests: 'Everyone',
    acceptRequests: true,
  });

  const [messagingPermissions, setMessagingPermissions] = useState<PermissionState>({
    sendMessages: true,
    receiveMessages: true,
    createGroupChats: false,
    whoCanMessageThem: 'Connections Only',
  });

  const [notificationPermissions, setNotificationPermissions] = useState<PermissionState>({
    messageNotifications: true,
    connectionNotifications: true,
    activityNotifications: false,
    mentionNotifications: true,
  });

  // Bug fix 2026-08-30: this used to default to `true` on the assumption a
  // caller would always flip it to `false` once controls loaded for some
  // ward — but with zero managed players ("No managed players found"),
  // nothing ever selects a ward, so `handleToggleControl`'s own load path
  // never runs and this stayed `true` forever, showing the permissions
  // skeleton indefinitely instead of the real (empty) state.
  const [isControlsLoading, setIsControlsLoading] = useState(false);
  const [updatingControlKeys, setUpdatingControlKeys] = useState<Record<string, boolean>>({});

  const fetchControlsForWard = async (wardId: string) => {
    if (!wardId) return;
    try {
      const res = await getSupervisionControls(wardId);
      const controls = res.controls;
      if (Array.isArray(controls) && controls.length > 0) {
        controls.forEach((c: SupervisionControlItem) => {
          const rawKey = String(c.control || c.name || '').toUpperCase();
          const val = c.value;

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
    } catch (err: unknown) {
      console.warn('Supervision controls fetch notice:', err);
    }
  };

  const handleToggleControl = async <T extends PermissionState>(
    selectedWardId: string,
    controlKey: string,
    currentVal: boolean | string,
    setter: Dispatch<SetStateAction<T>>,
  ) => {
    if (!selectedWardId || updatingControlKeys[controlKey]) return;
    const newVal = typeof currentVal === 'boolean' ? !currentVal : currentVal;

    const backendControl = CONTROL_KEY_TO_BACKEND_ENUM[controlKey] || controlKey.toUpperCase();
    const targetPropKey = STATE_KEY_MAP[controlKey] || controlKey;

    setUpdatingControlKeys((prev) => ({ ...prev, [controlKey]: true }));
    setter((prev) => ({ ...prev, [controlKey]: newVal, [targetPropKey]: newVal }) as T);

    try {
      await updateSupervisionControls(selectedWardId, [{ control: backendControl, value: newVal }]);
      showToast(SUCCESS_MESSAGES.PERMISSION_UPDATED, ToastTypeEnum.SUCCESS);
      await fetchControlsForWard(selectedWardId);
    } catch (err: unknown) {
      setter((prev) => ({ ...prev, [controlKey]: currentVal, [targetPropKey]: currentVal }) as T);
      showToast(extractErrorMessage(err, ERROR_MESSAGES.FAILED_UPDATE_PERMISSION), ToastTypeEnum.ERROR);
    } finally {
      setUpdatingControlKeys((prev) => {
        const next = { ...prev };
        delete next[controlKey];
        return next;
      });
    }
  };

  return {
    homePermissions,
    setHomePermissions,
    networkPermissions,
    setNetworkPermissions,
    messagingPermissions,
    setMessagingPermissions,
    notificationPermissions,
    setNotificationPermissions,
    isControlsLoading,
    setIsControlsLoading,
    updatingControlKeys,
    fetchControlsForWard,
    handleToggleControl,
  };
}
