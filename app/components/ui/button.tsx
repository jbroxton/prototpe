import * as React from 'react';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

function variantClass(variant: Variant) {
  switch (variant) {
    case 'outline': return 'border border-white/10 bg-neutral-900 hover:bg-neutral-800';
    case 'ghost': return 'bg-transparent hover:bg-white/5';
    case 'destructive': return 'bg-red-700 hover:bg-red-600 text-white';
    default: return 'bg-indigo-600 hover:bg-indigo-500 text-white';
  }
}

function sizeClass(size: Size) {
  switch (size) {
    case 'sm': return 'px-2 py-1 text-xs rounded';
    case 'lg': return 'px-5 py-3 text-base rounded-md';
    default: return 'px-3 py-2 text-sm rounded-md';
  }
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={`${variantClass(variant)} ${sizeClass(size)} inline-flex items-center justify-center gap-1 ${className}`}
      {...props}
    />
  )
);

Button.displayName = 'Button';

