import { useEffect, useState } from 'react';
import { useGameStore, SPEED_INTERVAL_MS, type GameSpeed } from '../store/gameStore';
import { formatDate } from '../engine/time';
import SaveLoadMenu from './SaveLoadMenu';

function fmtB(v: number) { return `$${v.toFixed(1)}B`; }
function fmtPct(v: number) { return `${v.toFixed(1)}%`; }

export default function TopBar() {
  const world = useGameStore((s) => s.world)!;
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const tick = useGameStore((s) => s.tick);
  const setReportOpen = useGameStore((s) => s.setReportOpen);
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    const ms = SPEED_INTERVAL_MS[speed];
    if (ms === null) return;
    const id = setInterval(() => useGameStore.getState().tick(), ms);
    return () => clearInterval(id);
  }, [speed]);

  const c = world.countries[world.playerCode];
  const e = c.economy;
  const b = c.budget;

  const speedBtn = (s: GameSpeed, label: string) => (
    <button
      onClick={() => setSpeed(s)}
      className={`px-2.5 py-1 text-xs rounded font-semibold transition ${speed === s ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center gap-5 text-sm flex-wrap">
      <div className="font-bold text-amber-400 whitespace-nowrap">{formatDate(world.date)}</div>
      <Stat label="GDP" value={fmtB(e.gdpBillion)} />
      <Stat label="Growth" value={fmtPct(e.gdpGrowthPct)} tone={e.gdpGrowthPct >= 0 ? 'good' : 'bad'} />
      <Stat label="Treasury Balance" value={fmtB(b.balance)} tone={b.balance >= 0 ? 'good' : 'bad'} />
      <Stat label="Debt" value={`${fmtB(b.debtBillion)} (${b.debtToGdpPct.toFixed(0)}% GDP)`} />
      <Stat label="Inflation" value={fmtPct(e.inflationPct)} tone={e.inflationPct > 8 ? 'bad' : 'neutral'} />
      <Stat label="Unemployment" value={fmtPct(e.unemploymentPct)} tone={e.unemploymentPct > 8 ? 'bad' : 'neutral'} />
      <Stat label="Approval" value={`${c.politics.approvalPct.toFixed(0)}%`} tone={c.politics.approvalPct >= 45 ? 'good' : 'bad'} />
      <Stat label="Defense" value={fmtB(b.spending.defense)} />

      <div className="ml-auto flex items-center gap-1.5">
        {speedBtn('paused', 'Pause')}
        <button onClick={() => tick()} className="px-2.5 py-1 text-xs rounded font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700">+1 Mo</button>
        {speedBtn('normal', 'Play')}
        {speedBtn('fast', 'Fast')}
        {speedBtn('veryfast', '2x Fast')}
        <button onClick={() => setReportOpen(true)} className="ml-2 px-2.5 py-1 text-xs rounded font-semibold bg-sky-800 text-sky-100 hover:bg-sky-700">Report</button>
        <button onClick={() => setSaveOpen(true)} className="px-2.5 py-1 text-xs rounded font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700">Save/Load</button>
      </div>
      {saveOpen && <SaveLoadMenu onClose={() => setSaveOpen(false)} />}
      {world.gameOver && (
        <div className="w-full text-center bg-amber-900/40 border border-amber-700 text-amber-200 rounded px-3 py-1 text-xs mt-1">
          {world.gameOverReason}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const color = tone === 'good' ? 'text-emerald-400' : tone === 'bad' ? 'text-rose-400' : 'text-slate-100';
  return (
    <div className="whitespace-nowrap tabular-nums">
      <span className="text-slate-500 text-xs mr-1">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}
