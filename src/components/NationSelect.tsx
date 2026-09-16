import { useState } from 'react';
import type { PlayableCode } from '../engine/types';
import { USA, SUN, GBR, FRA } from '../data/nationsData';
import { useGameStore } from '../store/gameStore';

const NATIONS: { code: PlayableCode; flag: string; blurb: string; data: typeof USA }[] = [
  { code: 'USA', flag: '\u{1F1FA}\u{1F1F8}', blurb: 'Leader of the Free World. Vast industrial base, the dollar, and the atomic monopoly -- for now.', data: USA },
  { code: 'SUN', flag: '\u{1F1F7}\u{1F1FA}', blurb: 'The world\'s first socialist state. Command the planned economy and the Red Army as it rebuilds from war.', data: SUN },
  { code: 'GBR', flag: '\u{1F1EC}\u{1F1E7}', blurb: 'A victorious but exhausted empire. Balance the books, the Commonwealth, and a special relationship with Washington.', data: GBR },
  { code: 'FRA', flag: '\u{1F1EB}\u{1F1F7}', blurb: 'The Fourth Republic totters under colonial wars and coalition politics. Rebuild French grandeur.', data: FRA },
];

export default function NationSelect() {
  const [selected, setSelected] = useState<PlayableCode>('USA');
  const startGame = useGameStore((s) => s.startGame);
  const nation = NATIONS.find((n) => n.code === selected)!;

  return (
    <div className="min-h-screen w-full bg-[#0b0e14] text-slate-200 flex flex-col items-center px-6 py-10">
      <h1 className="text-5xl font-bold tracking-tight text-slate-100">THE COLD WAR</h1>
      <p className="text-xl text-slate-400 mt-1 mb-10 tracking-widest">1949 &ndash; 1991</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
        {NATIONS.map((n) => (
          <button
            key={n.code}
            onClick={() => setSelected(n.code)}
            className={`rounded-lg border p-4 text-left transition ${
              selected === n.code ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
            }`}
          >
            <div className="text-3xl mb-2">{n.flag}</div>
            <div className="font-semibold text-slate-100">{n.data.name}</div>
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl bg-slate-900/60 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{nation.flag}</span>
          <h2 className="text-2xl font-semibold text-slate-100">{nation.data.name}, January 1949</h2>
        </div>
        <p className="text-slate-400 mb-5">{nation.blurb}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <Stat label="GDP" value={`$${nation.data.economy.gdpBillion.toFixed(0)}B`} />
          <Stat label="Population" value={`${nation.data.economy.populationMillion.toFixed(1)}M`} />
          <Stat label="Defense Spending" value={`$${nation.data.budget.spending.defense.toFixed(1)}B/yr`} />
          <Stat label="Military Personnel" value={`${nation.data.military.totalPersonnelThousands.toFixed(0)}k`} />
          <Stat label="Government" value={nation.data.politics.rulingPartyId === 'cpsu' ? 'Communist Party' : nation.data.politics.parties.find((p) => p.inGovernment)?.name ?? '--'} />
          <Stat label="Leader" value={nation.data.politics.headOfGovernment} />
          <Stat label="Alignment" value={nation.data.alignment === 'NATO' ? 'NATO Founding Member' : nation.data.alignment === 'WarsawPact' ? 'Communist Bloc' : nation.data.alignment} />
          <Stat label="Nuclear Status" value={nation.data.nuclear.hasNuclearWeapons ? `${nation.data.nuclear.warheads} warheads` : 'None (yet)'} />
        </div>
      </div>

      <button
        onClick={() => startGame(selected)}
        className="mt-8 px-10 py-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg tracking-wide transition"
      >
        Start Simulation
      </button>
      <p className="text-slate-600 text-xs mt-4 max-w-lg text-center">
        Time advances month by month from January 1949. History can happen -- or you can change it.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-500 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-slate-100 font-medium">{value}</div>
    </div>
  );
}
