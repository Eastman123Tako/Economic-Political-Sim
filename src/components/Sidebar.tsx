import { useGameStore } from '../store/gameStore';
import TileButton from './ui/TileButton';

const TABS = [
  { id: 'map', label: 'World Map', sub: 'Theater overview', icon: '\u{1F30D}' },
  { id: 'economy', label: 'Economy', sub: 'Budget & taxation', icon: '\u{1F4B0}' },
  { id: 'industry', label: 'Industry', sub: 'Capacity & investment', icon: '\u{1F3ED}' },
  { id: 'politics', label: 'Politics', sub: 'Government & elections', icon: '\u{1F3DB}️' },
  { id: 'military', label: 'Military', sub: 'Forces & readiness', icon: '⚔️' },
  { id: 'procurement', label: 'Procurement', sub: 'Weapons programs', icon: '\u{1F529}' },
  { id: 'nuclear', label: 'Nuclear', sub: 'Arsenal & doctrine', icon: '☢️' },
  { id: 'technology', label: 'Technology', sub: 'Research posture', icon: '\u{1F52C}' },
  { id: 'diplomacy', label: 'Diplomacy', sub: 'Relations & aid', icon: '\u{1F91D}' },
  { id: 'colonies', label: 'Colonies', sub: 'Overseas territories', icon: '\u{1F3F4}' },
  { id: 'intelligence', label: 'Intelligence', sub: 'Espionage & fog of war', icon: '\u{1F575}️' },
];

export default function Sidebar() {
  const activePanel = useGameStore((s) => s.activePanel);
  const setActivePanel = useGameStore((s) => s.setActivePanel);
  const world = useGameStore((s) => s.world)!;
  const c = world.countries[world.playerCode];
  const hasColonies = (c.colonies?.length ?? 0) > 0;

  return (
    <div className="w-56 shrink-0 bg-void-950 border-r border-void-800 py-3 px-2 flex flex-col gap-1 overflow-y-auto">
      <div className="text-[10px] uppercase tracking-[0.18em] text-void-600 px-2 pb-1">Command Menu</div>
      {TABS.filter((t) => t.id !== 'colonies' || hasColonies).map((t) => (
        <TileButton
          key={t.id}
          icon={t.icon}
          label={t.label}
          sub={t.sub}
          active={activePanel === t.id}
          onClick={() => setActivePanel(t.id)}
        />
      ))}
    </div>
  );
}
