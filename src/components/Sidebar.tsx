import { useGameStore } from '../store/gameStore';

const TABS = [
  { id: 'map', label: 'World Map', icon: '\u{1F30D}' },
  { id: 'economy', label: 'Economy', icon: '\u{1F4B0}' },
  { id: 'industry', label: 'Industry', icon: '\u{1F3ED}' },
  { id: 'politics', label: 'Politics', icon: '\u{1F3DB}️' },
  { id: 'military', label: 'Military', icon: '⚔️' },
  { id: 'procurement', label: 'Procurement', icon: '\u{1F529}' },
  { id: 'nuclear', label: 'Nuclear', icon: '☢️' },
  { id: 'diplomacy', label: 'Diplomacy', icon: '\u{1F91D}' },
  { id: 'colonies', label: 'Colonies', icon: '\u{1F3F4}' },
  { id: 'intelligence', label: 'Intelligence', icon: '\u{1F575}️' },
];

export default function Sidebar() {
  const activePanel = useGameStore((s) => s.activePanel);
  const setActivePanel = useGameStore((s) => s.setActivePanel);
  const world = useGameStore((s) => s.world)!;
  const c = world.countries[world.playerCode];
  const hasColonies = (c.colonies?.length ?? 0) > 0;

  return (
    <div className="w-48 shrink-0 bg-slate-950 border-r border-slate-800 py-3 flex flex-col gap-0.5 overflow-y-auto">
      {TABS.filter((t) => t.id !== 'colonies' || hasColonies).map((t) => (
        <button
          key={t.id}
          onClick={() => setActivePanel(t.id)}
          className={`text-left px-4 py-2 text-sm flex items-center gap-2.5 transition ${
            activePanel === t.id ? 'bg-amber-500/15 text-amber-300 border-r-2 border-amber-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
