import { Bookmark } from 'lucide-react';
import { ComingSoonPage } from '@/components/common/ComingSoonPage';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const SavedPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => (
  <ComingSoonPage
    activeTab="saved"
    title="Saved is coming soon"
    description="Posts and events you save will show up here."
    icon={<Bookmark size={32} strokeWidth={1.75} aria-hidden="true" />}
    onNavigate={onNavigate}
    onLogout={onLogout}
  />
);
