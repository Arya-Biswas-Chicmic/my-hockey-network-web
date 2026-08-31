import { useImpersonationStore } from '@/stores/impersonation-store';
import { FallbackImage } from '@/components/ui/fallback-image';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { SwitchAccountIcon } from '@/components/icons/DropdownIcons';

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  canOperate: boolean;
}

export interface HeaderFamilyMenuProps {
  familyMembers: FamilyMember[];
  isFamilyLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectMember: (memberId: string) => void;
  onShowMore: () => void;
}

/** Profile dropdown's expandable "Family" section (parent accounts only) —
 * shows up to 3 managed children with a switcher, plus a "Show More" link
 * into Supervision. Extracted from `components/common/Header.tsx`. */
export function HeaderFamilyMenu({
  familyMembers,
  isFamilyLoading,
  isExpanded,
  onToggleExpand,
  onSelectMember,
  onShowMore,
}: Readonly<HeaderFamilyMenuProps>) {
  const startImpersonation = useImpersonationStore((state) => state.startImpersonation);

  if (!isFamilyLoading && familyMembers.length === 0) return null;

  return (
    <div className="mhn-dropdown-family-box">
      <div className="mhn-family-header" onClick={onToggleExpand}>
        <div className="mhn-dropdown-item-left">
          <div className="mhn-family-icon-box">
            <Users size={16} aria-hidden="true" />
          </div>
          <span className="mhn-dropdown-item-text">
            Family {isFamilyLoading ? '...' : `(${familyMembers.length})`}
          </span>
        </div>
        <ChevronDown
          className={`mhn-family-chevron ${isExpanded ? 'mhn-chevron-rotated' : ''}`}
          size={16}
          aria-hidden="true"
        />
      </div>

      {isExpanded && (
        <div className="mhn-family-list">
          {isFamilyLoading ? (
            <div className="mhn-family-skeleton-container">
              <div className="mhn-family-skeleton-item" />
              <div className="mhn-family-skeleton-item" />
            </div>
          ) : (
            <>
              {familyMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="mhn-family-member-item mhn-family-member-item-clickable"
                  onClick={() => {
                    if (member.canOperate) {
                      startImpersonation(member.id, member.name);
                    } else {
                      onSelectMember(member.id);
                    }
                  }}
                >
                  <div className="mhn-dropdown-item-left mhn-family-member-left">
                    <FallbackImage src={member.avatar} alt={member.name} width={26} height={26} className="mhn-family-member-img" />
                    <span className="mhn-family-member-name" title={member.name}>
                      {member.name.length > 18 ? `${member.name.trim().split(/\s+/).slice(0, 2).join(' ')}...` : member.name}
                    </span>
                  </div>
                  {member.canOperate && (
                    <div className="mhn-family-switch-btn" title={`Impersonate ${member.name}`}>
                      <SwitchAccountIcon size={24} aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}
              {familyMembers.length > 3 && (
                <div className="mhn-family-show-more-item mhn-family-show-more-btn" onClick={onShowMore}>
                  <span>Show More ({familyMembers.length - 3})</span>
                  <ChevronRight size={14} strokeWidth={2.5} aria-hidden="true" />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
