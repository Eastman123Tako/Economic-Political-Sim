import { useGameStore } from '../../store/gameStore';
import { formatDate } from '../../engine/time';

export default function PoliticsPanel() {
  const world = useGameStore((s) => s.world)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const c = world.countries[world.playerCode];
  const p = c.politics;

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Approval" value={`${p.approvalPct.toFixed(0)}%`} tone={p.approvalPct >= 45 ? 'good' : 'bad'} />
        <Metric label="Stability" value={`${c.stabilityIndex.toFixed(0)}/100`} />
        <Metric label="Unrest" value={`${p.unrestIndex.toFixed(0)}/100`} tone={p.unrestIndex > 40 ? 'bad' : 'neutral'} />
        <Metric label="Coalition Stability" value={`${p.coalitionStabilityPct.toFixed(0)}%`} />
      </div>

      <div className="brackets bg-void-900/60 border border-void-700 rounded-sm p-4">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold mb-3 pb-1 border-b border-void-800">Government</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mb-1">
          <Row label="Head of State" value={p.headOfState} />
          <Row label="Head of Government" value={p.headOfGovernment} />
          <Row label="Legislature" value={p.legislatureName} />
          <Row label="Next Election" value={p.electionCycleMonths >= 900 ? 'N/A (single-party state)' : formatDate(p.nextElectionDate)} />
        </div>
      </div>

      <div className="brackets bg-void-900/60 border border-void-700 rounded-sm p-4">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold mb-3 pb-1 border-b border-void-800">Parties</h3>
        <div className="space-y-2">
          {p.parties.map((party) => (
            <div key={party.id} className="flex items-center gap-3 text-sm">
              <span className={`w-2 h-2 rounded-full ${party.inGovernment ? 'bg-sage-400' : 'bg-void-600'}`} />
              <span className="flex-1 text-void-200">{party.name}</span>
              <span className="text-void-500 text-xs">{party.ideology}</span>
              <span className="text-void-400 w-16 text-right tabular-nums">{party.seatSharePct.toFixed(0)}% seats</span>
              <span className="text-void-400 w-16 text-right tabular-nums">{party.popularSupportPct.toFixed(0)}% support</span>
            </div>
          ))}
        </div>
      </div>

      <div className="brackets bg-void-900/60 border border-void-700 rounded-sm p-4">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold mb-3 pb-1 border-b border-void-800">Policy Levers</h3>
        <label className="flex items-center gap-2 text-sm text-void-300">
          <input
            type="checkbox"
            checked={c.military.conscription}
            onChange={(e) => dispatch({ type: 'setConscription', enabled: e.target.checked })}
            className="accent-sage-500"
          />
          Conscription in effect
        </label>
        <p className="text-void-500 text-xs mt-3">
          Approval responds to growth, inflation, unemployment, unrest, and defense burden. Tax and spending
          decisions on the Economy screen are the main levers available to shift it.
        </p>
      </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-void-500">{label}</span>
      <span className="text-void-200">{value}</span>
    </div>
  );
}
