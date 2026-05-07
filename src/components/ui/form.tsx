import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Field wrapper
// =============================================================================

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-fg">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

// =============================================================================
// Input
// =============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full bg-bg-panel-light border rounded-lg px-3 py-2 text-fg text-sm',
        'placeholder:text-fg-subtle',
        'focus:ring-1 transition-colors',
        invalid
          ? 'border-danger focus:border-danger focus:ring-danger'
          : 'border-border focus:border-brand focus:ring-brand',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// =============================================================================
// Textarea
// =============================================================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full bg-bg-panel-light border rounded-lg px-3 py-2 text-fg text-sm resize-y',
        'placeholder:text-fg-subtle',
        'focus:ring-1 transition-colors',
        invalid
          ? 'border-danger focus:border-danger focus:ring-danger'
          : 'border-border focus:border-brand focus:ring-brand',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

// =============================================================================
// Select
// =============================================================================

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ invalid, className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full bg-bg-panel-light border rounded-lg px-3 py-2 text-fg text-sm',
        'focus:ring-1 transition-colors appearance-none',
        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m3%204.5%203%203%203-3%22%2F%3E%3C%2Fsvg%3E")] bg-[length:12px] bg-no-repeat bg-[right_12px_center] pr-8',
        invalid
          ? 'border-danger focus:border-danger focus:ring-danger'
          : 'border-border focus:border-brand focus:ring-brand',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

// =============================================================================
// Form section
// =============================================================================

export function FormSection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel p-5 space-y-4">
      {(title || description) && (
        <div className="pb-3 border-b border-border">
          {title && <h2 className="text-sm font-semibold text-fg">{title}</h2>}
          {description && (
            <p className="mt-1 text-xs text-fg-muted">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
