import { useGameStore } from '../../store/gameStore';
import type { ColonialStrategy } from '../../engine/types';

const STRATEGIES: { id: ColonialStrategy; label: string }[] = [
  { id: 'maintain', label: 'Maintain Colonial Rule' },
  { id: 'develop', label: 'Economic Development' },
  { id: 'autonomy', label: 'Grant Autonomy' },
  { id: 'negotiate', label: 'Negotiate Independence' },
  { id: 'repress', label: 'Military Repression' },
  { id: 'withdraw', label: 'Withdraw' },
];

export default function ColoniesPanel() {
  const world = useGameStore((s) => s.world)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const c = world.countries[world.playerCode];
  const colonies = c.colonies ?? [];

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-4">
      {colonies.length === 0 && <div className="text-void-500 text-sm">No colonial territories.</div>}
      {colonies.map((col) => (
        <div key={col.id} className="brackets bg-void-900/60 border border-void-700 rounded-sm p-4">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="text-void-100 font-semibold">{col.name}</h4>
            <span className="text-xs text-void-500">
              {col.independent ? `Independent since ${col.independenceDate?.month}/${col.independenceDate?.year}` : `${col.populationMillion.toFixed(1)}M population`}
            </span>
          </div>
          {!col.independent && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                <Stat label="Unrest" value={`${col.unrestIndex.toFixed(0)}/100`} bad={col.unrestIndex > 50} />
                <Stat label="Insurgency" value={col.insurgencyActive ? 'Active' : 'None'} bad={col.insurgencyActive} />
                <Stat label="Int'l Pressure" value={`${col.internationalPressureIndex.toFixed(0)}/100`} bad={col.internationalPressureIndex > 60} />
                <Stat label="Annual Cost" value={`$${col.annualCostBillion.toFixed(2)}B`} />
                <Stat label="Casualties (cum.)" value={col.cumulativeCasualties.toLocaleString()} />
                <Stat label="Months on Strategy" value={`${col.monthsUnderCurrentStrategy}`} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STRATEGIES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => dispatch({ type: 'setColonialStrategy', colonyId: col.id, strategy: s.id })}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${col.strategy === s.id ? 'bg-sage-500 text-void-900' : 'bg-void-800 text-void-300 hover:bg-void-700'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div>
      <div className="text-void-500">{label}</div>
      <div className={`font-medium ${bad ? 'text-brick-400' : 'text-void-200'}`}>{value}</div>
    </div>
  );
}
