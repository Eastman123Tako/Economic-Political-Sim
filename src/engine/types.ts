// Core type definitions for the Cold War grand-strategy simulation.
// Kept deliberately data-driven: gameplay content lives in /src/data, not here.

export type CountryCode = string; // ISO-ish 3-letter internal code, e.g. 'USA', 'SUN', 'GBR', 'FRA'

export interface GameDate {
  year: number;
  month: number; // 1-12
}

export type EconomyType = 'market' | 'planned' | 'mixed';

export type Alignment = 'NATO' | 'WarsawPact' | 'NonAligned' | 'Other';

export type PlayableCode = 'USA' | 'SUN' | 'GBR' | 'FRA';

// ---------------------------------------------------------------------------
// Macroeconomics
// ---------------------------------------------------------------------------

export interface EconomyState {
  gdpBillion: number; // nominal, in national currency-equivalent USD billions for comparability
  gdpGrowthPct: number; // annualized, trailing
  gdpPerCapita: number; // USD
  populationMillion: number;
  populationGrowthPct: number;
  inflationPct: number;
  unemploymentPct: number;
  interestRatePct: number;
  industrialProductionIndex: number; // base 100 = Jan 1949
  agriculturalProductionIndex: number;
  exportsBillion: number;
  importsBillion: number;
  currentAccountBillion: number;
  foreignReservesBillion: number;
  exchangeRateToUSD: number; // units of currency per 1 USD; USA = 1
  moneySupplyBillion: number;
  capitalStockBillion: number; // productive capital stock, drives growth model
  laborForceMillion: number;
  productivityIndex: number; // total factor productivity, base 100
  educationIndex: number; // 0-100
  infrastructureIndex: number; // 0-100
  energyIndex: number; // 0-100, energy availability/security
  techIndex: number; // 0-100, aggregate civilian+military technology level
  consumerGoodsIndex: number; // 0-100, availability of consumer goods (esp. relevant for USSR)
}

// Soviet-style centrally planned allocation (Gosplan). Shares must sum to ~1.
export interface PlannedEconomyState {
  investmentSharePct: number; // share of national income directed to new capital
  heavyIndustrySharePct: number;
  lightIndustrySharePct: number; // consumer goods
  agricultureSharePct: number;
  defenseSharePct: number;
  administrationSharePct: number;
  fiveYearPlanTarget: number; // target annual industrial growth %
  fiveYearPlanYear: number; // 1-5, which year of current plan
  plannerEfficiencyIndex: number; // 0-100, degrades with bureaucratic sclerosis, improves with reform
  privatePlotOutputShare: number; // small legal private agriculture, USSR-specific texture
}

// ---------------------------------------------------------------------------
// Government budget
// ---------------------------------------------------------------------------

export interface TaxRates {
  incomeTaxPct: number;
  corporateTaxPct: number;
  salesTaxPct: number;
  tariffPct: number;
  payrollTaxPct: number;
}

export interface BudgetRevenue {
  incomeTax: number;
  corporateTax: number;
  salesTax: number;
  tariffs: number;
  payroll: number;
  stateEnterprise: number; // profits remitted by state industry (large for USSR)
  other: number;
}

export interface BudgetSpending {
  defense: number;
  healthcare: number;
  education: number;
  infrastructure: number;
  welfare: number;
  pensions: number;
  foreignAid: number;
  research: number;
  administration: number;
  interestPayments: number; // computed, not directly settable
  subsidies: number;
  other: number;
}

export interface BudgetState {
  taxRates: TaxRates; // ignored (kept at 0) for planned economies
  spending: BudgetSpending; // billions/year, player-settable except interestPayments
  revenue: BudgetRevenue; // computed each tick
  totalRevenue: number;
  totalSpending: number;
  balance: number; // + surplus, - deficit
  debtBillion: number;
  debtToGdpPct: number;
}

// ---------------------------------------------------------------------------
// Industry
// ---------------------------------------------------------------------------

export type IndustrySector =
  | 'steel' | 'aluminum' | 'coal' | 'oil' | 'naturalGas' | 'electricity'
  | 'machinery' | 'automobiles' | 'aircraft' | 'shipbuilding' | 'electronics'
  | 'chemicals' | 'consumerGoods' | 'food' | 'precisionManufacturing';

export type IndustryState = Record<IndustrySector, number>; // capacity index, base 100 = Jan 1949

export interface IndustrialInvestment {
  id: string;
  name: string;
  sector: IndustrySector;
  annualCostBillion: number;
  monthsRemaining: number; // 0 once complete, effects then permanent
  capacityBonusPct: number; // eventual % bonus to sector capacity
  civConsumptionPenaltyPct: number; // small ongoing opportunity cost while active
}

