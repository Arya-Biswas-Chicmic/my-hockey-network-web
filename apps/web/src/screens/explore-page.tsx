import { Search } from 'lucide-react';
import { ComingSoonPage } from '@/components/common/ComingSoonPage';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const ExplorePage: React.FC<PageProps> = ({ onNavigate, onLogout }) => (
  <ComingSoonPage
    activeTab="explore"
    title="Explore is coming soon"
    description="Discover popular posts, suggested accounts, and verified teams from across the network."
    icon={<Search size={32} strokeWidth={1.75} aria-hidden="true" />}
    onNavigate={onNavigate}
    onLogout={onLogout}
  />
);
