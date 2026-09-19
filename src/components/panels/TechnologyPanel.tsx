import { useGameStore } from '../../store/gameStore';
import Panel from '../ui/Panel';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function TechnologyPanel() {
  const world = useGameStore((s) => s.world)!;
  const c = world.countries[world.playerCode];
  const e = c.economy;

  const categories = [
    { label: 'Aviation', value: (e.techIndex + c.industry.aircraft) / 2, blurb: 'Airframes, jet engines, avionics -- feeds fighter and bomber procurement.' },
    { label: 'Naval Systems', value: (e.techIndex + c.industry.shipbuilding) / 2, blurb: 'Hull design, propulsion, sonar -- feeds surface combatant and submarine programs.' },
    { label: 'Armor & Land Systems', value: (e.techIndex + c.industry.machinery) / 2, blurb: 'Armor metallurgy, gun design, mobility -- feeds tank and IFV procurement.' },
    { label: 'Missiles & Rocketry', value: clamp(e.techIndex + (c.nuclear.icbms + c.nuclear.slbms > 0 ? 8 : 0), 0, 100), blurb: 'Guidance, propulsion, staging -- gates ICBM/SLBM/IRBM programs.' },
    { label: 'Nuclear Weapons', value: c.nuclear.hasNuclearWeapons ? clamp(40 + Math.log10(c.nuclear.warheads + 1) * 20, 40, 100) : clamp(e.techIndex * 0.3, 0, 39), blurb: c.nuclear.hasNuclearWeapons ? 'Warhead design and miniaturization program active.' : 'Pre-breakout fissile material and device research.' },
    { label: 'Electronics & Computing', value: (e.techIndex + c.industry.electronics) / 2, blurb: 'Semiconductors, radios, early computing -- feeds guidance and command systems.' },
    { label: 'Radar & Air Defense', value: clamp(e.techIndex * 0.9 + c.nuclear.earlyWarningIndex * 0.1, 0, 100), blurb: 'Detection and tracking -- feeds early warning and air-defense readiness.' },
    { label: 'Space & Satellites', value: e.techIndex >= 55 ? clamp(e.techIndex, 0, 100) : clamp(e.techIndex * 0.5, 0, 100), blurb: e.techIndex >= 55 ? 'Orbital launch capability established.' : 'Pre-orbital -- requires a higher Tech Index to unlock a launch program.' },
    { label: 'Communications', value: (e.techIndex + e.infrastructureIndex) / 2, blurb: 'Telephony, broadcast, and military C2 networks.' },
    { label: 'Medicine & Public Health', value: (e.educationIndex + clamp((c.budget.spending.healthcare / Math.max(1, e.gdpBillion)) * 800, 0, 100)) / 2, blurb: 'Life expectancy, healthcare access, and medical research capacity.' },
    { label: 'Energy', value: e.energyIndex, blurb: 'Electricity generation, oil/coal/gas output, and grid reliability.' },
    { label: 'Civilian Industry', value: clamp(e.industrialProductionIndex / 2, 0, 100), blurb: 'Overall manufacturing base underpinning consumer and export goods.' },
  ];

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Overall Tech Index" value={e.techIndex.toFixed(0)} />
        <Metric label="Research Budget" value={`$${c.budget.spending.research.toFixed(1)}B/yr`} />
        <Metric label="Military R&D" value={`$${c.military.researchBudgetBillion.toFixed(1)}B/yr`} />
        <Metric label="Education Index" value={e.educationIndex.toFixed(0)} />
      </div>

      <Panel title="Technological Capability by Field">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {categories.map((cat) => {
            const value = clamp(cat.value, 0, 100);
            return (
              <div key={cat.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-void-200">{cat.label}</span>
                  <span className="text-void-400 tabular-nums">{value.toFixed(0)}</span>
                </div>
                <div className="h-1.5 bg-void-800 rounded overflow-hidden mb-1">
                  <div className={`h-full ${value >= 65 ? 'bg-sage-500' : value >= 35 ? 'bg-khaki-400' : 'bg-brick-500'}`} style={{ width: `${value}%` }} />
                </div>
                <div className="text-xs text-void-500">{cat.blurb}</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="text-xs text-void-500 bg-void-900/40 border border-void-800 rounded-sm p-3">
        Technology emerges from research spending, education, and industrial investment rather than a
        standalone unlock tree -- fund Research and relevant industrial programs on the Economy and Industry
        screens to advance these fields, which in turn gate which Procurement programs and nuclear milestones
        are available.
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-void-900/60 border border-void-800 rounded px-3 py-2">
      <div className="text-void-500 text-xs">{label}</div>
      <div className="font-semibold tabular-nums text-void-100">{value}</div>
    </div>
  );
}