// ---------------------------------------------------------------------------
// Politics
// ---------------------------------------------------------------------------

export interface PoliticalParty {
  id: string;
  name: string;
  ideology: string;
  seatSharePct: number; // parliament/congress
  popularSupportPct: number;
  inGovernment: boolean;
}

export interface PoliticsState {
  headOfState: string;
  headOfGovernment: string;
  rulingPartyId: string;
  parties: PoliticalParty[];
  approvalPct: number;
  nextElectionDate: GameDate;
  electionCycleMonths: number;
  legislatureName: string;
  coalitionStabilityPct: number; // relevant for France 4th Republic, multiparty systems
  unrestIndex: number; // 0-100 strikes/protests pressure
}

// ---------------------------------------------------------------------------
// Military
// ---------------------------------------------------------------------------

export interface MilitaryBranch {
  id: string;
  name: string;
  personnelThousands: number;
  readinessPct: number; // 0-100
  trainingPct: number; // 0-100
  equipmentModernityPct: number; // 0-100, weighted avg of active equipment ages/tech
  logisticsPct: number; // 0-100
  moraleePct: number; // 0-100
}

export type NuclearDoctrine =
  | 'None' | 'MassiveRetaliation' | 'FlexibleResponse' | 'Counterforce'
  | 'Countervalue' | 'NoFirstUse' | 'NuclearSharing' | 'LaunchOnWarning';

export interface NuclearState {
  hasNuclearWeapons: boolean;
  warheads: number;
  icbms: number;
  slbms: number;
  strategicBombers: number;
  tacticalWarheads: number;
  missileSubmarines: number;
  secondStrikeCapable: boolean;
  earlyWarningIndex: number; // 0-100
  readinessPct: number; // 0-100 (DEFCON-like inverse)
  doctrine: NuclearDoctrine;
}

export interface MilitaryState {
  branches: MilitaryBranch[];
  totalPersonnelThousands: number;
  conscription: boolean;
  procurementBudgetBillion: number; // derived slice of defense spending
  researchBudgetBillion: number;
  overseasBases: string[]; // country codes hosting bases
}

// ---------------------------------------------------------------------------
// Procurement
// ---------------------------------------------------------------------------

export type ProcurementCategory =
  | 'fighter' | 'bomber' | 'transport' | 'helicopter'
  | 'tank' | 'ifv' | 'artillery'
  | 'carrier' | 'destroyer' | 'submarine' | 'ssbn' | 'frigate'
  | 'icbm' | 'slbm' | 'irbm'
  | 'radar' | 'other';

export type ProcurementStatus = 'available' | 'development' | 'production' | 'delayed' | 'cancelled';

export interface ProcurementProgramDef {
  id: string;
  name: string;
  nation: PlayableCode;
  category: ProcurementCategory;
  historicalStartYear: number;
  developmentMonths: number;
  developmentCostBillion: number;
  unitProductionCostMillion: number;
  annualProductionCapacity: number; // max units/year at full funding
  techRequirement: number; // 0-100 techIndex needed to start
  manpowerRequirementThousands: number;
  reliabilityPct: number; // 0-100
  maintenanceCostMillionPerUnitYear: number;
  exportPotential: 'none' | 'low' | 'medium' | 'high';
  description: string;
}

export interface ProcurementProgramInstance {
  defId: string;
  status: ProcurementStatus;
  monthsElapsed: number;
  unitsProduced: number;
  unitsInService: number;
  fundingLevelPct: number; // 0-200, 100 = normal pace, <100 delay, >100 accelerate (costs more)
  exported: Record<CountryCode, number>; // units exported to whom
}

// ---------------------------------------------------------------------------
// Diplomacy
// ---------------------------------------------------------------------------

export interface BilateralRelation {
  relationScore: number; // -100 hostile .. +100 close ally
  tradeVolumeBillion: number;
  militaryCooperation: boolean;
  intelligenceSharing: boolean;
  economicDependencePct: number; // how dependent the *other* country is on this one
  sanctioned: boolean;
  aidFlowMillionPerYear: number; // from this country to the other
  hasEmbassy: boolean;
  treaties: string[];
}

export type DiplomacyState = Record<CountryCode, BilateralRelation>;

export interface AllianceMembership {
  natoMember: boolean;
  warsawPactMember: boolean;
  otherAlliances: string[];
}

// ---------------------------------------------------------------------------
// Intelligence
// ---------------------------------------------------------------------------

export interface IntelligenceState {
  agencyName: string;
  budgetBillion: number;
  capabilityIndex: number; // 0-100
  intelAccuracy: Record<CountryCode, number>; // 0-100, how well this nation knows another's true stats
}

// ---------------------------------------------------------------------------
// Colonial system (UK / France)
// ---------------------------------------------------------------------------

