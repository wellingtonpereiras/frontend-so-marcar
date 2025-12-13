import * as React from 'react';
import { cn } from '../../utils/cn';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">{children}</div>
    </div>
  );
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <p className="text-sm text-gray-600 mt-2">{children}</p>;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div className="flex gap-3 justify-end mt-6">{children}</div>;
}

interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

export function AlertDialogAction({
  children,
  onClick,
  variant = 'default',
  disabled,
}: AlertDialogActionProps) {
  const baseStyles =
    'px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles =
    variant === 'destructive'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-primary-600 text-white hover:bg-primary-700';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variantStyles)}
    >
      {children}
    </button>
  );
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function AlertDialogCancel({ children, onClick }: AlertDialogCancelProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {children}
    </button>
  );
}
