import type { CountryState, ProcurementProgramInstance } from './types';
import { PROCUREMENT_PROGRAMS } from '../data/equipment';
import { bumpBranchModernityForCategory } from './military';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function defById(id: string) {
  return PROCUREMENT_PROGRAMS.find((p) => p.id === id);
}

export function canStartProgram(c: CountryState, defId: string, currentYear: number): { ok: boolean; reason?: string } {
  const def = defById(defId);
  if (!def) return { ok: false, reason: 'Unknown program' };
  if (def.nation !== c.code) return { ok: false, reason: 'Not this nation\'s program' };
  if (c.procurement.some((p) => p.defId === defId && p.status !== 'cancelled')) return { ok: false, reason: 'Already active' };
  if (currentYear < def.historicalStartYear - 3) return { ok: false, reason: 'Too early -- technology not yet available' };
  if (c.economy.techIndex < def.techRequirement) return { ok: false, reason: `Requires tech level ${def.techRequirement} (currently ${c.economy.techIndex.toFixed(0)})` };
  return { ok: true };
}

export function startProgram(c: CountryState, defId: string): void {
  const instance: ProcurementProgramInstance = {
    defId, status: 'development', monthsElapsed: 0, unitsProduced: 0, unitsInService: 0, fundingLevelPct: 100, exported: {},
  };
  c.procurement.push(instance);
}

export function setProgramFunding(c: CountryState, defId: string, fundingLevelPct: number): void {
  const inst = c.procurement.find((p) => p.defId === defId);
  if (inst) inst.fundingLevelPct = clamp(fundingLevelPct, 0, 200);
}

export function cancelProgram(c: CountryState, defId: string): void {
  const inst = c.procurement.find((p) => p.defId === defId);
  if (inst) inst.status = 'cancelled';
}

export function exportUnits(c: CountryState, defId: string, to: string, units: number): void {
  const inst = c.procurement.find((p) => p.defId === defId);
  const def = defById(defId);
  if (!inst || !def || def.exportPotential === 'none') return;
  const exportable = Math.max(0, inst.unitsInService - Object.values(inst.exported).reduce((s, v) => s + v, 0));
  const n = Math.min(units, exportable);
  if (n <= 0) return;
  inst.exported[to] = (inst.exported[to] ?? 0) + n;
}

/** Advances all active procurement programs by one month, respecting the nation's procurement budget envelope. */
export function tickProcurement(c: CountryState): { spentBillion: number } {
  const active = c.procurement.filter((p) => p.status === 'development' || p.status === 'production');
  const defs = active.map((p) => ({ inst: p, def: defById(p.defId)! })).filter((x) => !!x.def);

  const requestedCost = defs.reduce((sum, { inst, def }) => {
    if (inst.status === 'development') {
      return sum + (def.developmentCostBillion / def.developmentMonths) * (inst.fundingLevelPct / 100);
    }
    const unitsThisMonth = (def.annualProductionCapacity / 12) * (inst.fundingLevelPct / 100);
    return sum + unitsThisMonth * (def.unitProductionCostMillion / 1000);
  }, 0);

  const budget = c.military.procurementBudgetBillion;
  const scale = requestedCost > budget && requestedCost > 0 ? clamp(budget / requestedCost, 0.1, 1) : 1;

  let spentBillion = 0;
  for (const { inst, def } of defs) {
    const effectiveFunding = (inst.fundingLevelPct / 100) * scale;
    if (inst.status === 'development') {
      inst.monthsElapsed += effectiveFunding;
      spentBillion += (def.developmentCostBillion / def.developmentMonths) * effectiveFunding;
      if (inst.monthsElapsed >= def.developmentMonths) {
        inst.status = 'production';
        inst.monthsElapsed = def.developmentMonths;
      }
    } else if (inst.status === 'production') {
      const unitsThisMonth = (def.annualProductionCapacity / 12) * effectiveFunding;
      inst.unitsProduced += unitsThisMonth;
      inst.unitsInService = inst.unitsProduced - Object.values(inst.exported).reduce((s, v) => s + v, 0);
      spentBillion += unitsThisMonth * (def.unitProductionCostMillion / 1000);
      if (unitsThisMonth > 0) {
        bumpBranchModernityForCategory(c, def.category, unitsThisMonth * 0.01);
      }
    }
  }

  return { spentBillion };
}
