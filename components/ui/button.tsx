import React from 'react';

type Variant = 'default' | 'outline' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  className?: string;
}

const base = 'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-700';
const variants: Record<Variant, string> = {
  default: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  outline: 'border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-200',
  ghost: 'bg-transparent hover:bg-neutral-900 text-neutral-300',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

export function Button({ variant = 'default', size = 'md', asChild, className = '', children, ...props }: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      className: `${(children as any).props?.className || ''} ${cls}`.trim(),
    });
  }
  return (
    <button className={cls} {...props}>{children}</button>
  );
}

export default Button;

