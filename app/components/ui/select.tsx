import * as React from 'react';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = '', children, ...props }, ref) => (
    <select
      ref={ref}
      className={`px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-sm ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = 'Select';

