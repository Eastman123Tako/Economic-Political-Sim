import { useGameStore } from '../../store/gameStore';
import { procurementForNation } from '../../data/equipment';
import { canStartProgram } from '../../engine/procurement';

const CATEGORY_LABELS: Record<string, string> = {
  fighter: 'Fighter', bomber: 'Bomber', transport: 'Transport', helicopter: 'Helicopter',
  tank: 'Tank', ifv: 'IFV', artillery: 'Artillery',
  carrier: 'Carrier', destroyer: 'Destroyer', submarine: 'Submarine', ssbn: 'SSBN', frigate: 'Frigate',
  icbm: 'ICBM', slbm: 'SLBM', irbm: 'IRBM', radar: 'Radar', other: 'Other',
};

export default function ProcurementPanel() {
  const world = useGameStore((s) => s.world)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const c = world.countries[world.playerCode];
  const defs = procurementForNation(c.code);

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-3">
      <div className="text-sm text-slate-400 mb-2">
        Procurement budget: <span className="text-slate-200 font-medium">${c.military.procurementBudgetBillion.toFixed(1)}B/yr</span> &middot; Tech Index: <span className="text-slate-200 font-medium">{c.economy.techIndex.toFixed(0)}</span>
      </div>
      {defs.map((def) => {
        const inst = c.procurement.find((p) => p.defId === def.id);
        const check = canStartProgram(c, def.id, world.date.year);
        return (
          <div key={def.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-1">
              <div>
                <span className="text-slate-100 font-semibold">{def.name}</span>
                <span className="ml-2 text-xs text-slate-500">{CATEGORY_LABELS[def.category]} &middot; historically {def.historicalStartYear}</span>
              </div>
              {!inst && (
                <button
                  disabled={!check.ok}
                  title={check.reason}
                  onClick={() => dispatch({ type: 'startProcurement', defId: def.id })}
                  className={`px-3 py-1 rounded text-xs font-semibold ${check.ok ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                >
                  {check.ok ? 'Start Program' : check.reason}
                </button>
              )}
            </div>
            <p className="text-slate-500 text-xs mb-2">{def.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 mb-2">
              <span>Dev cost: ${def.developmentCostBillion.toFixed(1)}B / {def.developmentMonths}mo</span>
              <span>Unit cost: ${def.unitProductionCostMillion.toFixed(1)}M</span>
              <span>Max capacity: {def.annualProductionCapacity}/yr</span>
              <span>Export: {def.exportPotential}</span>
            </div>

            {inst && inst.status !== 'cancelled' && (
              <div className="border-t border-slate-800 pt-2 mt-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className={`font-medium ${inst.status === 'production' ? 'text-emerald-400' : 'text-sky-400'}`}>
                    {inst.status === 'development' ? `In development (${inst.monthsElapsed.toFixed(0)}/${def.developmentMonths}mo)` : `In production -- ${inst.unitsInService.toFixed(0)} units in service`}
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'cancelProcurement', defId: def.id })}
                    className="px-2 py-0.5 rounded text-xs bg-rose-900 text-rose-200 hover:bg-rose-800"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-[6rem_1fr_3.5rem] items-center gap-2 text-xs">
                  <span className="text-slate-500">Funding</span>
                  <input
                    type="range" min={0} max={200} step={5} value={inst.fundingLevelPct}
                    onChange={(e) => dispatch({ type: 'setProcurementFunding', defId: def.id, fundingLevelPct: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-slate-300 text-right tabular-nums">{inst.fundingLevelPct.toFixed(0)}%</span>
                </div>
                {inst.status === 'production' && def.exportPotential !== 'none' && (
                  <div className="mt-2 text-xs text-slate-500">Export potential: {def.exportPotential} (assign via Diplomacy relations once exportable units accrue)</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
