import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export function Select({ className = '', children, ...props }: SelectProps) {
  const cls = `bg-neutral-900 border border-neutral-800 rounded text-sm px-2 py-1 text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-700 ${className}`.trim();
  return (
    <select className={cls} {...props}>
      {children}
    </select>
  );
}

export default Select;

