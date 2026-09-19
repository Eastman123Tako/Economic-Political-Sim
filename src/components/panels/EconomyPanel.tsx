import { useGameStore } from '../../store/gameStore';
import type { BudgetSpending, TaxRates, PlannedEconomyState } from '../../engine/types';
import Panel from '../ui/Panel';

const SPENDING_FIELDS: { key: keyof BudgetSpending; label: string }[] = [
  { key: 'defense', label: 'Defense' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'education', label: 'Education' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'welfare', label: 'Welfare' },
  { key: 'pensions', label: 'Pensions' },
  { key: 'foreignAid', label: 'Foreign Aid' },
  { key: 'research', label: 'Research' },
  { key: 'administration', label: 'Administration' },
  { key: 'subsidies', label: 'Subsidies' },
  { key: 'other', label: 'Other' },
];

const TAX_FIELDS: { key: keyof TaxRates; label: string }[] = [
  { key: 'incomeTaxPct', label: 'Income Tax' },
  { key: 'corporateTaxPct', label: 'Corporate Tax' },
  { key: 'salesTaxPct', label: 'Sales / Consumption Tax' },
  { key: 'tariffPct', label: 'Tariffs' },
  { key: 'payrollTaxPct', label: 'Payroll Tax' },
];

const PLANNED_FIELDS: { key: keyof PlannedEconomyState; label: string }[] = [
  { key: 'investmentSharePct', label: 'Investment' },
  { key: 'heavyIndustrySharePct', label: 'Heavy Industry' },
  { key: 'lightIndustrySharePct', label: 'Light Industry / Consumer Goods' },
  { key: 'agricultureSharePct', label: 'Agriculture' },
  { key: 'defenseSharePct', label: 'Defense' },
  { key: 'administrationSharePct', label: 'Administration' },
];

export default function EconomyPanel() {
  const world = useGameStore((s) => s.world)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const c = world.countries[world.playerCode];
  const e = c.economy;
  const b = c.budget;

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-6">
      <div className="text-[11px] uppercase tracking-[0.14em] text-sage-500 mb-2">Macroeconomic Indicators</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="GDP" value={`$${e.gdpBillion.toFixed(1)}B`} />
        <Metric label="GDP / Capita" value={`$${e.gdpPerCapita.toFixed(0)}`} />
        <Metric label="Growth (annualized)" value={`${e.gdpGrowthPct.toFixed(1)}%`} />
        <Metric label="Inflation" value={`${e.inflationPct.toFixed(1)}%`} />
        <Metric label="Unemployment" value={`${e.unemploymentPct.toFixed(1)}%`} />
        <Metric label="Interest Rate" value={`${e.interestRatePct.toFixed(1)}%`} />
        <Metric label="Exports" value={`$${e.exportsBillion.toFixed(1)}B`} />
        <Metric label="Imports" value={`$${e.importsBillion.toFixed(1)}B`} />
        <Metric label="Current Account" value={`$${e.currentAccountBillion.toFixed(1)}B`} />
        <Metric label="Foreign Reserves" value={`$${e.foreignReservesBillion.toFixed(1)}B`} />
        <Metric label="Infrastructure Index" value={e.infrastructureIndex.toFixed(0)} />
        <Metric label="Tech Index" value={e.techIndex.toFixed(0)} />
      </div>

      <Panel title="Government Budget">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
          <Metric label="Revenue" value={`$${b.totalRevenue.toFixed(1)}B`} />
          <Metric label="Spending" value={`$${b.totalSpending.toFixed(1)}B`} />
          <Metric label="Balance" value={`$${b.balance.toFixed(1)}B`} tone={b.balance >= 0 ? 'good' : 'bad'} />
          <Metric label="Debt / GDP" value={`${b.debtToGdpPct.toFixed(0)}%`} tone={b.debtToGdpPct > 100 ? 'bad' : 'neutral'} />
        </div>

        {c.economyType !== 'planned' ? (
          <>
            <h4 className="text-xs uppercase tracking-wide text-void-500 mb-2">Tax Rates</h4>
            <div className="space-y-2 mb-4">
              {TAX_FIELDS.map((f) => (
                <Slider
                  key={f.key}
                  label={f.label}
                  value={b.taxRates[f.key]}
                  min={0} max={80} step={0.5}
                  format={(v) => `${v.toFixed(1)}%`}
                  onChange={(v) => dispatch({ type: 'setTaxRate', field: f.key, value: v })}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h4 className="text-xs uppercase tracking-wide text-void-500 mb-2">Gosplan Allocation (% of National Income)</h4>
            <div className="space-y-2 mb-4">
              {PLANNED_FIELDS.map((f) => (
                <Slider
                  key={f.key}
                  label={f.label}
                  value={c.planned![f.key] as number}
                  min={0} max={50} step={0.5}
                  format={(v) => `${v.toFixed(1)}%`}
                  onChange={(v) => dispatch({ type: 'setPlannedShare', field: f.key, value: v })}
                />
              ))}
              <div className="text-xs text-void-500 pt-1">
                Five-Year Plan target growth: {c.planned!.fiveYearPlanTarget.toFixed(0)}% &middot; Planner efficiency: {c.planned!.plannerEfficiencyIndex.toFixed(0)}/100
              </div>
            </div>
          </>
        )}

        <h4 className="text-xs uppercase tracking-wide text-void-500 mb-2">Spending (Billions / Year)</h4>
        <div className="space-y-2">
          {SPENDING_FIELDS.map((f) => (
            <Slider
              key={f.key}
              label={f.label}
              value={b.spending[f.key]}
              min={0} max={Math.max(20, e.gdpBillion * 0.4)} step={0.1}
              format={(v) => `$${v.toFixed(1)}B`}
              onChange={(v) => dispatch({ type: 'setSpending', field: f.key, value: v })}
            />
          ))}
          <div className="flex justify-between text-sm pt-1 text-void-400">
            <span>Interest Payments (computed)</span>
            <span>${b.spending.interestPayments.toFixed(1)}B</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const color = tone === 'good' ? 'text-sage-400' : tone === 'bad' ? 'text-brick-400' : 'text-void-100';
  return (
    <div className="bg-void-900/60 border border-void-800 rounded px-3 py-2">
      <div className="text-void-500 text-xs">{label}</div>
      <div className={`font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[9rem_1fr_4.5rem] items-center gap-3 text-sm">
      <span className="text-void-400">{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-sage-500"
      />
      <span className="text-void-200 text-right tabular-nums">{format(value)}</span>
    </div>
  );
}
