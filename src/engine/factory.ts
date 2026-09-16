// Helpers for constructing default/partial nested state objects so the
// data files in /src/data stay readable (only specify what differs).
import type {
  IndustrySector, IndustryState, MilitaryBranch, BudgetSpending, TaxRates,
  BudgetState, NuclearState, DiplomacyState, PoliticsState, AllianceMembership,
  CountryState, Alignment, EconomyType, PlayableCode,
} from './types';

export const INDUSTRY_SECTORS: IndustrySector[] = [
  'steel', 'aluminum', 'coal', 'oil', 'naturalGas', 'electricity',
  'machinery', 'automobiles', 'aircraft', 'shipbuilding', 'electronics',
  'chemicals', 'consumerGoods', 'food', 'precisionManufacturing',
];

export function makeIndustry(overrides: Partial<IndustryState> = {}): IndustryState {
  const base: IndustryState = {} as IndustryState;
  for (const s of INDUSTRY_SECTORS) base[s] = 100;
  return { ...base, ...overrides };
}

export function makeBranch(partial: Partial<MilitaryBranch> & { id: string; name: string }): MilitaryBranch {
  return {
    personnelThousands: 0,
    readinessPct: 60,
    trainingPct: 60,
    equipmentModernityPct: 50,
    logisticsPct: 60,
    moraleePct: 65,
    ...partial,
  };
}

export function makeTaxRates(overrides: Partial<TaxRates> = {}): TaxRates {
  return {
    incomeTaxPct: 20,
    corporateTaxPct: 30,
    salesTaxPct: 5,
    tariffPct: 8,
    payrollTaxPct: 5,
    ...overrides,
  };
}

export function makeSpending(overrides: Partial<BudgetSpending> = {}): BudgetSpending {
  return {
    defense: 0,
    healthcare: 0,
    education: 0,
    infrastructure: 0,
    welfare: 0,
    pensions: 0,
    foreignAid: 0,
    research: 0,
    administration: 0,
    interestPayments: 0,
    subsidies: 0,
    other: 0,
    ...overrides,
  };
}

export function makeBudget(taxRates: TaxRates, spending: BudgetSpending, debtBillion: number): BudgetState {
  return {
    taxRates,
    spending,
    revenue: { incomeTax: 0, corporateTax: 0, salesTax: 0, tariffs: 0, payroll: 0, stateEnterprise: 0, other: 0 },
    totalRevenue: 0,
    totalSpending: 0,
    balance: 0,
    debtBillion,
    debtToGdpPct: 0,
  };
}

export function makeNuclear(overrides: Partial<NuclearState> = {}): NuclearState {
  return {
    hasNuclearWeapons: false,
    warheads: 0,
    icbms: 0,
    slbms: 0,
    strategicBombers: 0,
    tacticalWarheads: 0,
    missileSubmarines: 0,
    secondStrikeCapable: false,
    earlyWarningIndex: 20,
    readinessPct: 30,
    doctrine: 'None',
    ...overrides,
  };
}

export function emptyDiplomacy(): DiplomacyState {
  return {};
}

export function makeAlliances(overrides: Partial<AllianceMembership> = {}): AllianceMembership {
  return { natoMember: false, warsawPactMember: false, otherAlliances: [], ...overrides };
}

export function makePolitics(overrides: Partial<PoliticsState> & Pick<PoliticsState, 'headOfState' | 'headOfGovernment' | 'rulingPartyId' | 'parties' | 'legislatureName'>): PoliticsState {
  return {
    approvalPct: 55,
    nextElectionDate: { year: 1952, month: 11 },
    electionCycleMonths: 48,
    coalitionStabilityPct: 100,
    unrestIndex: 10,
    ...overrides,
  };
}

export interface LightNationSpec {
  code: string;
  name: string;
  mapId: string;
  aliasMapIds?: string[];
  alignment: Alignment;
  economyType?: EconomyType;
  gdpBillion: number;
  populationMillion: number;
  gdpGrowthPct: number;
  stabilityIndex: number;
  government: string;
  headOfState: string;
  militaryPersonnelThousands: number;
  resources: string[];
  colonialRuler?: PlayableCode;
  natoMember?: boolean;
  warsawPactMember?: boolean;
}

/** Builds a fully-valid but shallow CountryState for a non-major world nation. */
export function makeLightNation(spec: LightNationSpec): CountryState {
  const defense = Math.max(0.02, spec.gdpBillion * 0.03);
  return {
    code: spec.code,
    name: spec.name,
    isPlayable: false,
    isMajor: false,
    economyType: spec.economyType ?? 'market',
    alignment: spec.alignment,
    mapId: spec.mapId,
    economy: {
      gdpBillion: spec.gdpBillion,
      gdpGrowthPct: spec.gdpGrowthPct,
      gdpPerCapita: (spec.gdpBillion * 1000) / spec.populationMillion,
      populationMillion: spec.populationMillion,
      populationGrowthPct: 2.0,
      inflationPct: 4,
      unemploymentPct: 6,
      interestRatePct: 4,
      industrialProductionIndex: 100,
      agriculturalProductionIndex: 100,
      exportsBillion: spec.gdpBillion * 0.15,
      importsBillion: spec.gdpBillion * 0.16,
      currentAccountBillion: -spec.gdpBillion * 0.01,
      foreignReservesBillion: spec.gdpBillion * 0.05,
      exchangeRateToUSD: 1,
      moneySupplyBillion: spec.gdpBillion * 0.4,
      capitalStockBillion: spec.gdpBillion * 1.8,
      laborForceMillion: spec.populationMillion * 0.4,
      productivityIndex: 60,
      educationIndex: 45,
      infrastructureIndex: 40,
      energyIndex: 50,
      techIndex: 35,
      consumerGoodsIndex: 40,
    },
    budget: makeBudget(
      makeTaxRates({ incomeTaxPct: 12, corporateTaxPct: 25, salesTaxPct: 6, tariffPct: 15, payrollTaxPct: 2 }),
      makeSpending({ defense, healthcare: spec.gdpBillion * 0.01, education: spec.gdpBillion * 0.015, infrastructure: spec.gdpBillion * 0.02, administration: spec.gdpBillion * 0.02 }),
      spec.gdpBillion * 0.25,
    ),
    industry: makeIndustry({}),
    industrialInvestments: [],
    politics: makePolitics({
      headOfState: spec.headOfState,
      headOfGovernment: spec.headOfState,
      rulingPartyId: 'ruling',
      legislatureName: 'National Legislature',
      parties: [{ id: 'ruling', name: 'Governing Coalition', ideology: spec.government, seatSharePct: 100, popularSupportPct: 50, inGovernment: true }],
      approvalPct: 50,
    }),
    military: {
      branches: [makeBranch({ id: `${spec.code}_armed`, name: 'Armed Forces', personnelThousands: spec.militaryPersonnelThousands, equipmentModernityPct: 30 })],
      totalPersonnelThousands: spec.militaryPersonnelThousands,
      conscription: false,
      procurementBudgetBillion: defense * 0.3,
      researchBudgetBillion: 0,
      overseasBases: [],
    },
    nuclear: makeNuclear({}),
    procurement: [],
    diplomacy: emptyDiplomacy(),
    alliances: makeAlliances({ natoMember: !!spec.natoMember, warsawPactMember: !!spec.warsawPactMember }),
    stabilityIndex: spec.stabilityIndex,
    flags: {},
    resources: spec.resources,
    colonialRuler: spec.colonialRuler,
    government: spec.government,
  };
}
