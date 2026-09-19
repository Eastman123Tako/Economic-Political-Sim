import { useEffect, useState } from 'react';
import { useGameStore, SPEED_INTERVAL_MS, type GameSpeed } from '../store/gameStore';
import { formatDate } from '../engine/time';
import SaveLoadMenu from './SaveLoadMenu';

function fmtB(v: number) { return `$${v.toFixed(1)}B`; }
function fmtPct(v: number) { return `${v.toFixed(1)}%`; }

const SPEEDS: { id: GameSpeed; label: string }[] = [
  { id: 'paused', label: 'Pause' },
  { id: 'normal', label: 'Play' },
  { id: 'fast', label: 'Fast' },
  { id: 'veryfast', label: '2x Fast' },
];

export default function TopBar() {
  const world = useGameStore((s) => s.world)!;
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const togglePause = useGameStore((s) => s.togglePause);
  const tick = useGameStore((s) => s.tick);
  const setReportOpen = useGameStore((s) => s.setReportOpen);
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    const ms = SPEED_INTERVAL_MS[speed];
    if (ms === null) return;
    const id = setInterval(() => useGameStore.getState().tick(), ms);
    return () => clearInterval(id);
  }, [speed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause]);

  const c = world.countries[world.playerCode];
  const e = c.economy;
  const b = c.budget;

  return (
    <div className="w-full bg-void-950 border-b border-sage-900/60 px-4 py-2 flex items-center gap-5 text-sm flex-wrap">
      <div className="flex items-center gap-2 pr-3 border-r border-void-800">
        <span className="w-1.5 h-6 bg-sage-500" />
        <div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-void-600 leading-none">{c.name}</div>
          <div className="font-bold text-sage-300 whitespace-nowrap tabular-nums leading-tight">{formatDate(world.date)}</div>
        </div>
      </div>

      <Stat label="GDP" value={fmtB(e.gdpBillion)} />
      <Stat label="Growth" value={fmtPct(e.gdpGrowthPct)} tone={e.gdpGrowthPct >= 0 ? 'good' : 'bad'} />
      <Stat label="Treasury Balance" value={fmtB(b.balance)} tone={b.balance >= 0 ? 'good' : 'bad'} />
      <Stat label="Debt" value={`${fmtB(b.debtBillion)} (${b.debtToGdpPct.toFixed(0)}% GDP)`} />
      <Stat label="Inflation" value={fmtPct(e.inflationPct)} tone={e.inflationPct > 8 ? 'bad' : 'neutral'} />
      <Stat label="Unemployment" value={fmtPct(e.unemploymentPct)} tone={e.unemploymentPct > 8 ? 'bad' : 'neutral'} />
      <Stat label="Approval" value={`${c.politics.approvalPct.toFixed(0)}%`} tone={c.politics.approvalPct >= 45 ? 'good' : 'bad'} />
      <Stat label="Defense" value={fmtB(b.spending.defense)} />

      <div className="ml-auto flex items-center gap-1.5">
        <div className="flex rounded-sm overflow-hidden border border-void-700">
          {SPEEDS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSpeed(s.id)}
              title={s.id === 'paused' ? 'Space to toggle' : undefined}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors ${i > 0 ? 'border-l border-void-700' : ''} ${
                speed === s.id ? 'bg-sage-600 text-void-950' : 'bg-void-900 text-void-300 hover:bg-void-800 hover:text-sage-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={() => tick()} className="px-2.5 py-1 text-xs rounded-sm font-semibold border border-void-700 bg-void-900 text-void-300 hover:bg-void-800 hover:text-sage-200">+1 Mo</button>
        <button onClick={() => setReportOpen(true)} className="ml-1.5 px-2.5 py-1 text-xs rounded-sm font-semibold border border-steel-700 bg-steel-900/60 text-steel-200 hover:bg-steel-800">Report</button>
        <button onClick={() => setSaveOpen(true)} className="px-2.5 py-1 text-xs rounded-sm font-semibold border border-void-700 bg-void-900 text-void-300 hover:bg-void-800">Save/Load</button>
        <button onClick={() => setHelpOpen(true)} title="Field Manual" className="w-7 h-7 flex items-center justify-center rounded-sm font-bold border border-void-700 bg-void-900 text-sage-400 hover:bg-void-800">?</button>
      </div>
      {saveOpen && <SaveLoadMenu onClose={() => setSaveOpen(false)} />}
      {world.gameOver && (
        <div className="w-full text-center bg-sage-900/40 border border-sage-700 text-sage-200 rounded-sm px-3 py-1 text-xs mt-1">
          {world.gameOverReason}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const color = tone === 'good' ? 'text-sage-400' : tone === 'bad' ? 'text-brick-400' : 'text-void-100';
  return (
    <div className="whitespace-nowrap tabular-nums leading-tight">
      <div className="text-void-600 text-[9px] uppercase tracking-wide">{label}</div>
      <div className={`font-semibold ${color}`}>{value}</div>
    </div>
  );
}
