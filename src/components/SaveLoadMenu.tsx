import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function SaveLoadMenu({ onClose }: { onClose: () => void }) {
  const saveToSlot = useGameStore((s) => s.saveToSlot);
  const loadFromSlot = useGameStore((s) => s.loadFromSlot);
  const listSlots = useGameStore((s) => s.listSlots);
  const removeSlot = useGameStore((s) => s.removeSlot);
  const quitToMenu = useGameStore((s) => s.quitToMenu);
  const [label, setLabel] = useState('');
  const slots = listSlots();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="brackets bg-void-900 border border-void-700 rounded-sm w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-void-100 mb-3">Save / Load</h3>
        <div className="flex gap-2 mb-4">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Save name"
            className="flex-1 bg-void-800 border border-void-700 rounded px-2 py-1.5 text-sm text-void-100"
          />
          <button
            onClick={() => { saveToSlot(`slot_${Date.now()}`, label || 'Manual Save'); setLabel(''); }}
            className="px-3 py-1.5 rounded bg-sage-500 text-void-900 text-sm font-semibold hover:bg-sage-400"
          >
            Save New
          </button>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto mb-4">
          {slots.length === 0 && <div className="text-void-500 text-sm">No saves yet.</div>}
          {slots.slice().reverse().map((s) => (
            <div key={s.slot} className="flex items-center justify-between bg-void-800/70 rounded px-2.5 py-1.5 text-sm">
              <div>
                <div className="text-void-100">{s.label}</div>
                <div className="text-void-500 text-xs">{s.dateLabel} &middot; {s.playerCode} &middot; {new Date(s.savedAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => { loadFromSlot(s.slot); onClose(); }} className="px-2 py-1 rounded bg-steel-800 text-steel-100 text-xs hover:bg-steel-700">Load</button>
                <button onClick={() => removeSlot(s.slot)} className="px-2 py-1 rounded bg-brick-900 text-brick-200 text-xs hover:bg-brick-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <button onClick={quitToMenu} className="px-3 py-1.5 rounded bg-void-800 text-void-300 text-sm hover:bg-void-700">Quit to Menu</button>
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-void-800 text-void-300 text-sm hover:bg-void-700">Close</button>
        </div>
      </div>
    </div>
  );
}
