import { useState } from 'react';
import { ClipboardCheck, Rocket } from 'lucide-react';
import DestinationInfo from '@/components/DestinationInfo';
import CrewMembers from '@/components/CrewMembers';
import GearLibrary from '@/components/GearLibrary';
import GearList from '@/components/GearList';
import WeightOverview from '@/components/WeightOverview';
import SmartTips from '@/components/SmartTips';
import PlanManager from '@/components/PlanManager';
import ExportPanel from '@/components/ExportPanel';
import CheckMode from '@/components/CheckMode';
import BackpackAllocation from '@/components/BackpackAllocation';
import ConsumableEstimatePanel from '@/components/ConsumableEstimatePanel';
import DepartureChecklist from '@/components/DepartureChecklist';
import { useGearStore } from '@/store/useGearStore';

function App() {
  const toggleCheckMode = useGearStore(state => state.toggleCheckMode);
  const checkMode = useGearStore(state => state.checkMode);
  const [showCheckMode, setShowCheckMode] = useState(false);
  const [showDepartureChecklist, setShowDepartureChecklist] = useState(false);

  const handleCheckMode = () => {
    toggleCheckMode();
    setShowCheckMode(true);
  };

  const handleCloseCheckMode = () => {
    setShowCheckMode(false);
    if (checkMode) {
      toggleCheckMode();
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white/80 backdrop-blur-md border-b border-cream-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⛺</div>
            <div>
              <h1 className="text-xl font-bold text-forest-800">露营装备清单</h1>
              <p className="text-xs text-earth-500">规划你的周末露营装备</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <PlanManager />
            <ExportPanel />
            <button
              onClick={() => setShowDepartureChecklist(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-camp-orange to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Rocket className="w-4 h-4" />
              出发前核对
            </button>
            <button
              onClick={handleCheckMode}
              data-check-mode
              className="flex items-center gap-2 px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-medium transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              检查模式
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DestinationInfo />
          </div>
          <div>
            <CrewMembers />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SmartTips />
          <div id="consumable-estimate">
            <ConsumableEstimatePanel />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-[600px]">
            <GearLibrary />
          </div>

          <div className="lg:col-span-5 h-[600px]">
            <GearList />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <WeightOverview />
          </div>
        </div>

        <div id="backpack-allocation">
          <BackpackAllocation />
        </div>
      </main>

      <footer className="text-center text-sm text-earth-400 py-4">
        <p>🏕️ 快乐露营，安全第一 · 请根据实际情况调整装备</p>
      </footer>

      {showCheckMode && <CheckMode onClose={handleCloseCheckMode} />}
      {showDepartureChecklist && (
        <DepartureChecklist onClose={() => setShowDepartureChecklist(false)} />
      )}
    </div>
  );
}

export default App;
