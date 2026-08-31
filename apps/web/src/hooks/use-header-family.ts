'use client';

import { useEffect, useState } from 'react';
import { getSupervisionData } from '@my-hockey-network/core';
import { QueryKeys, type AuthMeResponse } from '@my-hockey-network/contracts';
import { isParentUser } from '@my-hockey-network/domain';
import { useQuery } from '@/query';
import { resolveMediaUrl } from '@/utils/mediaUtils';

/**
 * Header's active-user display and (for parents) the family-member switcher
 * list backing the profile dropdown's "Family" section. Extracted from
 * `components/common/Header.tsx`.
 */
export function useHeaderFamily(user: AuthMeResponse | null | undefined, userName?: string) {
  const resolvedName = user?.profile?.displayName || userName || 'Player';
  const rawAvatar = user?.profile?.avatarUrl;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.webp');
  const [activeUser, setActiveUser] = useState({ name: resolvedName, avatar: resolvedAvatar });
  const [familyMembers, setFamilyMembers] = useState<Array<{ id: string; name: string; avatar: string; canOperate: boolean }>>([]);
  const isParent = isParentUser(user ?? null);

  const { data: supervisionData, isLoading: isFamilyLoading } = useQuery(
    isParent ? QueryKeys.SUPERVISION_DATA : null,
    isParent ? getSupervisionData : null,
    { staleTime: 5 * 60 * 1000 }
  );

  useEffect(() => {
    const name = user?.profile?.displayName || userName || 'Player';
    const av = user?.profile?.avatarUrl;
    const avatar = resolveMediaUrl(av, '/userPlaceholder.webp');
    setActiveUser({ name, avatar });
  }, [user, userName]);

  useEffect(() => {
    if (isParent && supervisionData) {
      const children = supervisionData.children;
      if (Array.isArray(children) && children.length > 0) {
        const mapped = children.map((child) => ({
          id: child.id,
          name: child.displayName || child.firstName || 'Child',
          avatar: resolveMediaUrl(child.avatarUrl, '/userPlaceholder.webp'),
          canOperate: Boolean(child.canOperate),
        }));
        setFamilyMembers(mapped);
      } else {
        setFamilyMembers([]);
      }
    } else {
      setFamilyMembers([]);
    }
  }, [isParent, supervisionData]);

  return { activeUser, familyMembers, isFamilyLoading, isParent };
}
