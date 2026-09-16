import type { CountryState, GameDate, WorldState } from './types';
import { setSpending, setTaxRate } from './budget';
import { canStartProgram, startProgram } from './procurement';
import { procurementForNation } from '../data/equipment';
import { setAidFlow } from './diplomacy';

// Rough Cold-War-era defense-spending-as-%-of-GDP targets per nation, used
// as an AI heuristic anchor (not a hard rule -- tension and deficits push it around).
const DEFENSE_TARGET_PCT: Record<string, number> = { USA: 8.5, SUN: 15, GBR: 6, FRA: 5 };

function adjustDefenseSpending(c: CountryState): void {
  const gdp = c.economy.gdpBillion;
  const targetPct = DEFENSE_TARGET_PCT[c.code] ?? 5;
  const targetBillion = gdp * (targetPct / 100);
  const current = c.budget.spending.defense;
  setSpending(c, 'defense', current + (targetBillion - current) * 0.05);
}

function balanceBudget(c: CountryState): void {
  const gdp = c.economy.gdpBillion;
  if (gdp <= 0) return;
  const deficitPct = -c.budget.balance / gdp * 100;
  if (deficitPct > 6) {
    if (c.economyType !== 'planned') {
      setTaxRate(c, 'incomeTaxPct', c.budget.taxRates.incomeTaxPct + 0.4);
      setTaxRate(c, 'corporateTaxPct', c.budget.taxRates.corporateTaxPct + 0.3);
    }
    setSpending(c, 'other', c.budget.spending.other * 0.97);
    setSpending(c, 'subsidies', c.budget.spending.subsidies * 0.97);
  } else if (deficitPct < -4 && c.economyType !== 'planned') {
    setTaxRate(c, 'incomeTaxPct', Math.max(5, c.budget.taxRates.incomeTaxPct - 0.2));
  }
}

function pickAndStartProcurement(c: CountryState, year: number): void {
  const candidates = procurementForNation(c.code);
  const active = c.procurement.filter((p) => p.status !== 'cancelled').length;
  if (active >= 4) return; // don't run too many concurrent programs
  for (const def of candidates) {
    if (year < def.historicalStartYear || year > def.historicalStartYear + 2) continue;
    const check = canStartProgram(c, def.id, year);
    if (check.ok) { startProgram(c, def.id); break; }
  }
}

function tendColonies(c: CountryState): void {
  if (!c.colonies) return;
  for (const col of c.colonies) {
    if (col.independent) continue;
    if (col.strategy === 'repress' && col.internationalPressureIndex > 70) col.strategy = 'negotiate';
    else if (col.strategy === 'maintain' && col.unrestIndex > 60) col.strategy = 'repress';
  }
}

function tendAlliesWithAid(world: WorldState, c: CountryState): void {
  for (const [code, other] of Object.entries(world.countries)) {
    if (other.isMajor || code === c.code) continue;
    const rel = c.diplomacy[code];
    if (!rel || rel.relationScore < 40) continue;
    if (other.stabilityIndex < 40 && rel.aidFlowMillionPerYear < 50) {
      setAidFlow(c, code, 60);
    }
  }
}

function setDefaultNuclearDoctrine(c: CountryState, date: GameDate): void {
  if (!c.nuclear.hasNuclearWeapons || c.nuclear.doctrine !== 'None') return;
  c.nuclear.doctrine = c.code === 'USA' && date.year >= 1961 ? 'FlexibleResponse' : 'MassiveRetaliation';
}

export function tickAI(world: WorldState): void {
  for (const c of Object.values(world.countries)) {
    if (!c.isMajor || c.code === world.playerCode) continue;
    adjustDefenseSpending(c);
    balanceBudget(c);
    pickAndStartProcurement(c, world.date.year);
    tendColonies(c);
    tendAlliesWithAid(world, c);
    setDefaultNuclearDoctrine(c, world.date);
  }
}
