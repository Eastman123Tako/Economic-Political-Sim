import { create } from 'zustand';
import type { PlayableCode, PlayerAction, WorldState } from '../engine/types';
import { createInitialWorld, tickMonth } from '../engine/simulation';
import { applyPlayerAction } from '../engine/actions';
import { autosave, loadGame, saveGame, listSaveSlots, deleteSave, type SaveMeta } from '../engine/save';

export type GameSpeed = 'paused' | 'normal' | 'fast' | 'veryfast';

export const SPEED_INTERVAL_MS: Record<GameSpeed, number | null> = {
  paused: null,
  normal: 900,
  fast: 350,
  veryfast: 120,
};

interface GameStoreState {
  world: WorldState | null;
  speed: GameSpeed;
  selectedCountryCode: string | null;
  activePanel: string;
  reportOpen: boolean;
  version: number; // bumped on every mutation so React re-renders (world is mutated in place for perf)

  startGame: (playerCode: PlayableCode) => void;
  tick: () => void;
  tickN: (n: number) => void;
  setSpeed: (speed: GameSpeed) => void;
  dispatch: (action: PlayerAction) => void;
  selectCountry: (code: string | null) => void;
  setActivePanel: (panel: string) => void;
  setReportOpen: (open: boolean) => void;
  saveToSlot: (slot: string, label: string) => void;
  loadFromSlot: (slot: string) => void;
  listSlots: () => SaveMeta[];
  removeSlot: (slot: string) => void;
  quitToMenu: () => void;
}

let monthsSinceAutosave = 0;

export const useGameStore = create<GameStoreState>((set, get) => ({
  world: null,
  speed: 'paused',
  selectedCountryCode: null,
  activePanel: 'economy',
  reportOpen: false,
  version: 0,

  startGame: (playerCode) => {
    set({ world: createInitialWorld(playerCode), speed: 'paused', selectedCountryCode: playerCode, activePanel: 'economy', version: 0 });
  },

  tick: () => {
    const { world } = get();
    if (!world) return;
    tickMonth(world);
    monthsSinceAutosave += 1;
    if (monthsSinceAutosave >= 6) {
      monthsSinceAutosave = 0;
      autosave(world);
    }
    if (world.gameOver) set({ speed: 'paused' });
    set((s) => ({ version: s.version + 1 }));
  },

  tickN: (n) => {
    for (let i = 0; i < n; i++) get().tick();
  },

  setSpeed: (speed) => set({ speed }),

  dispatch: (action) => {
    const { world } = get();
    if (!world) return;
    applyPlayerAction(world, action);
    set((s) => ({ version: s.version + 1 }));
  },

  selectCountry: (code) => set({ selectedCountryCode: code }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setReportOpen: (open) => set({ reportOpen: open }),

  saveToSlot: (slot, label) => {
    const { world } = get();
    if (!world) return;
    saveGame(world, slot, label);
    set((s) => ({ version: s.version + 1 }));
  },

  loadFromSlot: (slot) => {
    const world = loadGame(slot);
    if (!world) return;
    set({ world, speed: 'paused', selectedCountryCode: world.playerCode, version: 0 });
  },

  listSlots: () => listSaveSlots(),
  removeSlot: (slot) => { deleteSave(slot); set((s) => ({ version: s.version + 1 })); },

  quitToMenu: () => set({ world: null, speed: 'paused' }),
}));
