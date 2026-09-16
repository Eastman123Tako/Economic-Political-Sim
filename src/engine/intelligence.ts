import type { CountryState, WorldState } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const drift = (current: number, target: number, speed: number) => current + (target - current) * speed;

export function tickIntelligence(world: WorldState, c: CountryState): void {
  const intel = c.intelligence;
  if (!intel) return;
  intel.capabilityIndex = clamp(drift(intel.capabilityIndex, 20 + intel.budgetBillion * 60 + c.economy.techIndex * 0.3, 0.05), 5, 100);

  for (const other of Object.values(world.countries)) {
    if (other.code === c.code) continue;
    const otherCounter = other.intelligence?.capabilityIndex ?? other.economy.techIndex * 0.4;
    const target = clamp(35 + (intel.capabilityIndex - otherCounter) * 0.8, 5, 98);
    intel.intelAccuracy[other.code] = clamp(drift(intel.intelAccuracy[other.code] ?? 30, target, 0.08), 5, 98);
  }
}

export function setIntelBudget(c: CountryState, billion: number): void {
  if (c.intelligence) c.intelligence.budgetBillion = Math.max(0, billion);
}
