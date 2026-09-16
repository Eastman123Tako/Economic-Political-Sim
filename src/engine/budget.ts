import type { CountryState } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Recomputes budget.revenue / totalRevenue / totalSpending / balance / debt for one month. */
export function tickBudget(c: CountryState): void {
  const b = c.budget;
  const gdp = c.economy.gdpBillion;

  if (c.economyType === 'planned' && c.planned) {
    // Centrally planned: the state captures most of national income directly;
    // "revenue" is the budget's claim on output rather than a tax base.
    const captureShare = 0.42 + c.planned.plannerEfficiencyIndex / 1000; // ~0.42-0.52
    b.revenue = {
      incomeTax: 0,
      corporateTax: 0,
      salesTax: 0,
      tariffs: gdp * 0.01,
      payroll: 0,
      stateEnterprise: gdp * captureShare,
      other: gdp * 0.01,
    };
  } else {
    const wageBase = gdp * 0.55; // rough labor-share-of-income proxy
    const profitBase = gdp * 0.20;
    const consumptionBase = gdp * 0.62;
    b.revenue = {
      incomeTax: wageBase * (b.taxRates.incomeTaxPct / 100),
      corporateTax: profitBase * (b.taxRates.corporateTaxPct / 100),
      salesTax: consumptionBase * (b.taxRates.salesTaxPct / 100),
      tariffs: c.economy.importsBillion * (b.taxRates.tariffPct / 100),
      payroll: wageBase * (b.taxRates.payrollTaxPct / 100),
      stateEnterprise: 0,
      other: gdp * 0.005,
    };
  }

  b.totalRevenue = Object.values(b.revenue).reduce((s, v) => s + v, 0);

  // Interest payments are computed, not player-set: average borrowing cost
  // rises with debt/GDP (risk premium) on top of the policy rate.
  const debtToGdp = gdp > 0 ? (b.debtBillion / gdp) * 100 : 0;
  const riskPremium = clamp((debtToGdp - 60) / 100, 0, 6);
  const borrowingRatePct = c.economy.interestRatePct + riskPremium;
  b.spending.interestPayments = Math.max(0, (b.debtBillion * borrowingRatePct) / 100);

  b.totalSpending = Object.values(b.spending).reduce((s, v) => s + v, 0);
  b.balance = b.totalRevenue - b.totalSpending;
  b.debtBillion = Math.max(0, b.debtBillion - b.balance / 12);
  b.debtToGdpPct = gdp > 0 ? (b.debtBillion / gdp) * 100 : 0;
}

/** Sets a tax rate (market/mixed economies only), clamped to sane bounds. */
export function setTaxRate(c: CountryState, field: keyof CountryState['budget']['taxRates'], value: number): void {
  c.budget.taxRates[field] = clamp(value, 0, 90);
}

/** Sets an annual spending level (billions/year) for a discretionary category. */
export function setSpending(c: CountryState, field: keyof CountryState['budget']['spending'], value: number): void {
  if (field === 'interestPayments') return; // computed only
  c.budget.spending[field] = Math.max(0, value);
}
