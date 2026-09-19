import { useGameStore } from '../../store/gameStore';
import type { NuclearDoctrine } from '../../engine/types';

const DOCTRINES: { id: NuclearDoctrine; label: string; blurb: string }[] = [
  { id: 'MassiveRetaliation', label: 'Massive Retaliation', blurb: 'Any major aggression triggers an overwhelming nuclear response.' },
  { id: 'FlexibleResponse', label: 'Flexible Response', blurb: 'A graduated mix of conventional and nuclear options.' },
  { id: 'Counterforce', label: 'Counterforce', blurb: 'Target the adversary\'s military and nuclear forces first.' },
  { id: 'Countervalue', label: 'Countervalue', blurb: 'Target cities and industry to maximize deterrence value.' },
  { id: 'NoFirstUse', label: 'No First Use', blurb: 'Nuclear weapons only in retaliation to a nuclear strike.' },
  { id: 'NuclearSharing', label: 'Nuclear Sharing', blurb: 'Extend deterrence and delivery access to allies.' },
  { id: 'LaunchOnWarning', label: 'Launch on Warning', blurb: 'Launch on confirmed warning, before impact.' },
];

export default function NuclearPanel() {
  const world = useGameStore((s) => s.world)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const c = world.countries[world.playerCode];
  const n = c.nuclear;

  if (!n.hasNuclearWeapons) {
    return (
      <div className="p-5 max-w-3xl mx-auto text-void-400 text-sm">
        {c.name} does not yet possess nuclear weapons. Sustained investment in the Tech Index (via Research
        spending and industrial development) combined with the historical minimum timeline will determine when
        a nuclear breakout becomes possible.
      </div>
    );
  }

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Warheads" value={n.warheads.toFixed(0)} />
        <Metric label="Tactical Warheads" value={n.tacticalWarheads.toFixed(0)} />
        <Metric label="ICBMs" value={n.icbms.toFixed(0)} />
        <Metric label="SLBMs" value={n.slbms.toFixed(0)} />
        <Metric label="Strategic Bombers" value={n.strategicBombers.toFixed(0)} />
        <Metric label="Missile Submarines" value={n.missileSubmarines.toFixed(0)} />
        <Metric label="Second-Strike Capable" value={n.secondStrikeCapable ? 'Yes' : 'No'} tone={n.secondStrikeCapable ? 'good' : 'bad'} />
        <Metric label="Early Warning" value={`${n.earlyWarningIndex.toFixed(0)}/100`} />
        <Metric label="Readiness" value={`${n.readinessPct.toFixed(0)}/100`} />
      </div>

      <div className="brackets bg-void-900/60 border border-void-700 rounded-sm p-4">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-sage-300 font-semibold mb-3 pb-1 border-b border-void-800">Nuclear Doctrine</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {DOCTRINES.map((d) => (
            <button
              key={d.id}
              onClick={() => dispatch({ type: 'setNuclearDoctrine', doctrine: d.id })}
              className={`text-left p-3 rounded border text-sm ${n.doctrine === d.id ? 'border-sage-400 bg-sage-400/10' : 'border-void-800 bg-void-950/40 hover:border-void-600'}`}
            >
              <div className="text-void-100 font-medium mb-0.5">{d.label}</div>
              <div className="text-void-500 text-xs">{d.blurb}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-void-500 bg-void-900/40 border border-void-800 rounded-sm p-3">
        Delivery systems (ICBMs, SLBMs, strategic bombers) accumulate automatically from relevant Procurement
        programs once they enter production and service. A full-scale nuclear exchange is not modeled as
        tactical combat -- it would be catastrophic and effectively end the simulation for the nations involved.
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  const color = tone === 'good' ? 'text-sage-400' : tone === 'bad' ? 'text-brick-400' : 'text-void-100';
  return (
    <div className="bg-void-900/60 border border-void-800 rounded px-3 py-2">
      <div className="text-void-500 text-xs">{label}</div>
      <div className={`font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
