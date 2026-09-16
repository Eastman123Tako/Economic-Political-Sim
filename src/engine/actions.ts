import type { PlayerAction, WorldState } from './types';
import { setTaxRate, setSpending } from './budget';
import { startIndustrialInvestment } from './industry';
import { startProgram, setProgramFunding, cancelProgram, exportUnits } from './procurement';
import { setNuclearDoctrine } from './nuclear';
import { setAidFlow, applyRelationAction } from './diplomacy';
import { setIntelBudget } from './intelligence';

/** Applies one player-issued action immediately (outside the monthly tick) to the player's nation. */
export function applyPlayerAction(world: WorldState, action: PlayerAction): void {
  const c = world.countries[world.playerCode];
  switch (action.type) {
    case 'setTaxRate': setTaxRate(c, action.field, action.value); break;
    case 'setSpending': setSpending(c, action.field, action.value); break;
    case 'setPlannedShare': if (c.planned) (c.planned[action.field] as number) = action.value; break;
    case 'startIndustrialInvestment': startIndustrialInvestment(c, action.investment); break;
    case 'startProcurement': startProgram(c, action.defId); break;
    case 'setProcurementFunding': setProgramFunding(c, action.defId, action.fundingLevelPct); break;
    case 'cancelProcurement': cancelProgram(c, action.defId); break;
    case 'exportProcurement': exportUnits(c, action.defId, action.to, action.units); break;
    case 'setNuclearDoctrine': setNuclearDoctrine(c, action.doctrine); break;
    case 'setAidFlow': setAidFlow(c, action.to, action.millionPerYear); break;
    case 'setRelationAction': applyRelationAction(world, c, action.to, action.action); break;
    case 'setColonialStrategy': {
      const col = c.colonies?.find((x) => x.id === action.colonyId);
      if (col) { col.strategy = action.strategy; col.monthsUnderCurrentStrategy = 0; }
      break;
    }
    case 'setConscription': c.military.conscription = action.enabled; break;
    case 'setIntelBudget': setIntelBudget(c, action.billion); break;
  }
}
