import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover, ...props }: CardProps) {
  return (
    <div
      className={cn('card p-4', hover && 'transition-shadow hover:shadow-cardHover', className)}
      {...props}
    >
      {children}
    </div>
  );
}
