import { useEffect } from 'react';
import { CheckCircle, Circle, RotateCcw, X, Backpack as BackpackIcon, Package } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { formatWeight, getBackpackItems, getUnassignedItems } from '@/utils/weightCalc';

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

  const handleReset = () => {
    if (confirm('确定要重置所有检查进度吗？')) {
      resetCheckProgress();
    }
  };

  const sharedItems = plan.gearList.filter(item => item.isShared);
  const unassignedItems = getUnassignedItems(plan.gearList);

  const getMemberBackpacks = (memberId: string) => {
    return plan.backpacks.filter(b => b.ownerId === memberId);
  };

  const CheckItemRow = ({ itemId, name, quantity, weight, subInfo }: {
    itemId: string;
    name: string;
    quantity: number;
    weight: number;
    subInfo?: string;
  }) => {
    const isChecked = plan.checkProgress[itemId];
    return (
      <button
        onClick={() => setCheckItem(itemId, !isChecked)}
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
            {name}
          </div>
          <div className="text-xs text-earth-500 flex flex-wrap gap-2">
            <span>数量: {quantity}</span>
            <span>·</span>
            <span>{formatWeight(weight)}</span>
            {subInfo && (
              <>
                <span>·</span>
                <span>{subInfo}</span>
              </>
            )}
          </div>
        </div>
      </button>
    );
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
              {plan.crew.map(member => {
                const memberBackpacks = getMemberBackpacks(member.id);
                const memberUnassigned = unassignedItems.filter(
                  ({ item }) => item.carrierId === member.id
                );

                if (memberBackpacks.length === 0 && memberUnassigned.length === 0) {
                  return null;
                }

                return (
                  <div key={member.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: member.avatarColor }}
                      />
                      <h3 className="font-medium text-forest-800">
                        {member.name}的装备
                      </h3>
                    </div>

                    {memberBackpacks.map(backpack => {
                      const bpItems = getBackpackItems(backpack.id, plan.gearList);
                      const bpWeight = bpItems.reduce(
                        (sum, { item, quantity }) => sum + item.weight * quantity, 0
                      );
                      const bpChecked = bpItems.filter(
                        ({ item }) => plan.checkProgress[item.id]
                      ).length;

                      return (
                        <div
                          key={backpack.id}
                          className="border border-cream-200 rounded-xl overflow-hidden ml-5"
                        >
                          <div className="px-4 py-3 bg-forest-50 border-b border-cream-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BackpackIcon className="w-4 h-4 text-forest-600" />
                              <h4 className="font-medium text-forest-800">
                                {backpack.name}
                              </h4>
                              <span className="text-xs text-earth-500">
                                {formatWeight(bpWeight)}
                              </span>
                            </div>
                            <span className="text-sm text-earth-500">
                              {bpChecked}/{bpItems.length}
                            </span>
                          </div>
                          
                          {bpItems.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-earth-400">
                              背包是空的
                            </p>
                          ) : (
                            <div className="divide-y divide-cream-100">
                              {bpItems.map(({ item, quantity }) => (
                                <CheckItemRow
                                  key={item.id}
                                  itemId={item.id}
                                  name={item.name}
                                  quantity={quantity}
                                  weight={item.weight * quantity}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {memberUnassigned.length > 0 && (
                      <div className="border border-cream-200 rounded-xl overflow-hidden ml-5">
                        <div className="px-4 py-3 bg-earth-50 border-b border-cream-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-earth-500" />
                            <h4 className="font-medium text-earth-700">
                              未分配背包
                            </h4>
                          </div>
                          <span className="text-sm text-earth-500">
                            {memberUnassigned.filter(
                              ({ item }) => plan.checkProgress[item.id]
                            ).length}/{memberUnassigned.length}
                          </span>
                        </div>
                        <div className="divide-y divide-cream-100">
                          {memberUnassigned.map(({ item, quantity }) => (
                            <CheckItemRow
                              key={item.id}
                              itemId={item.id}
                              name={item.name}
                              quantity={quantity}
                              weight={item.weight * quantity}
                              subInfo="未分配背包"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {sharedItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    <h3 className="font-medium text-forest-800">共享装备</h3>
                    <span className="text-xs text-earth-500">
                      ({sharedItems.length} 件)
                    </span>
                  </div>
                  <div className="border border-cream-200 rounded-xl overflow-hidden ml-5">
                    <div className="divide-y divide-cream-100">
                      {sharedItems.map(item => (
                        <CheckItemRow
                          key={item.id}
                          itemId={item.id}
                          name={item.name}
                          quantity={item.quantity}
                          weight={item.weight * item.quantity}
                          subInfo="共享装备"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
