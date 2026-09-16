# The Cold War: 1949-1991

A browser-based economic/political/military grand-strategy simulation of the
Cold War. Play as the United States, Soviet Union, United Kingdom, or France
from January 1949 and advance month by month toward 1991, managing budgets,
taxation, industrial policy, elections, military procurement, nuclear
doctrine, diplomacy, foreign aid, and decolonization. History can happen --
or you can change it.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Zustand for UI state
- `react-simple-maps` (topojson via `world-atlas`) for the interactive map
- No backend: saves live in `localStorage` (multiple manual slots + autosave)

## Architecture

The simulation is a plain-TypeScript engine, independent of React:

```
src/engine/       Core simulation systems (types, time, economy, budget,
                   industry, politics, military, procurement, nuclear,
                   diplomacy, colonies, intelligence, AI, historical events,
                   simulation orchestrator, save/load)
src/data/         Content: starting stats for the four major powers and ~45
                   other world nations, procurement program definitions,
                   historical event scripts, historical leader successions
src/store/        Zustand store wrapping engine state for the UI
src/components/   React UI (map, panels, reports, nation select)
```

`tickMonth(world)` in `src/engine/simulation.ts` advances one month: it runs
AI decisions for non-player major powers, then economy/budget/industry/
military/procurement/nuclear ticks for every major power, diplomacy drift
and aid effects for every nation, politics/elections and colonial ticks,
then checks the historical event script against the new world state before
generating that month's report.

Growth, budgets, elections, and military modernization are computed
deterministically from policy inputs (tax rates, spending shares, planned-
economy allocations, procurement funding) rather than randomized -- the
sandbox is meant to diverge from history because of player decisions, not
dice rolls. Historical events (Korean War, Sputnik, Cuban Missile Crisis,
decolonization, détente, the end of the Cold War, etc.) are conditional: each
checks the live world state before firing, so a sufficiently different
history can delay, avert, or reshape them.

## Running it

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck + production build
```

## Scope notes

This is a deep but necessarily simplified model of 42 years of global
history. Notable simplifications: the four major powers get full economic/
political/military depth, while ~45 other nations get a lighter economic
model and are mostly reactive (diplomacy, aid, alignment, colonial status);
Germany is represented as a single map shape (West Germany is the playable
data, East Germany exists only as flags/relations); nuclear breakout is
gated by a historical-minimum date plus a tech threshold rather than an
open-ended research tree; and combat is deliberately not modeled beyond
force posture, readiness, and procurement -- this is a statecraft simulator,
not an RTS.
