import { MessagesSquare } from 'lucide-react';
import { ComingSoonPage } from '@/components/common/ComingSoonPage';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const GroupsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => (
  <ComingSoonPage
    activeTab="groups"
    title="Groups is coming soon"
    description="Join and manage hockey groups here once group support launches."
    icon={<MessagesSquare size={32} strokeWidth={1.75} aria-hidden="true" />}
    onNavigate={onNavigate}
    onLogout={onLogout}
  />
);
