import { useEffect } from 'react';
import { CheckCircle, Circle, RotateCcw, X, Backpack as BackpackIcon } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { CATEGORY_LABELS, GearCategory } from '@/types';
import { formatWeight } from '@/utils/weightCalc';

interface CheckModeProps {
  onClose: () => void;
}

const CheckMode = ({ onClose }: CheckModeProps) => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const setCheckItem = useGearStore(state => state.setCheckItem);
  const resetCheckProgress = useGearStore(state => state.resetCheckProgress);
  const cleanupCheckProgress = useGearStore(state => state.cleanupCheckProgress);

  useEffect(() => {
    cleanupCheckProgress();
  }, [cleanupCheckProgress]);

  if (!plan) return null;

  const validItemIds = new Set(plan.gearList.map(i => i.id));
  const validCheckProgress = Object.entries(plan.checkProgress)
    .filter(([id]) => validItemIds.has(id));
  
  const totalItems = plan.gearList.length;
  const checkedItems = validCheckProgress.filter(([, checked]) => checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const categories = Object.keys(CATEGORY_LABELS) as GearCategory[];
  const itemsByCategory = categories.map(cat => ({
    category: cat,
    items: plan.gearList.filter(item => item.category === cat),
  })).filter(group => group.items.length > 0);

  const handleReset = () => {
    if (confirm('确定要重置所有检查进度吗？')) {
      resetCheckProgress();
    }
  };

  const getBackpackName = (backpackId?: string) => {
    if (!backpackId) return '未分配';
    const backpack = plan.backpacks.find(b => b.id === backpackId);
    if (!backpack) return '未分配';
    return backpack.name;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-hover w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-cream-200 bg-forest-500 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">✅</span>
              出发前检查
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {checkedItems}/{totalItems} 项
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {plan.gearList.length === 0 ? (
            <div className="text-center py-12 text-earth-400">
              <div className="text-5xl mb-3">📦</div>
              <p>清单中还没有装备</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itemsByCategory.map(({ category, items }) => {
                const categoryChecked = items.filter(i => plan.checkProgress[i.id]).length;
                
                return (
                  <div key={category} className="border border-cream-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-cream-50 border-b border-cream-200 flex items-center justify-between">
                      <h3 className="font-medium text-forest-800">
                        {CATEGORY_LABELS[category]}
                      </h3>
                      <span className="text-sm text-earth-500">
                        {categoryChecked}/{items.length}
                      </span>
                    </div>
                    
                    <div className="divide-y divide-cream-100">
                      {items.map(item => {
                        const isChecked = plan.checkProgress[item.id];
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => setCheckItem(item.id, !isChecked)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              isChecked ? 'bg-green-50' : 'hover:bg-cream-50'
                            }`}
                          >
                            {isChecked ? (
                              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-6 h-6 text-earth-300 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium ${
                                isChecked ? 'text-green-700 line-through' : 'text-forest-800'
                              }`}>
                                {item.name}
                              </div>
                              <div className="text-xs text-earth-500 flex flex-wrap gap-2">
                                <span>数量: {item.quantity}</span>
                                <span>·</span>
                                <span>{formatWeight(item.weight * item.quantity)}</span>
                                {item.isShared ? (
                                  <><span>·</span><span className="text-forest-600">共享装备</span></>
                                ) : (
                                  <>
                                    <span>·</span>
                                    <span className="text-earth-600">
                                      {plan.crew.find(c => c.id === item.carrierId)?.name || '未分配'}
                                    </span>
                                    {item.backpackId && (
                                      <>
                                        <span>·</span>
                                        <span className="text-forest-600 flex items-center gap-1">
                                          <BackpackIcon className="w-3 h-3" />
                                          {getBackpackName(item.backpackId)}
                                        </span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-cream-200 bg-cream-50 flex justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-earth-600 hover:bg-earth-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重置进度
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-medium transition-colors"
          >
            {progress === 100 ? '准备就绪！' : '完成检查'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckMode;
