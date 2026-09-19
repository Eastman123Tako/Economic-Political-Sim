import { useGameStore } from './store/gameStore';
import NationSelect from './components/NationSelect';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import WorldMap from './components/WorldMap';
import CountryInfoPanel from './components/CountryInfoPanel';
import ReportModal from './components/ReportModal';
import HelpModal from './components/HelpModal';
import ToastStack from './components/ToastStack';
import EconomyPanel from './components/panels/EconomyPanel';
import IndustryPanel from './components/panels/IndustryPanel';
import PoliticsPanel from './components/panels/PoliticsPanel';
import MilitaryPanel from './components/panels/MilitaryPanel';
import ProcurementPanel from './components/panels/ProcurementPanel';
import NuclearPanel from './components/panels/NuclearPanel';
import TechnologyPanel from './components/panels/TechnologyPanel';
import DiplomacyPanel from './components/panels/DiplomacyPanel';
import ColoniesPanel from './components/panels/ColoniesPanel';
import IntelligencePanel from './components/panels/IntelligencePanel';

function GameScreen() {
  const activePanel = useGameStore((s) => s.activePanel);
  const reportOpen = useGameStore((s) => s.reportOpen);
  const helpOpen = useGameStore((s) => s.helpOpen);

  return (
    <div className="h-screen w-full flex flex-col bg-void-950">
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <div className="flex-1 min-w-0 relative overflow-y-auto">
          {activePanel === 'map' && (
            <div className="flex h-full">
              <div className="flex-1"><WorldMap /></div>
              <CountryInfoPanel />
            </div>
          )}
          {activePanel === 'economy' && <EconomyPanel />}
          {activePanel === 'industry' && <IndustryPanel />}
          {activePanel === 'politics' && <PoliticsPanel />}
          {activePanel === 'military' && <MilitaryPanel />}
          {activePanel === 'procurement' && <ProcurementPanel />}
          {activePanel === 'nuclear' && <NuclearPanel />}
          {activePanel === 'technology' && <TechnologyPanel />}
          {activePanel === 'diplomacy' && <DiplomacyPanel />}
          {activePanel === 'colonies' && <ColoniesPanel />}
          {activePanel === 'intelligence' && <IntelligencePanel />}
        </div>
      </div>
      {reportOpen && <ReportModal />}
      {helpOpen && <HelpModal />}
      <ToastStack />
    </div>
  );
}

export default function App() {
  const world = useGameStore((s) => s.world);
  return world ? <GameScreen /> : <NationSelect />;
}
