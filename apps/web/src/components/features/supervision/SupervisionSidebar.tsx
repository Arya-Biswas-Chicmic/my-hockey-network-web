'use client';

import NextImage from 'next/image';
import { SupervisionViewModeEnum } from '@my-hockey-network/contracts';

import { Button } from '@/components/common/Button';
import { FallbackImage } from '@/components/ui/fallback-image';
import { SidebarWardSkeleton } from '@/components/supervision/sidebar-ward-skeleton';
import type { WardListItem } from '@/hooks/use-supervision-wards';

export interface SupervisionSidebarProps {
  wards: WardListItem[];
  isLoading: boolean;
  selectedWardId: string;
  viewMode: SupervisionViewModeEnum;
  onSelectWard: (wardId: string) => void;
  onAddPlayerClick: () => void;
}

/** Supervision sidebar: managed-children (wards) list. Extracted from `screens/supervision-page.tsx`. */
export function SupervisionSidebar({
  wards,
  isLoading,
  selectedWardId,
  viewMode,
  onSelectWard,
  onAddPlayerClick,
}: Readonly<SupervisionSidebarProps>) {
  return (
    <aside className="mhn-supervision-sidebar">
      <div className="mhn-supervision-sidebar-header">
        <h2 className="mhn-supervision-sidebar-title">Supervision</h2>
        <Button className="mhn-supervision-add-btn" onClick={onAddPlayerClick} title="Add Minor Account">
          <NextImage src="/add4.png" alt="" width={32} height={32} className="add4" />
        </Button>
      </div>

      <div className="mhn-supervision-wards-list">
        {isLoading ? (
          <SidebarWardSkeleton count={2} />
        ) : wards.length === 0 ? (
          <div className="mhn-ward-empty-msg">No managed players found.</div>
        ) : (
          wards.map((ward) => (
            <div
              key={ward.id}
              onClick={() => onSelectWard(ward.id)}
              className={`mhn-supervision-ward-item ${selectedWardId === ward.id && viewMode === SupervisionViewModeEnum.MAIN ? 'mhn-ward-active' : ''}`}
            >
              <FallbackImage src={ward.avatar} alt={ward.name} width={36} height={36} className="mhn-ward-avatar" />
              <span className="mhn-ward-name-label">
                {ward.name} <span className="mhn-ward-age">({ward.age})</span>
              </span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
