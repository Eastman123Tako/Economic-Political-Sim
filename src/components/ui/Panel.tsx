import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  dense?: boolean;
}

/** Briefing-room style card: dark graded panel with corner brackets and an uppercase title rule. */
export default function Panel({ title, children, className = '', dense }: PanelProps) {
  return (
    <div className={`brackets relative bg-void-900/70 border border-void-700 rounded-sm ${dense ? 'p-3' : 'p-4'} ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-3.5 bg-sage-500" />
          <h3 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold">{title}</h3>
          <span className="flex-1 h-px bg-void-700" />
        </div>
      )}
      {children}
    </div>
  );
}
