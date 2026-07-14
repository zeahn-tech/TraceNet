import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input ref={ref} id={id} className={cn('input', error && 'border-emergency', className)} {...props} />
      {error && <p className="mt-1 text-xs text-emergency">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn('input min-h-[96px] resize-y', error && 'border-emergency', className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-emergency">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn('input appearance-none pr-9', error && 'border-emergency', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-emergency">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
