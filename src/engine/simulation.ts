import type { CountryState, MonthlyReport, PlayableCode, WorldState } from './types';
import { START_DATE, addMonths, formatDate, isGameOver } from './time';
import { PLAYABLE_NATIONS } from '../data/nationsData';
import { WORLD_NATIONS } from '../data/worldData';
import { tickBudget } from './budget';
import { tickEconomy, tickLightNationEconomy } from './economy';
import { tickIndustry } from './industry';
import { tickMilitary } from './military';
import { tickProcurement } from './procurement';
import { tickNuclear } from './nuclear';
import { tickPolitics } from './politics';
import { tickColonies } from './colonies';
import { tickDiplomacy, applyAidEffects } from './diplomacy';
import { tickAI } from './ai';
import { tickEvents } from './eventsEngine';
import { tickIntelligence } from './intelligence';

export function createInitialWorld(playerCode: PlayableCode): WorldState {
  const countries: Record<string, CountryState> = {};
  for (const nation of [...PLAYABLE_NATIONS, ...WORLD_NATIONS]) {
    countries[nation.code] = structuredClone(nation);
  }
  return {
    date: { ...START_DATE },
    playerCode,
    countries,
    firedEvents: [],
    activeColonialConflicts: [],
    nuclearWarOccurred: false,
    rngSeed: 19490101,
    monthlyReports: [],
    gameOver: false,
  };
}

function generateMonthlyReport(world: WorldState, playerBullets: string[], globalBullets: string[]): MonthlyReport {
  const c = world.countries[world.playerCode];
  const bullets = [...playerBullets, ...globalBullets].slice(0, 12);
  return {
    date: { ...world.date },
    countryCode: c.code,
    headline: `${c.name} -- ${formatDate(world.date)}`,
    bullets,
    economy: {
      gdpBillion: c.economy.gdpBillion,
      gdpGrowthPct: c.economy.gdpGrowthPct,
      inflationPct: c.economy.inflationPct,
      unemploymentPct: c.economy.unemploymentPct,
    },
    budget: {
      totalRevenue: c.budget.totalRevenue,
      totalSpending: c.budget.totalSpending,
      balance: c.budget.balance,
      debtBillion: c.budget.debtBillion,
    },
    approvalPct: c.politics.approvalPct,
    events: globalBullets,
  };
}

/** Advances the simulation by exactly one month, mutating world in place. */
export function tickMonth(world: WorldState): void {
  if (world.gameOver) return;

  tickAI(world);

  const globalBullets: string[] = [];

  for (const c of Object.values(world.countries)) {
    if (c.isMajor) {
      tickBudget(c);
      tickEconomy(c);
      tickIndustry(c);
      tickMilitary(c);
      tickProcurement(c);
      const nuclearNote = tickNuclear(c, world.date);
      if (nuclearNote) globalBullets.push(nuclearNote);
      tickIntelligence(world, c);
    } else {
      tickLightNationEconomy(c);
    }
  }

  for (const c of Object.values(world.countries)) tickDiplomacy(world, c);
  for (const c of Object.values(world.countries)) {
    if (c.isMajor) applyAidEffects(world, c);
  }

  const playerBullets: string[] = [];
  for (const c of Object.values(world.countries)) {
    if (!c.isMajor) continue;
    const isPlayer = c.code === world.playerCode;
    const politicsBullets = tickPolitics(c, world.date, isPlayer);
    const colonyBullets = tickColonies(world, c, world.date);
    if (isPlayer) playerBullets.push(...politicsBullets, ...colonyBullets);
    else globalBullets.push(...politicsBullets, ...colonyBullets);
  }

  globalBullets.push(...tickEvents(world));

  const report = generateMonthlyReport(world, playerBullets, globalBullets);
  world.monthlyReports.push(report);
  if (world.monthlyReports.length > 620) world.monthlyReports.shift();

  world.date = addMonths(world.date, 1);
  if (isGameOver(world.date)) {
    world.gameOver = true;
    world.gameOverReason = 'The Cold War era (1949-1991) has concluded.';
  }
}

export function tickMonths(world: WorldState, n: number): void {
  for (let i = 0; i < n && !world.gameOver; i++) tickMonth(world);
}
