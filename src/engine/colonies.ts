import type { CountryState, GameDate, WorldState } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (current: number, target: number, speed: number) => current + (target - current) * speed;

export function tickColonies(world: WorldState, c: CountryState, date: GameDate): string[] {
  const bullets: string[] = [];
  if (!c.colonies) return bullets;

  for (const col of c.colonies) {
    if (col.independent) continue;
    col.monthsUnderCurrentStrategy += 1;

    let unrestTarget = col.unrestIndex;
    let pressureDelta = 0.1;
    switch (col.strategy) {
      case 'maintain': unrestTarget = col.unrestIndex + 0.4; pressureDelta = 0.15; break;
      case 'autonomy': unrestTarget = clamp(col.unrestIndex - 1.2, 0, 100); pressureDelta = -0.1; break;
      case 'negotiate': unrestTarget = clamp(col.unrestIndex - 2.0, 0, 100); pressureDelta = -0.3; break;
      case 'repress': unrestTarget = clamp(col.unrestIndex - 0.5, 0, 100); pressureDelta = 1.2; break;
      case 'develop': unrestTarget = clamp(col.unrestIndex - 0.8, 0, 100); pressureDelta = 0.0; break;
      case 'withdraw': unrestTarget = clamp(col.unrestIndex - 5, 0, 100); pressureDelta = -0.5; break;
    }
    col.unrestIndex = clamp(drift(col.unrestIndex, unrestTarget, 0.15), 0, 100);
    col.internationalPressureIndex = clamp(col.internationalPressureIndex + pressureDelta, 0, 100);
    col.insurgencyActive = col.unrestIndex > 55;

    if (col.insurgencyActive && col.strategy === 'repress') {
      col.cumulativeCasualties += Math.round(50 + col.populationMillion * 8);
      col.annualCostBillion = Math.max(col.annualCostBillion, col.populationMillion * 0.02);
      c.stabilityIndex = clamp(c.stabilityIndex - 0.05, 0, 100);
    }

    // Colonial upkeep/war costs drain the metropole's treasury each month.
    c.budget.debtBillion += col.annualCostBillion / 12;

    const independenceDue =
      col.strategy === 'withdraw' && col.monthsUnderCurrentStrategy >= 6
      || col.strategy === 'negotiate' && col.monthsUnderCurrentStrategy >= 18
      || col.strategy === 'repress' && col.unrestIndex >= 97
      || col.internationalPressureIndex >= 95;

    if (independenceDue) {
      col.independent = true;
      col.independenceDate = { ...date };
      const newNation = world.countries[col.id];
      if (newNation) {
        newNation.colonialRuler = undefined;
        newNation.alignment = col.strategy === 'repress' ? 'NonAligned' : 'Other';
        newNation.stabilityIndex = clamp(60 - col.unrestIndex * 0.3, 15, 80);
      }
      bullets.push(`${col.name} gains independence from ${c.name}${col.strategy === 'repress' ? ' after a costly insurgency' : ' through negotiated withdrawal'}.`);
    }
  }
  return bullets;
}
