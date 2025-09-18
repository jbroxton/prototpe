import React from 'react';

interface ScrollAreaProps {
  className?: string;
  children?: React.ReactNode;
}

// Minimal shadcn-style ScrollArea wrapper for consistent styling.
// Provides vertical scroll and size constraint via classes.
export function ScrollArea({ className = '', children }: ScrollAreaProps) {
  return (
    <div className={`relative overflow-y-auto ${className}`.trim()}>
      {children}
    </div>
  );
}

export default ScrollArea;

