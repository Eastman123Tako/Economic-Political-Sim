import type { ReactNode } from 'react';

interface TileButtonProps {
  icon?: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Large gradient tile button used for nation-select, sidebar nav, and primary actions. */
export default function TileButton({ icon, label, sub, active, disabled, onClick, className = '' }: TileButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex items-center gap-2.5 rounded-sm border px-3 py-2 text-left transition-colors ${
        disabled
          ? 'border-void-800 bg-void-900/40 text-void-600 cursor-not-allowed'
          : active
            ? 'border-sage-500/70 bg-gradient-to-r from-sage-800/50 to-sage-900/20 text-sage-200'
            : 'border-void-700 bg-void-900/50 text-void-300 hover:border-sage-700 hover:bg-void-800/60 hover:text-sage-200'
      } ${className}`}
    >
      {active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-sage-400" />}
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{label}</span>
        {sub && <span className="block text-[11px] text-void-500 group-hover:text-void-400 truncate">{sub}</span>}
      </span>
    </button>
  );
}
