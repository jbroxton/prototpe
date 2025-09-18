import React from 'react';
import TabsBar from './components/TabsBar';

export default function InternalProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <TabsBar />
      <div>{children}</div>
    </div>
  );
}