export type ColonialStrategy = 'maintain' | 'autonomy' | 'negotiate' | 'repress' | 'develop' | 'withdraw';

export interface ColonialTerritory {
  id: string;
  name: string;
  parent: PlayableCode;
  populationMillion: number;
  unrestIndex: number; // 0-100
  insurgencyActive: boolean;
  strategy: ColonialStrategy;
  monthsUnderCurrentStrategy: number;
  independent: boolean;
  independenceDate?: GameDate;
  annualCostBillion: number;
  cumulativeCasualties: number;
  internationalPressureIndex: number; // 0-100, UN/world opinion
}

// ---------------------------------------------------------------------------
// Country (full state)
// ---------------------------------------------------------------------------

export interface CountryState {
  code: CountryCode;
  name: string;
  isPlayable: boolean;
  isMajor: boolean; // full simulation depth vs light world-nation model
  economyType: EconomyType;
  alignment: Alignment;
  mapId: string; // numeric ISO-3166-1 id used by world-atlas topojson
  economy: EconomyState;
  planned?: PlannedEconomyState;
  budget: BudgetState;
  industry: IndustryState;
  industrialInvestments: IndustrialInvestment[];
  politics: PoliticsState;
  military: MilitaryState;
  nuclear: NuclearState;
  procurement: ProcurementProgramInstance[];
  diplomacy: DiplomacyState;
  alliances: AllianceMembership;
  intelligence?: IntelligenceState;
  colonies?: ColonialTerritory[];
  stabilityIndex: number; // 0-100 overall political-economic stability
  flags: Record<string, boolean | number | string>;
  resources?: string[]; // notable natural resources, display-only for light nations
  colonialRuler?: PlayableCode; // set while still a dependency, cleared on independence
  government?: string; // short descriptor, mainly for light (non-major) nations
}

// ---------------------------------------------------------------------------
// Historical events
// ---------------------------------------------------------------------------

export interface HistoricalEventDef {
  id: string;
  title: string;
  earliestDate: GameDate;
  latestDate: GameDate; // if not triggered by this date, event lapses
  /** returns true if this event's conditions are currently satisfied */
  condition: (world: WorldState) => boolean;
  /** applies the event's effects, mutating a draft of the world state */
  apply: (world: WorldState) => string; // returns narrative text for the report
  oneTime: boolean;
}

export interface FiredEventRecord {
  id: string;
  date: GameDate;
  narrative: string;
}

// ---------------------------------------------------------------------------
// World / top-level game state
// ---------------------------------------------------------------------------

export interface WorldState {
  date: GameDate;
  playerCode: PlayableCode;
  countries: Record<CountryCode, CountryState>;
  firedEvents: FiredEventRecord[];
  activeColonialConflicts: string[]; // colony ids
  nuclearWarOccurred: boolean;
  rngSeed: number;
  monthlyReports: MonthlyReport[]; // trailing history, capped
  gameOver: boolean;
  gameOverReason?: string;
}

export interface MonthlyReport {
  date: GameDate;
  countryCode: CountryCode;
  headline: string;
  bullets: string[];
  economy: Pick<EconomyState, 'gdpBillion' | 'gdpGrowthPct' | 'inflationPct' | 'unemploymentPct'>;
  budget: Pick<BudgetState, 'totalRevenue' | 'totalSpending' | 'balance' | 'debtBillion'>;
  approvalPct: number;
  events: string[];
}

// ---------------------------------------------------------------------------
// Player actions (intents applied before a tick, or immediately)
// ---------------------------------------------------------------------------

export type PlayerAction =
  | { type: 'setTaxRate'; field: keyof TaxRates; value: number }
  | { type: 'setSpending'; field: keyof BudgetSpending; value: number }
  | { type: 'setPlannedShare'; field: keyof PlannedEconomyState; value: number }
  | { type: 'startIndustrialInvestment'; investment: IndustrialInvestment }
  | { type: 'startProcurement'; defId: string }
  | { type: 'setProcurementFunding'; defId: string; fundingLevelPct: number }
  | { type: 'cancelProcurement'; defId: string }
  | { type: 'exportProcurement'; defId: string; to: CountryCode; units: number }
  | { type: 'setNuclearDoctrine'; doctrine: NuclearDoctrine }
  | { type: 'setAidFlow'; to: CountryCode; millionPerYear: number }
  | { type: 'setRelationAction'; to: CountryCode; action: 'sanction' | 'unsanction' | 'recognize' | 'shareIntel' | 'militaryCoop' }
  | { type: 'setColonialStrategy'; colonyId: string; strategy: ColonialStrategy }
  | { type: 'setConscription'; enabled: boolean }
  | { type: 'setIntelBudget'; billion: number };
