import { Shield } from 'lucide-react';
import { ComingSoonPage } from '@/components/common/ComingSoonPage';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const TeamsPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => (
  <ComingSoonPage
    activeTab="teams"
    title="Teams is coming soon"
    description="Team rosters, schedules, and management tools will appear here."
    icon={<Shield size={32} strokeWidth={1.75} aria-hidden="true" />}
    onNavigate={onNavigate}
    onLogout={onLogout}
  />
);
