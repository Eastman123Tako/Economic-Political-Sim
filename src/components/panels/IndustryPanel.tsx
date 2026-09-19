import { useGameStore } from '../../store/gameStore';
import type { IndustrialInvestment, IndustrySector } from '../../engine/types';
import { INDUSTRY_SECTORS } from '../../engine/factory';

const SECTOR_LABELS: Record<IndustrySector, string> = {
  steel: 'Steel', aluminum: 'Aluminum', coal: 'Coal', oil: 'Oil', naturalGas: 'Natural Gas',
  electricity: 'Electricity', machinery: 'Machinery', automobiles: 'Automobiles', aircraft: 'Aircraft',
  shipbuilding: 'Shipbuilding', electronics: 'Electronics', chemicals: 'Chemicals',
  consumerGoods: 'Consumer Goods', food: 'Food', precisionManufacturing: 'Precision Manufacturing',
};

const TEMPLATES: Omit<IndustrialInvestment, 'monthsRemaining'>[] = [
  { id: 'electronics_initiative', name: 'National Electronics Initiative', sector: 'electronics', annualCostBillion: 2.4, capacityBonusPct: 25, civConsumptionPenaltyPct: 4 },
  { id: 'steel_expansion', name: 'Steel Capacity Expansion', sector: 'steel', annualCostBillion: 1.6, capacityBonusPct: 20, civConsumptionPenaltyPct: 2 },
  { id: 'automotive_modernization', name: 'Automotive Sector Modernization', sector: 'automobiles', annualCostBillion: 1.2, capacityBonusPct: 18, civConsumptionPenaltyPct: 1 },
  { id: 'shipyard_program', name: 'Shipyard Investment Program', sector: 'shipbuilding', annualCostBillion: 1.0, capacityBonusPct: 22, civConsumptionPenaltyPct: 2 },
  { id: 'energy_grid', name: 'National Electrification Program', sector: 'electricity', annualCostBillion: 1.8, capacityBonusPct: 20, civConsumptionPenaltyPct: 0 },
  { id: 'chemicals_plants', name: 'Petrochemical Complex Program', sector: 'chemicals', annualCostBillion: 1.4, capacityBonusPct: 22, civConsumptionPenaltyPct: 3 },
  { id: 'precision_manufacturing', name: 'Precision Manufacturing Initiative', sector: 'precisionManufacturing', annualCostBillion: 2.0, capacityBonusPct: 24, civConsumptionPenaltyPct: 3 },
  { id: 'consumer_goods_drive', name: 'Consumer Goods Production Drive', sector: 'consumerGoods', annualCostBillion: 1.1, capacityBonusPct: 20, civConsumptionPenaltyPct: -6 },
];

export default function IndustryPanel() {
  const world = useGameStore((s) => s.world)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const c = world.countries[world.playerCode];

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-6">
      <div>
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold mb-3 pb-1 border-b border-void-800">Industrial Capacity (base 100 = Jan 1949)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDUSTRY_SECTORS.map((s) => (
            <div key={s} className="bg-void-900/60 border border-void-800 rounded px-3 py-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-void-400">{SECTOR_LABELS[s]}</span>
                <span className="text-void-200 font-medium tabular-nums">{c.industry[s].toFixed(0)}</span>
              </div>
              <div className="h-1.5 bg-void-800 rounded overflow-hidden">
                <div className="h-full bg-sage-500" style={{ width: `${Math.min(100, c.industry[s] / 2)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold mb-1">Active Investment Programs</h3>
        {c.industrialInvestments.length === 0 && <div className="text-void-500 text-sm mb-3">None active.</div>}
        <div className="space-y-1.5 mb-4">
          {c.industrialInvestments.map((inv) => (
            <div key={inv.id} className="flex justify-between items-center bg-void-900/60 border border-void-800 rounded px-3 py-2 text-sm">
              <span className="text-void-200">{inv.name}</span>
              <span className="text-void-500">{inv.monthsRemaining} months remaining &middot; ${inv.annualCostBillion.toFixed(1)}B/yr</span>
            </div>
          ))}
        </div>

        <h3 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold mb-2 pb-1 border-b border-void-800">Launch New Program</h3>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {TEMPLATES.map((t) => {
            const active = c.industrialInvestments.some((i) => i.id === t.id);
            return (
              <div key={t.id} className="bg-void-900/60 border border-void-800 rounded p-3 text-sm">
                <div className="text-void-100 font-medium mb-1">{t.name}</div>
                <div className="text-void-500 text-xs mb-2">
                  Sector: {SECTOR_LABELS[t.sector]} &middot; ${t.annualCostBillion.toFixed(1)}B/yr &middot; +{t.capacityBonusPct}% capacity
                  {t.civConsumptionPenaltyPct !== 0 && (t.civConsumptionPenaltyPct > 0 ? ' · consumer goods cost' : ' · boosts consumer goods')}
                </div>
                <button
                  disabled={active}
                  onClick={() => dispatch({ type: 'startIndustrialInvestment', investment: { ...t, monthsRemaining: 24 } })}
                  className={`px-3 py-1 rounded text-xs font-semibold ${active ? 'bg-void-800 text-void-600' : 'bg-sage-500 text-void-900 hover:bg-sage-400'}`}
                >
                  {active ? 'Active' : 'Fund Program'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
