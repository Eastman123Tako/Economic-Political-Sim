import { useState } from 'react';
import type { PlayableCode } from '../engine/types';
import { USA, SUN, GBR, FRA } from '../data/nationsData';
import { useGameStore } from '../store/gameStore';
import Panel from './ui/Panel';
import { listSaveSlots } from '../engine/save';

const NATIONS: { code: PlayableCode; flag: string; blurb: string; data: typeof USA }[] = [
  { code: 'USA', flag: '\u{1F1FA}\u{1F1F8}', blurb: 'Leader of the Free World. Vast industrial base, the dollar, and the atomic monopoly -- for now.', data: USA },
  { code: 'SUN', flag: '\u{1F1F7}\u{1F1FA}', blurb: 'The world\'s first socialist state. Command the planned economy and the Red Army as it rebuilds from war.', data: SUN },
  { code: 'GBR', flag: '\u{1F1EC}\u{1F1E7}', blurb: 'A victorious but exhausted empire. Balance the books, the Commonwealth, and a special relationship with Washington.', data: GBR },
  { code: 'FRA', flag: '\u{1F1EB}\u{1F1F7}', blurb: 'The Fourth Republic totters under colonial wars and coalition politics. Rebuild French grandeur.', data: FRA },
];

export default function NationSelect() {
  const [selected, setSelected] = useState<PlayableCode>('USA');
  const startGame = useGameStore((s) => s.startGame);
  const loadFromSlot = useGameStore((s) => s.loadFromSlot);
  const nation = NATIONS.find((n) => n.code === selected)!;
  const saves = listSaveSlots().sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  return (
    <div className="min-h-screen w-full bg-void-950 scanlines text-void-200 flex flex-col items-center px-6 py-10">
      <div className="text-[11px] uppercase tracking-[0.35em] text-sage-500 mb-2">Grand Strategy Simulation</div>
      <h1 className="text-5xl font-bold tracking-tight text-void-100">THE COLD WAR</h1>
      <div className="flex items-center gap-3 mt-2 mb-10">
        <span className="h-px w-10 bg-sage-700" />
        <p className="text-lg text-sage-300 tracking-[0.3em]">1949 &ndash; 1991</p>
        <span className="h-px w-10 bg-sage-700" />
      </div>

      {saves.length > 0 && (
        <Panel title="Continue" className="w-full max-w-4xl mb-6">
          <div className="flex flex-wrap gap-2">
            {saves.slice(0, 4).map((s) => (
              <button
                key={s.slot}
                onClick={() => loadFromSlot(s.slot)}
                className="px-3 py-2 rounded-sm border border-void-700 bg-void-900/60 hover:border-sage-600 text-left text-xs"
              >
                <div className="text-void-100 font-medium">{s.label}</div>
                <div className="text-void-500">{s.dateLabel} &middot; {s.playerCode}</div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      <div className="text-[11px] uppercase tracking-[0.18em] text-void-500 mb-2 w-full max-w-4xl">Choose Your Nation</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
        {NATIONS.map((n) => (
          <button
            key={n.code}
            onClick={() => setSelected(n.code)}
            className={`brackets rounded-sm border p-4 text-left transition ${
              selected === n.code ? 'border-sage-400 bg-gradient-to-br from-sage-800/40 to-sage-900/10' : 'border-void-700 bg-void-900/50 hover:border-void-500'
            }`}
          >
            <div className="text-3xl mb-2">{n.flag}</div>
            <div className="font-semibold text-void-100">{n.data.name}</div>
          </button>
        ))}
      </div>

      <Panel className="w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{nation.flag}</span>
          <h2 className="text-2xl font-semibold text-void-100">{nation.data.name}, January 1949</h2>
        </div>
        <p className="text-void-400 mb-5">{nation.blurb}</p>
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
      </Panel>

      <button
        onClick={() => startGame(selected)}
        className="mt-8 px-10 py-3 rounded-sm bg-sage-500 hover:bg-sage-400 text-void-950 font-bold text-lg tracking-wide transition"
      >
        Start Simulation
      </button>
      <p className="text-void-600 text-xs mt-4 max-w-lg text-center">
        Time advances month by month from January 1949. History can happen -- or you can change it.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-void-500 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-void-100 font-medium">{value}</div>
    </div>
  );
}
