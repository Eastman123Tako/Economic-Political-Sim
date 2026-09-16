import { useGameStore } from '../store/gameStore';
import { formatDate } from '../engine/time';

export default function ReportModal() {
  const world = useGameStore((s) => s.world)!;
  const setReportOpen = useGameStore((s) => s.setReportOpen);
  const reports = world.monthlyReports.slice(-12).reverse();
  const latest = reports[0];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setReportOpen(false)}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-100">Monthly Report</h3>
          <button onClick={() => setReportOpen(false)} className="text-slate-500 hover:text-slate-300 text-xl">&times;</button>
        </div>

        {!latest && <div className="text-slate-500">No reports yet -- advance the clock to generate one.</div>}

        {latest && (
          <div className="mb-6 border border-slate-800 rounded-lg p-4 bg-slate-950/50">
            <div className="text-amber-400 font-semibold mb-2">{latest.headline}</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
              <Row label="GDP" value={`$${latest.economy.gdpBillion.toFixed(1)}B`} />
              <Row label="Growth" value={`${latest.economy.gdpGrowthPct.toFixed(1)}%`} />
              <Row label="Inflation" value={`${latest.economy.inflationPct.toFixed(1)}%`} />
              <Row label="Unemployment" value={`${latest.economy.unemploymentPct.toFixed(1)}%`} />
              <Row label="Revenue" value={`$${latest.budget.totalRevenue.toFixed(1)}B`} />
              <Row label="Spending" value={`$${latest.budget.totalSpending.toFixed(1)}B`} />
              <Row label="Balance" value={`$${latest.budget.balance.toFixed(1)}B`} />
              <Row label="Debt" value={`$${latest.budget.debtBillion.toFixed(1)}B`} />
              <Row label="Approval" value={`${latest.approvalPct.toFixed(0)}%`} />
            </div>
            {latest.bullets.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                {latest.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
            {latest.bullets.length === 0 && <div className="text-slate-500 text-sm">No major developments this month.</div>}
          </div>
        )}

        {reports.length > 1 && (
          <>
            <h4 className="text-sm uppercase tracking-wide text-slate-500 mb-2">Recent History</h4>
            <div className="space-y-2">
              {reports.slice(1).map((r) => (
                <div key={`${r.date.year}-${r.date.month}`} className="text-sm border-l-2 border-slate-800 pl-3">
                  <div className="text-slate-400 font-medium">{formatDate(r.date)}</div>
                  {r.bullets.length > 0
                    ? <div className="text-slate-500">{r.bullets[0]}{r.bullets.length > 1 ? ` (+${r.bullets.length - 1} more)` : ''}</div>
                    : <div className="text-slate-600 italic">Quiet month.</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
