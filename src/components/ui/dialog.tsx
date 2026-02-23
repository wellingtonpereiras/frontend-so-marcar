import * as React from "react";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 border-b border-gray-200 dark:border-gray-700">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{children}</h2>;
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className || "p-6"}>{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">{children}</div>;
}
