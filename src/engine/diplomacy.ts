import type { BilateralRelation, CountryCode, CountryState, WorldState } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (current: number, target: number, speed: number) => current + (target - current) * speed;

function defaultRelation(): BilateralRelation {
  return {
    relationScore: 0, tradeVolumeBillion: 0, militaryCooperation: false, intelligenceSharing: false,
    economicDependencePct: 0, sanctioned: false, aidFlowMillionPerYear: 0, hasEmbassy: true, treaties: [],
  };
}

export function getRelation(c: CountryState, other: CountryCode): BilateralRelation {
  if (!c.diplomacy[other]) c.diplomacy[other] = defaultRelation();
  return c.diplomacy[other];
}

function blocOf(c: CountryState): 'west' | 'east' | 'other' {
  if (c.alignment === 'NATO') return 'west';
  if (c.alignment === 'WarsawPact') return 'east';
  return 'other';
}

/** Drifts every bilateral relation this nation holds toward an ideology/alliance-implied baseline. */
export function tickDiplomacy(world: WorldState, c: CountryState): void {
  const myBloc = blocOf(c);
  for (const otherCode of Object.keys(world.countries)) {
    if (otherCode === c.code) continue;
    const other = world.countries[otherCode];
    const rel = getRelation(c, otherCode);
    const otherBloc = blocOf(other);

    let target = 0;
    if (myBloc === otherBloc && myBloc !== 'other') target = 55;
    else if ((myBloc === 'west' && otherBloc === 'east') || (myBloc === 'east' && otherBloc === 'west')) target = -55;
    else target = 5;

    if (rel.militaryCooperation) target += 15;
    if (rel.sanctioned) target -= 25;
    if (rel.aidFlowMillionPerYear > 0) target += clamp(rel.aidFlowMillionPerYear / 100, 0, 15);

    rel.relationScore = clamp(drift(rel.relationScore, target, 0.03), -100, 100);
    rel.tradeVolumeBillion = Math.max(0, drift(rel.tradeVolumeBillion, Math.max(0, (rel.relationScore + 100) / 200) * Math.min(c.economy.gdpBillion, other.economy.gdpBillion) * 0.01, 0.05));
    rel.economicDependencePct = clamp(other.economy.gdpBillion > 0 ? (rel.tradeVolumeBillion / other.economy.gdpBillion) * 100 : 0, 0, 100);
  }
}

export function setAidFlow(c: CountryState, to: CountryCode, millionPerYear: number): void {
  const rel = getRelation(c, to);
  rel.aidFlowMillionPerYear = Math.max(0, millionPerYear);
}

export function applyRelationAction(world: WorldState, c: CountryState, to: CountryCode, action: 'sanction' | 'unsanction' | 'recognize' | 'shareIntel' | 'militaryCoop'): void {
  const rel = getRelation(c, to);
  const other = world.countries[to];
  switch (action) {
    case 'sanction': rel.sanctioned = true; rel.tradeVolumeBillion *= 0.3; break;
    case 'unsanction': rel.sanctioned = false; break;
    case 'recognize': rel.hasEmbassy = true; rel.relationScore = clamp(rel.relationScore + 10, -100, 100); break;
    case 'shareIntel': rel.intelligenceSharing = true; if (other) getRelation(other, c.code).intelligenceSharing = true; break;
    case 'militaryCoop': rel.militaryCooperation = true; break;
  }
}

/** Applies the yearly foreign-aid flows to recipient economies (called monthly, pro-rated). */
export function applyAidEffects(world: WorldState, c: CountryState): void {
  for (const [toCode, rel] of Object.entries(c.diplomacy)) {
    if (rel.aidFlowMillionPerYear <= 0) continue;
    const recipient = world.countries[toCode];
    if (!recipient) continue;
    const monthlyBillion = rel.aidFlowMillionPerYear / 1000 / 12;
    recipient.economy.gdpBillion += monthlyBillion * 0.6; // aid partially converts to output
    recipient.economy.foreignReservesBillion += monthlyBillion * 0.4;
    recipient.stabilityIndex = clamp(recipient.stabilityIndex + monthlyBillion * 0.5, 0, 100);
  }
}
