import type { CountryState, GameDate, NuclearDoctrine } from './types';
import { compareDates } from './time';
import { defById } from './procurement';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (current: number, target: number, speed: number) => current + (target - current) * speed;

// Earliest a nation can plausibly cross the nuclear threshold, and the tech
// level it must sustain to get there -- under-investing in science delays
// breakout beyond these dates; the date itself is a hard physical/engineering
// floor representing how history actually unfolded.
const BREAKOUT: Record<string, { minDate: GameDate; techThreshold: number; initialWarheads: number }> = {
  SUN: { minDate: { year: 1949, month: 8 }, techThreshold: 40, initialWarheads: 1 },
  GBR: { minDate: { year: 1952, month: 10 }, techThreshold: 55, initialWarheads: 1 },
  FRA: { minDate: { year: 1960, month: 2 }, techThreshold: 55, initialWarheads: 1 },
};

export function tickNuclear(c: CountryState, date: GameDate): string | null {
  const n = c.nuclear;
  let narrative: string | null = null;

  const breakout = BREAKOUT[c.code];
  if (breakout && !n.hasNuclearWeapons) {
    if (compareDates(date, breakout.minDate) >= 0 && c.economy.techIndex >= breakout.techThreshold) {
      n.hasNuclearWeapons = true;
      n.warheads = breakout.initialWarheads;
      n.readinessPct = 25;
      n.doctrine = 'MassiveRetaliation';
      narrative = `${c.name} successfully tests its first nuclear device.`;
    }
  }

  // Delivery systems accumulate from in-service procurement programs.
  let icbms = 0, slbms = 0, bombers = 0, subs = 0;
  for (const inst of c.procurement) {
    const def = defById(inst.defId);
    if (!def) continue;
    if (def.category === 'icbm') icbms += inst.unitsInService;
    if (def.category === 'slbm') slbms += inst.unitsInService;
    if (def.category === 'ssbn') subs += inst.unitsInService;
    if (def.category === 'bomber' && (def.id.includes('b52') || def.id.includes('b1b') || def.id.includes('tu95') || def.id.includes('tu160') || def.id.includes('vulcan') || def.id.includes('victor'))) {
      bombers += inst.unitsInService;
    }
  }
  n.icbms = Math.round(icbms);
  n.slbms = Math.round(slbms * 16); // each SSBN typically carries ~16 missile tubes
  n.strategicBombers = Math.round(bombers);
  n.missileSubmarines = Math.round(subs);
  n.secondStrikeCapable = n.missileSubmarines > 0 && n.slbms > 0;

  if (n.hasNuclearWeapons) {
    // Warhead stockpile grows with fissile production capacity, proxied by tech + defense investment.
    const growth = clamp((c.economy.techIndex / 100) * (c.budget.spending.defense / 20), 0, 40);
    n.warheads = Math.round(n.warheads + growth);
    n.tacticalWarheads = Math.round(n.tacticalWarheads + growth * 0.3);
    n.earlyWarningIndex = clamp(drift(n.earlyWarningIndex, c.economy.techIndex * 0.9, 0.02), 0, 100);
    const doctrineReadinessTarget: Record<NuclearDoctrine, number> = {
      None: 10, MassiveRetaliation: 45, FlexibleResponse: 55, Counterforce: 65,
      Countervalue: 40, NoFirstUse: 30, NuclearSharing: 50, LaunchOnWarning: 80,
    };
    n.readinessPct = clamp(drift(n.readinessPct, doctrineReadinessTarget[n.doctrine], 0.05), 5, 100);
  }

  return narrative;
}

export function setNuclearDoctrine(c: CountryState, doctrine: NuclearDoctrine): void {
  if (!c.nuclear.hasNuclearWeapons && doctrine !== 'None') return;
  c.nuclear.doctrine = doctrine;
}
