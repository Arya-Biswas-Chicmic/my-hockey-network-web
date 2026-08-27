import { Button } from '@/components/common/Button';
import { Bell, CalendarDays, Home, MessageSquare, Users } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'network', label: 'My Network', Icon: Users },
  { id: 'events', label: 'Events', Icon: CalendarDays },
  { id: 'messaging', label: 'Messaging', Icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
] as const;

export interface HeaderNavMenuProps {
  currentTab: string;
  onTabClick: (tabId: string) => void;
}

/** Header's center navigation menu (Home/My Network/Events/Messaging/
 * Notifications). Extracted from `components/common/Header.tsx`. */
export function HeaderNavMenu({ currentTab, onTabClick }: Readonly<HeaderNavMenuProps>) {
  return (
    <nav className="mhn-header-nav">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          onClick={() => onTabClick(id)}
          className={`mhn-nav-item ${currentTab === id ? 'mhn-nav-item-active' : ''}`}
        >
          <div className="mhn-nav-icon">
            <Icon size={20} />
          </div>
          <span className="mhn-nav-label">{label}</span>
          {currentTab === id && <div className="mhn-nav-active-bar" />}
        </Button>
      ))}
    </nav>
  );
}
