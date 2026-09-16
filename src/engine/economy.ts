import type { CountryState } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (current: number, target: number, speed: number) => current + (target - current) * speed;

/**
 * Advances one month of macroeconomic simulation. Growth is driven by
 * capital formation, labor force, productivity/tech, and a stability
 * multiplier -- not random noise. Government budget choices feed in through
 * their effect on infrastructure/education/tech indices and on private
 * investment (via the tax burden and defense crowding-out).
 */
export function tickEconomy(c: CountryState): void {
  const e = c.economy;
  const gdp = e.gdpBillion;
  const defenseShareOfGdp = gdp > 0 ? c.budget.spending.defense / gdp : 0;
  const infraSpendShare = gdp > 0 ? c.budget.spending.infrastructure / gdp : 0;
  const eduSpendShare = gdp > 0 ? c.budget.spending.education / gdp : 0;
  const researchSpendShare = gdp > 0 ? c.budget.spending.research / gdp : 0;

  // --- Capital formation -----------------------------------------------
  let investmentRatePct: number; // share of GDP invested this year
  if (c.economyType === 'planned' && c.planned) {
    investmentRatePct = c.planned.investmentSharePct * (c.planned.plannerEfficiencyIndex / 100);
  } else {
    const avgTax = (c.budget.taxRates.incomeTaxPct + c.budget.taxRates.corporateTaxPct) / 2;
    const taxDrag = clamp((avgTax - 30) / 100, -0.05, 0.15); // high taxes crowd out some private investment
    const stabilityBoost = (c.stabilityIndex - 50) / 500;
    investmentRatePct = clamp(16 - taxDrag * 40 + stabilityBoost * 10 + infraSpendShare * 30, 4, 32);
  }
  const capitalGrowthPct = investmentRatePct - 5.5; // ~5.5%/yr depreciation baseline

  // --- Labor force -------------------------------------------------------
  const laborGrowthPct = e.populationGrowthPct * 0.75;

  // --- Total factor productivity -----------------------------------------
  const tfpGrowthPct =
    0.4
    + (e.techIndex - 50) / 500
    + (e.educationIndex - 50) / 600
    + researchSpendShare * 15
    + eduSpendShare * 8;

  // --- Stability & policy multiplier --------------------------------------
  const stabilityFactor = clamp(0.6 + c.stabilityIndex / 125, 0.5, 1.25);
  const defenseBurdenDrag = defenseShareOfGdp > 0.10 ? (defenseShareOfGdp - 0.10) * 18 : 0;
  const energyDrag = e.energyIndex < 40 ? (40 - e.energyIndex) / 20 : 0;

  // Growth accounting (Solow-style): %dY = %dA + 0.35*%dK + 0.65*%dL
  let annualGrowth = tfpGrowthPct + 0.35 * capitalGrowthPct + 0.65 * laborGrowthPct;
  annualGrowth = annualGrowth * stabilityFactor - defenseBurdenDrag - energyDrag;
  annualGrowth = clamp(annualGrowth, -10, 14);

  e.gdpGrowthPct = annualGrowth;
  const monthlyFactor = Math.pow(1 + annualGrowth / 100, 1 / 12);
  e.gdpBillion = gdp * monthlyFactor;
  e.capitalStockBillion *= Math.pow(1 + capitalGrowthPct / 100, 1 / 12);
  e.laborForceMillion *= Math.pow(1 + laborGrowthPct / 100, 1 / 12);
  e.populationMillion *= Math.pow(1 + e.populationGrowthPct / 100, 1 / 12);
  e.gdpPerCapita = (e.gdpBillion * 1000) / e.populationMillion;

  // --- Unemployment: drifts toward an equilibrium set by growth vs trend --
  const trendGrowth = c.economyType === 'planned' ? (c.planned?.fiveYearPlanTarget ?? 5) : 3.0;
  const cyclicalUnemploymentTarget = clamp(5.5 - (annualGrowth - trendGrowth) * 0.5, 0.5, 20);
  e.unemploymentPct = drift(e.unemploymentPct, cyclicalUnemploymentTarget, 0.08);

  // --- Inflation: demand pressure + money growth --------------------------
  const moneyGrowthPct = defenseShareOfGdp > 0.12 ? 6 + defenseShareOfGdp * 20 : 4;
  e.moneySupplyBillion *= Math.pow(1 + moneyGrowthPct / 100, 1 / 12);
  const demandPressure = (annualGrowth - trendGrowth) * 0.4;
  const inflationTarget = clamp(demandPressure + (moneyGrowthPct - 4) * 0.5 + (e.energyIndex < 45 ? (45 - e.energyIndex) * 0.1 : 0), -3, 40);
  e.inflationPct = drift(e.inflationPct, inflationTarget, 0.15);

  // --- Structural indices drift slowly toward policy-implied targets -----
  e.infrastructureIndex = clamp(drift(e.infrastructureIndex, clamp(40 + infraSpendShare * 400, 0, 100), 0.03), 0, 100);
  e.educationIndex = clamp(drift(e.educationIndex, clamp(40 + eduSpendShare * 500, 0, 100), 0.02), 0, 100);
  e.techIndex = clamp(drift(e.techIndex, clamp(35 + researchSpendShare * 600 + (c.military.researchBudgetBillion / Math.max(1, gdp)) * 300, 0, 100), 0.02), 0, 100);
  e.productivityIndex = clamp(e.productivityIndex * Math.pow(1 + tfpGrowthPct / 100, 1 / 12), 20, 250);

  const industrialAvg = (c.industry.oil + c.industry.coal + c.industry.electricity) / 3;
  e.energyIndex = clamp(drift(e.energyIndex, clamp(industrialAvg * 0.6, 0, 100), 0.03), 0, 100);

  // --- Industrial & agricultural production track GDP growth -------------
  e.industrialProductionIndex = clamp(e.industrialProductionIndex * monthlyFactor, 10, 400);
  e.agriculturalProductionIndex = clamp(e.agriculturalProductionIndex * Math.pow(1 + (laborGrowthPct * 0.2 + 0.5) / 100, 1 / 12), 10, 300);

  // --- Trade ---------------------------------------------------------------
  const tariffDrag = c.economyType === 'planned' ? 1 : clamp(1 - c.budget.taxRates.tariffPct / 200, 0.6, 1);
  e.exportsBillion = e.gdpBillion * 0.15 * (e.industrialProductionIndex / 100) * 0.8;
  e.importsBillion = e.gdpBillion * 0.16 * tariffDrag;
  e.currentAccountBillion = e.exportsBillion - e.importsBillion;
  e.foreignReservesBillion = Math.max(0, e.foreignReservesBillion + e.currentAccountBillion / 12);

  e.consumerGoodsIndex = clamp(
    c.economyType === 'planned' && c.planned
      ? drift(e.consumerGoodsIndex, 30 + c.planned.lightIndustrySharePct * 2, 0.03)
      : drift(e.consumerGoodsIndex, 50 + (e.gdpPerCapita / 100), 0.03),
    5, 100,
  );
}

/** Lightweight monthly drift for non-major world nations (trend growth only, no full budget model). */
export function tickLightNationEconomy(c: CountryState): void {
  const e = c.economy;
  const stabilityFactor = clamp(0.7 + c.stabilityIndex / 200, 0.6, 1.2);
  const growth = clamp(e.gdpGrowthPct * stabilityFactor, -6, 12);
  const monthlyFactor = Math.pow(1 + growth / 100, 1 / 12);
  e.gdpBillion *= monthlyFactor;
  e.populationMillion *= Math.pow(1 + e.populationGrowthPct / 100, 1 / 12);
  e.gdpPerCapita = (e.gdpBillion * 1000) / e.populationMillion;
}
