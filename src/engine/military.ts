import type { CountryState } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (current: number, target: number, speed: number) => current + (target - current) * speed;

const CATEGORY_BRANCH_HINTS: Record<string, string[]> = {
  fighter: ['air', 'af', 'force'], bomber: ['air', 'af', 'force'], transport: ['air', 'af', 'force'], helicopter: ['air', 'army', 'ground'],
  tank: ['army', 'ground'], ifv: ['army', 'ground'], artillery: ['army', 'ground'],
  carrier: ['navy', 'marine'], destroyer: ['navy', 'marine'], submarine: ['navy', 'marine'], ssbn: ['navy', 'marine'], frigate: ['navy', 'marine'],
  icbm: ['rvsn', 'rocket'], slbm: ['navy', 'rvsn'], irbm: ['rvsn', 'rocket'],
  radar: ['pvo', 'defense'], other: [],
};

export function tickMilitary(c: CountryState): void {
  const m = c.military;
  const gdp = c.economy.gdpBillion;
  m.procurementBudgetBillion = c.budget.spending.defense * 0.35;
  m.researchBudgetBillion = c.budget.spending.defense * 0.07 + c.budget.spending.research * 0.3;

  const defenseShareOfGdp = gdp > 0 ? c.budget.spending.defense / gdp : 0;
  const personnelTarget = clamp((defenseShareOfGdp * gdp * 1000) / 55, 20, 6000); // ~$55k/service-member/yr fully loaded
  m.totalPersonnelThousands = drift(m.totalPersonnelThousands, personnelTarget, 0.02);

  const fundingPerCapita = m.totalPersonnelThousands > 0 ? c.budget.spending.defense / m.totalPersonnelThousands : 0;
  const readinessTarget = clamp(30 + fundingPerCapita * 400, 10, 95);
  const trainingTarget = clamp(30 + fundingPerCapita * 350, 10, 95);
  const logisticsTarget = clamp(35 + fundingPerCapita * 300 + c.economy.infrastructureIndex * 0.2, 10, 95);

  for (const branch of m.branches) {
    branch.readinessPct = clamp(drift(branch.readinessPct, readinessTarget, 0.06), 5, 100);
    branch.trainingPct = clamp(drift(branch.trainingPct, trainingTarget, 0.05), 5, 100);
    branch.logisticsPct = clamp(drift(branch.logisticsPct, logisticsTarget, 0.05), 5, 100);
    branch.moraleePct = clamp(drift(branch.moraleePct, (readinessTarget + c.politics.approvalPct) / 2, 0.04), 5, 100);
    // Slow baseline obsolescence, offset by active procurement handled in procurement.ts
    branch.equipmentModernityPct = clamp(drift(branch.equipmentModernityPct, c.economy.techIndex * 0.85, 0.01), 5, 100);
  }

  const share = m.totalPersonnelThousands > 0
    ? m.branches.reduce((s, b) => s + b.personnelThousands, 0)
    : 0;
  if (share > 0) {
    const ratio = m.totalPersonnelThousands / share;
    for (const branch of m.branches) branch.personnelThousands *= ratio;
  }
}

/** Nudges the modernity of branches plausibly associated with a procurement category. */
export function bumpBranchModernityForCategory(c: CountryState, category: string, amount: number): void {
  const hints = CATEGORY_BRANCH_HINTS[category] ?? [];
  for (const branch of c.military.branches) {
    const idLower = branch.id.toLowerCase();
    if (hints.some((h) => idLower.includes(h))) {
      branch.equipmentModernityPct = clamp(branch.equipmentModernityPct + amount, 5, 100);
    }
  }
}
