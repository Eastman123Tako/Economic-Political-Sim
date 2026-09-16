import { useGameStore } from '../../store/gameStore';

export default function MilitaryPanel() {
  const world = useGameStore((s) => s.world)!;
  const c = world.countries[world.playerCode];
  const m = c.military;

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Total Personnel" value={`${m.totalPersonnelThousands.toFixed(0)}k`} />
        <Metric label="Procurement Budget" value={`$${m.procurementBudgetBillion.toFixed(1)}B/yr`} />
        <Metric label="Research Budget" value={`$${m.researchBudgetBillion.toFixed(1)}B/yr`} />
        <Metric label="Conscription" value={m.conscription ? 'Active' : 'Volunteer Force'} />
      </div>

      <div className="space-y-3">
        {m.branches.map((b) => (
          <div key={b.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-baseline mb-2">
              <h4 className="text-slate-100 font-semibold">{b.name}</h4>
              <span className="text-slate-400 text-sm">{b.personnelThousands.toFixed(0)}k personnel</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <Bar label="Readiness" value={b.readinessPct} />
              <Bar label="Training" value={b.trainingPct} />
              <Bar label="Equip. Modernity" value={b.equipmentModernityPct} />
              <Bar label="Logistics" value={b.logisticsPct} />
              <Bar label="Morale" value={b.moraleePct} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <h3 className="text-slate-100 font-semibold mb-2">Overseas Bases</h3>
        {m.overseasBases.length === 0 && <div className="text-slate-500 text-sm">No overseas bases.</div>}
        <div className="flex flex-wrap gap-1.5">
          {m.overseasBases.map((code) => {
            const country = world.countries[code];
            return <span key={code} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">{country?.name ?? code}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded px-3 py-2">
      <div className="text-slate-500 text-xs">{label}</div>
      <div className="font-semibold tabular-nums text-slate-100">{value}</div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const color = value >= 65 ? 'bg-emerald-500' : value >= 35 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div>
      <div className="flex justify-between text-slate-500 mb-1">
        <span>{label}</span>
        <span className="text-slate-300">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
