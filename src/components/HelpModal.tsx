import { useGameStore } from '../store/gameStore';

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: 'Time Controls',
    items: [
      'Pause / Play / Fast / 2x Fast advance the simulation continuously at different speeds.',
      '+1 Mo advances exactly one month while paused, for careful turn-by-turn play.',
      'Space bar toggles Pause <-> Play from anywhere.',
      'The simulation auto-pauses and opens the Monthly Report whenever a major historical event fires, so you never miss one at high speed.',
    ],
  },
  {
    title: 'Reading the Top Bar',
    items: [
      'GDP, Growth, Treasury Balance, Debt, Inflation, Unemployment, Approval, and Defense spending update live for your nation.',
      'Green values are favorable, brick-red values need attention.',
      'Click Report at any time to see the latest Monthly Report and recent history.',
    ],
  },
  {
    title: 'Running Your Nation',
    items: [
      'Economy: set tax rates (or Gosplan allocation shares if playing the USSR) and spending levels. Revenue and growth respond automatically -- there is no "correct" budget, only trade-offs.',
      'Industry: fund national investment programs to expand specific sectors (steel, electronics, shipbuilding...) at the cost of some consumer-goods availability while underway.',
      'Politics: watch approval, unrest, and (for multi-party systems) coalition stability. Elections fire automatically on schedule and are decided by simulated support, not scripted outcomes -- your policies decide the winner.',
      'Military & Procurement: fund historical weapons programs once your Tech Index and the calendar allow them, then tune each program\'s funding level to accelerate, slow, or fully staff it. Cancel a program any time.',
      'Nuclear: once you cross the historical threshold, choose a doctrine (Massive Retaliation, Flexible Response, No First Use, ...) -- delivery systems accrue automatically from relevant procurement programs.',
      'Diplomacy: track relations with every other nation, sanction or cooperate, and direct foreign aid to allies.',
      'Colonies (UK & France): choose a strategy per territory -- maintain, develop, grant autonomy, negotiate, repress, or withdraw -- each with different costs, unrest, and independence timelines.',
      'Intelligence: fund your agency to improve how accurately you can read rival nations\' true statistics.',
    ],
  },
  {
    title: 'The World Map',
    items: [
      'Countries are colored by bloc alignment: steel-blue NATO, brick-red Warsaw Pact, sage-green Non-Aligned, khaki Other.',
      'Click any country for a detail drawer: economy, government, military, trade, and (for nations you have relations data on) your bilateral relationship.',
      'Your own nation is always outlined in bright celadon.',
    ],
  },
  {
    title: 'Philosophy',
    items: [
      'Nothing here is scripted to happen no matter what you do. Historical events check the live state of the world before firing, so different policy choices produce a genuinely different 1949-1991.',
      'Growth, elections, and military strength are computed from your decisions, not randomized -- the same choices will produce the same outcome.',
    ],
  },
];

export default function HelpModal() {
  const setHelpOpen = useGameStore((s) => s.setHelpOpen);
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setHelpOpen(false)}>
      <div className="brackets bg-void-900 border border-void-700 rounded-sm w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 bg-sage-500" />
            <h3 className="text-xl font-bold text-void-100 uppercase tracking-wide">Field Manual</h3>
          </div>
          <button onClick={() => setHelpOpen(false)} className="text-void-500 hover:text-void-200 text-xl leading-none">&times;</button>
        </div>
        <div className="space-y-5">
          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <h4 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold mb-1.5 border-b border-void-800 pb-1">{sec.title}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-void-300">
                {sec.items.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
