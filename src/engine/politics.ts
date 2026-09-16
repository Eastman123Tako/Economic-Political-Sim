import type { CountryState, GameDate } from './types';
import { addMonths, compareDates } from './time';
import { HISTORICAL_LEADERS } from '../data/historicalLeaders';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (current: number, target: number, speed: number) => current + (target - current) * speed;

/** Applies a scripted historical leadership change for AI-controlled nations, if one falls this month. */
function applyHistoricalLeaderIfDue(c: CountryState, date: GameDate, isPlayer: boolean): string | null {
  if (isPlayer) return null;
  const list = HISTORICAL_LEADERS[c.code];
  if (!list) return null;
  const hit = list.find((t) => t.date.year === date.year && t.date.month === date.month);
  if (!hit) return null;
  c.politics.headOfState = hit.headOfState;
  c.politics.headOfGovernment = hit.headOfGovernment;
  if (!c.politics.parties.some((p) => p.id === hit.rulingPartyId)) {
    c.politics.parties.forEach((p) => { p.inGovernment = false; });
    c.politics.parties.push({ id: hit.rulingPartyId, name: hit.rulingPartyId, ideology: 'Governing coalition', seatSharePct: 45, popularSupportPct: 45, inGovernment: true });
  } else {
    c.politics.parties.forEach((p) => { p.inGovernment = p.id === hit.rulingPartyId; });
  }
  c.politics.rulingPartyId = hit.rulingPartyId;
  c.politics.approvalPct = clamp(c.politics.approvalPct + 5, 5, 95);
  return `${c.name}: ${hit.headOfGovernment} takes office as head of government.`;
}

function resolveElection(c: CountryState, date: GameDate): string {
  const p = c.politics;
  for (const party of p.parties) {
    const incumbentBonus = party.inGovernment ? (p.approvalPct - 50) * 0.7 : (50 - p.approvalPct) * 0.35;
    party.popularSupportPct = clamp(party.popularSupportPct * 0.5 + (party.popularSupportPct + incumbentBonus) * 0.5, 1, 90);
  }
  const totalSupport = p.parties.reduce((s, pa) => s + pa.popularSupportPct, 0) || 1;
  for (const party of p.parties) {
    // First-past-the-post systems (US/UK) amplify the leading party's seat share vs. pure PR (France).
    const majoritarianBonus = c.code === 'FRA' ? 1.0 : 1.35;
    party.seatSharePct = clamp((party.popularSupportPct / totalSupport) * 100 * majoritarianBonus, 0, 100);
  }
  const seatTotal = p.parties.reduce((s, pa) => s + pa.seatSharePct, 0) || 1;
  for (const party of p.parties) party.seatSharePct = (party.seatSharePct / seatTotal) * 100;

  const winner = [...p.parties].sort((a, b) => b.seatSharePct - a.seatSharePct)[0];
  const changed = winner.id !== p.rulingPartyId;
  p.parties.forEach((party) => { party.inGovernment = party.id === winner.id; });
  p.rulingPartyId = winner.id;

  // Even when the same party wins, term limits/succession mean the individual
  // leader eventually changes; termsSinceLeaderChange tracks consecutive wins.
  const termsKey = 'termsSinceLeaderChange';
  const termsSinceChange = (c.flags[termsKey] as number) ?? 1;
  const leaderRefreshed = changed || termsSinceChange >= 2;
  if (leaderRefreshed) {
    p.headOfGovernment = `${winner.name} Leader`;
    p.approvalPct = clamp((p.approvalPct + 55) / 2, 5, 95); // fresh-mandate bump toward 55
    c.flags[termsKey] = 1;
  } else {
    c.flags[termsKey] = termsSinceChange + 1;
  }
  p.coalitionStabilityPct = c.code === 'FRA' ? clamp(40 + winner.seatSharePct * 0.5, 10, 100) : 100;
  p.nextElectionDate = addMonths(date, p.electionCycleMonths);
  if (changed) return `${c.name}: Election held -- ${winner.name} forms a new government.`;
  return leaderRefreshed
    ? `${c.name}: Election held -- ${winner.name} retains power under a new leader.`
    : `${c.name}: Election held -- ${winner.name} is returned to power.`;
}

export function tickPolitics(c: CountryState, date: GameDate, isPlayer: boolean): string[] {
  const bullets: string[] = [];
  const e = c.economy;
  const p = c.politics;
  const trendGrowth = c.economyType === 'planned' ? (c.planned?.fiveYearPlanTarget ?? 5) : 3.0;

  const defenseShareOfGdp = e.gdpBillion > 0 ? c.budget.spending.defense / e.gdpBillion : 0;
  const colonialUnrest = (c.colonies ?? []).reduce((s, col) => s + (col.insurgencyActive ? col.unrestIndex * 0.02 : 0), 0);

  const unrestTarget = clamp(
    8 + Math.max(0, e.inflationPct - 6) * 1.2 + Math.max(0, e.unemploymentPct - 6) * 1.1 + colonialUnrest + Math.max(0, defenseShareOfGdp - 0.15) * 40,
    0, 100,
  );
  p.unrestIndex = clamp(drift(p.unrestIndex, unrestTarget, 0.08), 0, 100);

  const approvalTarget = clamp(
    50 + (e.gdpGrowthPct - trendGrowth) * 3 - Math.max(0, e.inflationPct - 5) * 1.4 - Math.max(0, e.unemploymentPct - 5) * 1.6 - (p.unrestIndex - 10) * 0.3,
    5, 95,
  );
  p.approvalPct = clamp(drift(p.approvalPct, approvalTarget, 0.06), 2, 98);

  if (c.code === 'FRA' && date.year < 1959) {
    p.coalitionStabilityPct = clamp(drift(p.coalitionStabilityPct, clamp(70 - p.unrestIndex * 0.8, 5, 100), 0.1), 0, 100);
    if (p.coalitionStabilityPct < 25) {
      bullets.push(`${c.name}: The governing coalition collapses; a new cabinet is formed amid Fourth Republic instability.`);
      p.coalitionStabilityPct = 55;
      p.headOfGovernment = `${p.rulingPartyId.toUpperCase()} Coalition Cabinet`;
    }
  }

  c.stabilityIndex = clamp(
    drift(c.stabilityIndex, 0.45 * p.approvalPct + 0.35 * (100 - p.unrestIndex) + 0.20 * p.coalitionStabilityPct, 0.08),
    0, 100,
  );

  const histNote = applyHistoricalLeaderIfDue(c, date, isPlayer);
  if (histNote) bullets.push(histNote);

  if (p.electionCycleMonths < 900 && compareDates(date, p.nextElectionDate) >= 0 && !histNote) {
    bullets.push(resolveElection(c, date));
  }

  return bullets;
}
