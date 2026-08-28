import type { ReactNode } from 'react';
import { NoDataFound } from '@/components/common/no-data-found';

export interface ComingSoonPageProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

/** Shared shell for a sidebar-nav page whose content isn't built yet —
 * honest "not available yet" state rather than a 404 or fabricated content,
 * matching this project's data policy. No longer renders its own sidebar:
 * every authenticated route gets one from `(authenticated)/layout.tsx`. */
export function ComingSoonPage({ title, description, icon }: Readonly<ComingSoonPageProps>) {
  return (
    <div className="mhn-coming-soon-content">
      <NoDataFound title={title} description={description} icon={icon} />
    </div>
  );
}
