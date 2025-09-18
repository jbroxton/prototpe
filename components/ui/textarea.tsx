import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ className = '', ...props }: TextareaProps) {
  const cls = `bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600 ${className}`.trim();
  return <textarea className={cls} {...props} />;
}

export default Textarea;

