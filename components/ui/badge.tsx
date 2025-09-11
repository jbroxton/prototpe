import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning';
}

export function Badge({ variant = 'secondary', className = '', children, ...props }: BadgeProps) {
  const colors = {
    default: 'bg-neutral-700 text-neutral-200',
    secondary: 'bg-neutral-800 text-neutral-300',
    success: 'bg-green-900 text-green-200',
    warning: 'bg-yellow-900 text-yellow-200',
  } as const;
  const cls = `inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[variant]} ${className}`.trim();
  return <span className={cls} {...props}>{children}</span>;
}

export default Badge;

