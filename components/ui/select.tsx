import React from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/app/components/ui/dropdown-menu';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  className?: string;
  onChange?: (e: { target: { value: string } }) => void;
}

// Shadcn-style Select built on dropdown-menu popover
export function Select({ className = '', children, value, onChange, disabled, ...props }: SelectProps) {
  const options = React.Children.toArray(children).filter(Boolean) as React.ReactElement[];
  const getLabel = (val: any) => {
    const match = options.find((c) => React.isValidElement(c) && (c.props as any).value == val);
    return match ? (match.props as any).children : 'Select';
  };
  const emit = (val: string) => {
    onChange?.({ target: { value: val } });
  };
  const base = 'inline-flex items-center justify-between h-8 text-sm rounded-md border border-neutral-800 bg-neutral-950 text-neutral-200 hover:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-700 px-3 min-w-[140px]';
  const cls = `${base} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`.trim();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cls} aria-disabled={disabled} {...(props as any)}>
          <span className="truncate mr-3">{getLabel(value)}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 opacity-60 fill-current">
            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.2l3.71-2.97a.75.75 0 1 1 .94 1.16l-4.24 3.4a.75.75 0 0 1-.94 0l-4.24-3.4a.75.75 0 0 1 .02-1.18z" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[220px]">
        {options.map((c, i) => {
          const val = (c.props as any).value ?? String(i);
          const label = (c.props as any).children;
          return (
            <DropdownMenuItem key={val} onClick={() => emit(val)}>
              <span className="flex-1 truncate">{label}</span>
              {String(value) === String(val) && <span className="text-indigo-300">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Select;
