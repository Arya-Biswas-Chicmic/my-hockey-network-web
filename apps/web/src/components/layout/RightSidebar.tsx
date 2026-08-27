import React, { ReactNode } from 'react';

export interface RightSidebarProps {
  children?: ReactNode;
  className?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ children, className = '' }) => {
  return (
    <aside className={`mhn-layout-col-right lg:h-full lg:overflow-hidden ${className}`}>
      {children}
    </aside>
  );
};
