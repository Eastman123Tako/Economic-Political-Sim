import { useGameStore } from '../../store/gameStore';

export default function IntelligencePanel() {
  const world = useGameStore((s) => s.world)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const c = world.countries[world.playerCode];
  const intel = c.intelligence;
  if (!intel) return null;

  const rivals = Object.values(world.countries).filter((o) => o.isMajor && o.code !== c.code);

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h3 className="text-slate-100 font-semibold mb-3">{intel.agencyName}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
          <Metric label="Capability" value={`${intel.capabilityIndex.toFixed(0)}/100`} />
          <Metric label="Budget" value={`$${intel.budgetBillion.toFixed(2)}B/yr`} />
        </div>
        <div className="grid grid-cols-[8rem_1fr_4.5rem] items-center gap-3 text-sm">
          <span className="text-slate-400">Annual Budget</span>
          <input
            type="range" min={0} max={2} step={0.02} value={intel.budgetBillion}
            onChange={(e) => dispatch({ type: 'setIntelBudget', billion: parseFloat(e.target.value) })}
            className="w-full accent-amber-500"
          />
          <span className="text-slate-200 text-right tabular-nums">${intel.budgetBillion.toFixed(2)}B</span>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h3 className="text-slate-100 font-semibold mb-3">Knowledge of Rival Powers</h3>
        <p className="text-slate-500 text-xs mb-3">
          Higher accuracy means the figures you see for that nation's economy and military are closer to
          their true values. Low accuracy means published figures may be substantially over- or understated.
        </p>
        <div className="space-y-2">
          {rivals.map((r) => {
            const accuracy = intel.intelAccuracy[r.code] ?? 30;
            return (
              <div key={r.code} className="flex items-center gap-3 text-sm">
                <span className="w-32 text-slate-200">{r.name}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded overflow-hidden">
                  <div className={`h-full ${accuracy > 60 ? 'bg-emerald-500' : accuracy > 35 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${accuracy}%` }} />
                </div>
                <span className="w-10 text-right tabular-nums text-slate-400">{accuracy.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/50 border border-slate-800 rounded px-3 py-2">
      <div className="text-slate-500 text-xs">{label}</div>
      <div className="font-semibold tabular-nums text-slate-100">{value}</div>
    </div>
  );
}
