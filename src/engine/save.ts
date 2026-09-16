import type { WorldState } from './types';

const SAVE_PREFIX = 'coldwar_save_';
const SLOT_INDEX_KEY = 'coldwar_save_slots';

export interface SaveMeta {
  slot: string;
  label: string;
  savedAt: string;
  dateLabel: string;
  playerCode: string;
}

function slotKey(slot: string): string {
  return `${SAVE_PREFIX}${slot}`;
}

export function saveGame(world: WorldState, slot: string, label: string): void {
  const payload = { world, meta: { slot, label, savedAt: new Date().toISOString(), dateLabel: `${world.date.month}/${world.date.year}`, playerCode: world.playerCode } };
  localStorage.setItem(slotKey(slot), JSON.stringify(payload));
  const slots = listSaveSlots().filter((s) => s.slot !== slot);
  slots.push(payload.meta);
  localStorage.setItem(SLOT_INDEX_KEY, JSON.stringify(slots));
}

export function autosave(world: WorldState): void {
  saveGame(world, 'autosave', 'Autosave');
}

export function loadGame(slot: string): WorldState | null {
  const raw = localStorage.getItem(slotKey(slot));
  if (!raw) return null;
  try {
    return (JSON.parse(raw).world as WorldState);
  } catch {
    return null;
  }
}

export function listSaveSlots(): SaveMeta[] {
  const raw = localStorage.getItem(SLOT_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SaveMeta[];
  } catch {
    return [];
  }
}

export function deleteSave(slot: string): void {
  localStorage.removeItem(slotKey(slot));
  const slots = listSaveSlots().filter((s) => s.slot !== slot);
  localStorage.setItem(SLOT_INDEX_KEY, JSON.stringify(slots));
}

export const AUTOSAVE_SLOT = 'autosave';
