import type { WorldState } from './types';
import { isDateInRange } from './time';
import { HISTORICAL_EVENTS } from '../data/historicalEvents';

/** Checks every scripted historical event against the current month and applies any that fire. */
export function tickEvents(world: WorldState): string[] {
  const narratives: string[] = [];
  const firedIds = new Set(world.firedEvents.map((f) => f.id));

  for (const evt of HISTORICAL_EVENTS) {
    if (evt.oneTime && firedIds.has(evt.id)) continue;
    if (!isDateInRange(world.date, evt.earliestDate, evt.latestDate)) continue;
    if (!evt.condition(world)) continue;

    const narrative = evt.apply(world);
    world.firedEvents.push({ id: evt.id, date: { ...world.date }, narrative });
    narratives.push(narrative);
  }

  return narratives;
}
