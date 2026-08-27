'use client';

import { useState, useEffect } from 'react';
import {
  getSupervisionData,
  createManagedChild,
  sendGuardianInvite,
  type SupervisionChildItem,
} from '@my-hockey-network/core';
import { QueryKeys, ToastTypeEnum } from '@my-hockey-network/contracts';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@my-hockey-network/constants';
import type { PlayerDetailsFormValues, LinkPlayerFormValues } from '@my-hockey-network/validation';

import { resolveMediaUrl } from '@/utils/mediaUtils';
import { formatDobToIso } from '@/utils/guardianUtils';
import { extractErrorMessage } from '@/utils/toast';
import { useQuery, globalQueryClient, invalidateQueryPrefix } from '@/query';

export interface WardListItem {
  id: string;
  name: string;
  age: number;
  avatar: string;
}

function mapChildren(children: SupervisionChildItem[]): WardListItem[] {
  return children.map((child) => ({
    id: child.id,
    name: child.displayName || child.firstName || 'Minor Player',
    age: child.age || 12,
    avatar: resolveMediaUrl(child.avatarUrl, '/userPlaceholder.png'),
  }));
}

interface UseSupervisionWardsParams {
  initialWardId: string | null;
  onWardsRefreshed: (wardId: string) => void;
  showToast: (message: string, type: ToastTypeEnum) => void;
}

/**
 * Supervision sidebar + add-player wizard: the managed-children (wards)
 * list, selecting one, creating a new managed player profile, and
 * inviting an existing player by email. Extracted from
 * `screens/supervision-page.tsx`.
 */
export function useSupervisionWards({ initialWardId, onWardsRefreshed, showToast }: UseSupervisionWardsParams) {
  const [wards, setWards] = useState<WardListItem[]>([]);
  const [selectedWardId, setSelectedWardId] = useState(initialWardId || '');
  const [apiLoading, setApiLoading] = useState(true);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [isSendingLinkInvite, setIsSendingLinkInvite] = useState(false);
  const [addedPlayerName, setAddedPlayerName] = useState('Noah');
  const [createdWardId, setCreatedWardId] = useState<string | null>(null);

  const { data: rawSupervisionData, isLoading: isSupDataLoading } = useQuery(
    QueryKeys.SUPERVISION_DATA,
    getSupervisionData,
    { staleTime: 5 * 60 * 1000 },
  );

  useEffect(() => {
    if (rawSupervisionData) {
      const children = rawSupervisionData.children;
      if (Array.isArray(children) && children.length > 0) {
        const mapped = mapChildren(children);
        setWards(mapped);

        let targetId = initialWardId || mapped[0].id;
        if (!mapped.some((w) => w.id === targetId)) {
          targetId = mapped[0].id;
        }
        setSelectedWardId(targetId);
        if (targetId) onWardsRefreshed(targetId);
      } else {
        setWards([]);
        setSelectedWardId('');
      }
    }
    setApiLoading(isSupDataLoading);
  }, [rawSupervisionData, isSupDataLoading, initialWardId]);

  const createPlayer = async (values: PlayerDetailsFormValues): Promise<boolean> => {
    const nameToUse = values.fullName.trim() || 'Noah';
    setAddedPlayerName(nameToUse);

    const nameParts = nameToUse.split(' ');
    const firstName = nameParts[0] || 'Minor';
    const lastName = nameParts.slice(1).join(' ') || 'Player';

    setApiLoading(true);
    setIsCreatingPlayer(true);
    try {
      const formattedDob = formatDobToIso(values.dateOfBirth) || '2015-05-15';

      const res = await createManagedChild({
        displayName: nameToUse,
        firstName,
        lastName,
        dateOfBirth: formattedDob,
        guardianRelation: values.guardianRelation,
        email: values.email.trim() || undefined,
      });

      const resObj = (res || {}) as Record<string, unknown>;
      const childObj = ((resObj.child || resObj.profile || resObj) || {}) as Record<string, unknown>;
      const newChildId = (childObj.id as string | undefined) || (childObj.profileId as string | undefined);
      if (newChildId) {
        setCreatedWardId(newChildId);
        setSelectedWardId(newChildId);
      }

      try {
        await invalidateQueryPrefix(globalQueryClient, QueryKeys.SUPERVISION_DATA);
        const freshSupData = await getSupervisionData();
        if (freshSupData?.children && Array.isArray(freshSupData.children)) {
          const mapped = mapChildren(freshSupData.children);
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
      return true;
    } catch (err: unknown) {
      showToast(extractErrorMessage(err, ERROR_MESSAGES.FAILED_CREATE_PLAYER), ToastTypeEnum.ERROR);
      return false;
    } finally {
      setApiLoading(false);
      setIsCreatingPlayer(false);
    }
  };

  const sendLinkInvitation = async (values: LinkPlayerFormValues): Promise<boolean> => {
    setIsSendingLinkInvite(true);
    try {
      await sendGuardianInvite(values.email.trim());
      showToast(SUCCESS_MESSAGES.INVITATION_SENT, ToastTypeEnum.SUCCESS);
      return true;
    } catch (err: unknown) {
      showToast(extractErrorMessage(err, ERROR_MESSAGES.FAILED_SEND_INVITATION), ToastTypeEnum.ERROR);
      return false;
    } finally {
      setIsSendingLinkInvite(false);
    }
  };

  const refreshAfterParentOnboarding = async () => {
    try {
      const supData = await getSupervisionData();
      if (supData?.children && supData.children.length > 0) {
        const mapped = mapChildren(supData.children);
        setWards(mapped);
        if (mapped[0]?.id) setSelectedWardId(mapped[0].id);
      }
    } catch (err) {
      console.warn('Supervision data reload notice:', err);
    }
  };

  return {
    wards,
    selectedWardId,
    setSelectedWardId,
    apiLoading,
    isCreatingPlayer,
    isSendingLinkInvite,
    addedPlayerName,
    createdWardId,
    createPlayer,
    sendLinkInvitation,
    refreshAfterParentOnboarding,
  };
}
