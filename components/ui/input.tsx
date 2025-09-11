import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  const cls = `bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600 ${className}`.trim();
  return <input className={cls} {...props} />;
}

export default Input;

