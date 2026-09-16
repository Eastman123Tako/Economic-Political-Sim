import type { CountryState, IndustrialInvestment } from './types';
import { INDUSTRY_SECTORS } from './factory';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Sector capacities drift toward overall industrial production, plus any active investment bonuses. */
export function tickIndustry(c: CountryState): void {
  const targetLevel = c.economy.industrialProductionIndex;
  for (const sector of INDUSTRY_SECTORS) {
    c.industry[sector] = clamp(c.industry[sector] + (targetLevel - c.industry[sector]) * 0.02, 10, 400);
  }

  const remaining: IndustrialInvestment[] = [];
  for (const inv of c.industrialInvestments) {
    if (inv.monthsRemaining > 0) {
      inv.monthsRemaining -= 1;
      c.economy.consumerGoodsIndex = clamp(c.economy.consumerGoodsIndex - inv.civConsumptionPenaltyPct / 24, 5, 100);
      if (inv.monthsRemaining === 0) {
        c.industry[inv.sector] = clamp(c.industry[inv.sector] * (1 + inv.capacityBonusPct / 100), 10, 400);
      } else {
        remaining.push(inv);
      }
    }
  }
  c.industrialInvestments = remaining;
}

export function startIndustrialInvestment(c: CountryState, inv: IndustrialInvestment): void {
  c.industrialInvestments.push({ ...inv });
}
