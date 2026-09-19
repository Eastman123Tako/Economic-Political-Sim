import { useEffect } from 'react';
import { useGameStore, type Toast } from '../store/gameStore';

const TONE_STYLE: Record<Toast['tone'], string> = {
  info: 'border-steel-700 bg-steel-900/90 text-steel-100',
  good: 'border-sage-700 bg-sage-900/90 text-sage-100',
  bad: 'border-brick-700 bg-brick-900/90 text-brick-100',
  event: 'border-khaki-600 bg-khaki-900/95 text-khaki-100',
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useGameStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismissToast(toast.id), toast.tone === 'event' ? 7000 : 4000);
    return () => clearTimeout(t);
  }, [toast.id, toast.tone, dismissToast]);

  return (
    <div className={`brackets pointer-events-auto max-w-sm rounded-sm border px-3 py-2 text-xs shadow-lg backdrop-blur-sm ${TONE_STYLE[toast.tone]}`}>
      {toast.tone === 'event' && <div className="text-[10px] uppercase tracking-widest opacity-70 mb-0.5">Historical Development</div>}
      {toast.text}
    </div>
  );
}

export default function ToastStack() {
  const toasts = useGameStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
