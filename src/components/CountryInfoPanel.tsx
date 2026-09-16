import { useGameStore } from '../store/gameStore';
import { getRelation } from '../engine/diplomacy';

export default function CountryInfoPanel() {
  const world = useGameStore((s) => s.world)!;
  const selectedCountryCode = useGameStore((s) => s.selectedCountryCode);
  const selectCountry = useGameStore((s) => s.selectCountry);
  const c = selectedCountryCode ? world.countries[selectedCountryCode] : null;

  if (!c) {
    return (
      <div className="w-72 shrink-0 border-l border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-500">
        Click a country on the map to see its profile.
      </div>
    );
  }

  const player = world.countries[world.playerCode];
  const rel = c.code === player.code ? null : getRelation(player, c.code);
  const totalMilitary = c.military.totalPersonnelThousands;
  const industryAvg = Object.values(c.industry).reduce((s, v) => s + v, 0) / Object.values(c.industry).length;

  return (
    <div className="w-80 shrink-0 border-l border-slate-800 bg-slate-950/80 p-4 overflow-y-auto text-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-slate-100">{c.name}</h3>
        <button onClick={() => selectCountry(null)} className="text-slate-500 hover:text-slate-300">&times;</button>
      </div>
      <div className="text-xs text-slate-500 mb-3">
        {c.isMajor ? 'Major Power' : 'World Nation'} &middot; {c.alignment} {c.colonialRuler ? `· Dependency of ${c.colonialRuler}` : ''}
      </div>

      <Section title="Economy">
        <Row label="GDP" value={`$${c.economy.gdpBillion.toFixed(1)}B`} />
        <Row label="GDP Growth" value={`${c.economy.gdpGrowthPct.toFixed(1)}%`} />
        <Row label="GDP per Capita" value={`$${c.economy.gdpPerCapita.toFixed(0)}`} />
        <Row label="Population" value={`${c.economy.populationMillion.toFixed(1)}M`} />
        <Row label="Inflation" value={`${c.economy.inflationPct.toFixed(1)}%`} />
        <Row label="Unemployment" value={`${c.economy.unemploymentPct.toFixed(1)}%`} />
        <Row label="Industrial Capacity (avg)" value={industryAvg.toFixed(0)} />
      </Section>

      <Section title="Government">
        <Row label="Type" value={c.government ?? c.politics.legislatureName} />
        <Row label="Head of Government" value={c.politics.headOfGovernment} />
        <Row label="Approval" value={`${c.politics.approvalPct.toFixed(0)}%`} />
        <Row label="Stability" value={`${c.stabilityIndex.toFixed(0)}/100`} />
      </Section>

      <Section title="Military">
        <Row label="Personnel" value={`${totalMilitary.toFixed(0)}k`} />
        <Row label="Defense Spending" value={`$${c.budget.spending.defense.toFixed(1)}B/yr`} />
        <Row label="Nuclear Weapons" value={c.nuclear.hasNuclearWeapons ? `${c.nuclear.warheads.toFixed(0)} warheads` : 'None'} />
        {c.alliances.natoMember && <Row label="Alliance" value="NATO Member" />}
        {c.alliances.warsawPactMember && <Row label="Alliance" value="Warsaw Pact Member" />}
      </Section>

      <Section title="Trade">
        <Row label="Exports" value={`$${c.economy.exportsBillion.toFixed(1)}B`} />
        <Row label="Imports" value={`$${c.economy.importsBillion.toFixed(1)}B`} />
        <Row label="Current Account" value={`$${c.economy.currentAccountBillion.toFixed(1)}B`} />
        <Row label="Reserves" value={`$${c.economy.foreignReservesBillion.toFixed(1)}B`} />
      </Section>

      {c.resources && c.resources.length > 0 && (
        <Section title="Resources">
          <div className="flex flex-wrap gap-1.5">
            {c.resources.map((r) => (
              <span key={r} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">{r}</span>
            ))}
          </div>
        </Section>
      )}

      {rel && (
        <Section title={`Relations with ${player.name}`}>
          <Row label="Score" value={`${rel.relationScore.toFixed(0)} / 100`} />
          <Row label="Trade Volume" value={`$${rel.tradeVolumeBillion.toFixed(2)}B`} />
          <Row label="Aid Flow" value={`$${rel.aidFlowMillionPerYear.toFixed(0)}M/yr`} />
          <Row label="Sanctioned" value={rel.sanctioned ? 'Yes' : 'No'} />
          <Row label="Military Coop." value={rel.militaryCooperation ? 'Yes' : 'No'} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1.5 border-b border-slate-800 pb-1">{title}</div>
      <div className="space-y-1">{children}</div>
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
