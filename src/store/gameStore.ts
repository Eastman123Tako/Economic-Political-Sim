import { create } from 'zustand';
import type { PlayableCode, PlayerAction, WorldState } from '../engine/types';
import { createInitialWorld, tickMonth } from '../engine/simulation';
import { applyPlayerAction } from '../engine/actions';
import { autosave, loadGame, saveGame, listSaveSlots, deleteSave, type SaveMeta } from '../engine/save';
import { defById } from '../engine/procurement';

export type GameSpeed = 'paused' | 'normal' | 'fast' | 'veryfast';

export const SPEED_INTERVAL_MS: Record<GameSpeed, number | null> = {
  paused: null,
  normal: 900,
  fast: 350,
  veryfast: 120,
};

export type ToastTone = 'info' | 'good' | 'bad' | 'event';

export interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
}

// Human-readable confirmations for the action types worth interrupting the
// player to acknowledge -- tax/spending slider drags are deliberately silent.
function describeAction(action: PlayerAction, world: WorldState): string | null {
  switch (action.type) {
    case 'startProcurement': return `Procurement program funded: ${defById(action.defId)?.name ?? action.defId}.`;
    case 'cancelProcurement': return `Procurement program cancelled: ${defById(action.defId)?.name ?? action.defId}.`;
    case 'startIndustrialInvestment': return `Launched industrial program: ${action.investment.name}.`;
    case 'setNuclearDoctrine': return `Nuclear doctrine set to ${action.doctrine}.`;
    case 'setColonialStrategy': return `Colonial strategy updated: ${action.strategy}.`;
    case 'setConscription': return action.enabled ? 'Conscription reinstated.' : 'Conscription ended.';
    case 'setRelationAction': {
      const target = world.countries[action.to]?.name ?? action.to;
      if (action.action === 'sanction') return `Sanctions imposed on ${target}.`;
      if (action.action === 'unsanction') return `Sanctions lifted on ${target}.`;
      if (action.action === 'militaryCoop') return `Military cooperation agreement signed with ${target}.`;
      if (action.action === 'shareIntel') return `Intelligence-sharing agreement signed with ${target}.`;
      return null;
    }
    case 'setAidFlow': {
      const target = world.countries[action.to]?.name ?? action.to;
      return action.millionPerYear > 0 ? `Foreign aid to ${target} set to $${action.millionPerYear}M/yr.` : `Foreign aid to ${target} ended.`;
    }
    default:
      return null;
  }
}

interface GameStoreState {
  world: WorldState | null;
  speed: GameSpeed;
  selectedCountryCode: string | null;
  activePanel: string;
  reportOpen: boolean;
  helpOpen: boolean;
  toasts: Toast[];
  version: number; // bumped on every mutation so React re-renders (world is mutated in place for perf)

  startGame: (playerCode: PlayableCode) => void;
  tick: () => void;
  tickN: (n: number) => void;
  setSpeed: (speed: GameSpeed) => void;
  togglePause: () => void;
  dispatch: (action: PlayerAction) => void;
  selectCountry: (code: string | null) => void;
  setActivePanel: (panel: string) => void;
  setReportOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  pushToast: (text: string, tone?: ToastTone) => void;
  dismissToast: (id: number) => void;
  saveToSlot: (slot: string, label: string) => void;
  loadFromSlot: (slot: string) => void;
  listSlots: () => SaveMeta[];
  removeSlot: (slot: string) => void;
  quitToMenu: () => void;
}

let monthsSinceAutosave = 0;
let toastSeq = 0;

export const useGameStore = create<GameStoreState>((set, get) => ({
  world: null,
  speed: 'paused',
  selectedCountryCode: null,
  activePanel: 'economy',
  reportOpen: false,
  helpOpen: false,
  toasts: [],
  version: 0,

  startGame: (playerCode) => {
    set({ world: createInitialWorld(playerCode), speed: 'paused', selectedCountryCode: playerCode, activePanel: 'economy', version: 0, toasts: [] });
  },

  tick: () => {
    const { world } = get();
    if (!world) return;
    const firedBefore = world.firedEvents.length;
    tickMonth(world);
    const firedAfter = world.firedEvents.length;

    monthsSinceAutosave += 1;
    if (monthsSinceAutosave >= 6) {
      monthsSinceAutosave = 0;
      autosave(world);
    }

    if (firedAfter > firedBefore) {
      // A scripted historical event fired -- interrupt the player rather
      // than letting it scroll past silently at high simulation speed.
      for (const ev of world.firedEvents.slice(firedBefore)) get().pushToast(ev.narrative, 'event');
      set({ speed: 'paused', reportOpen: true });
    }
    if (world.gameOver) set({ speed: 'paused' });
    set((s) => ({ version: s.version + 1 }));
  },

  tickN: (n) => {
    for (let i = 0; i < n; i++) get().tick();
  },

  setSpeed: (speed) => set({ speed }),
  togglePause: () => set((s) => ({ speed: s.speed === 'paused' ? 'normal' : 'paused' })),

  dispatch: (action) => {
    const { world } = get();
    if (!world) return;
    applyPlayerAction(world, action);
    const msg = describeAction(action, world);
    if (msg) get().pushToast(msg, 'info');
    set((s) => ({ version: s.version + 1 }));
  },

  selectCountry: (code) => set({ selectedCountryCode: code }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setReportOpen: (open) => set({ reportOpen: open }),
  setHelpOpen: (open) => set({ helpOpen: open }),

  pushToast: (text, tone = 'info') => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts.slice(-4), { id, text, tone }] }));
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  saveToSlot: (slot, label) => {
    const { world } = get();
    if (!world) return;
    saveGame(world, slot, label);
    get().pushToast(`Saved: ${label}`, 'good');
    set((s) => ({ version: s.version + 1 }));
  },

  loadFromSlot: (slot) => {
    const world = loadGame(slot);
    if (!world) return;
    set({ world, speed: 'paused', selectedCountryCode: world.playerCode, version: 0, toasts: [] });
  },

  listSlots: () => listSaveSlots(),
  removeSlot: (slot) => { deleteSave(slot); set((s) => ({ version: s.version + 1 })); },

  quitToMenu: () => set({ world: null, speed: 'paused', toasts: [] }),
}));
