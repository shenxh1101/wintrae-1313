import { useState } from 'react';
import {
  X,
  Package,
  Droplets,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Backpack as BackpackIcon,
  ClipboardList,
} from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { formatWeight, getBackpackItems, getUnassignedItems } from '@/utils/weightCalc';
import { calculateConsumableEstimates } from '@/utils/consumableEstimate';
import { findDuplicateItems } from '@/utils/smartTips';
import { CATEGORY_LABELS, GearCategory } from '@/types';

interface DepartureChecklistProps {
  onClose: () => void;
}

const DepartureChecklist = ({ onClose }: DepartureChecklistProps) => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const [activeTab, setActiveTab] = useState<string | null>(null);

  if (!plan) return null;

  const unassignedItems = getUnassignedItems(plan.gearList);
  const unassignedCount = unassignedItems.reduce((s, { quantity }) => s + quantity, 0);

  const consumableEstimates = calculateConsumableEstimates(
    plan.gearList,
    plan.crew,
    plan.destination.days
  );
  const shortageItems = consumableEstimates.filter(item => item.diff < 0);
  const shortageCount = shortageItems.length;

  const overweightBackpacks = plan.backpacks.filter(bp => {
    const bpItems = getBackpackItems(bp.id, plan.gearList);
    const weight = bpItems.reduce((sum, { item, quantity }) => sum + item.weight * quantity, 0);
    return weight > bp.maxWeight;
  });

  const duplicates = findDuplicateItems(plan.gearList, plan.backpacks);
  const duplicateWarnings = duplicates.filter(d => d.shouldWarn);

  const essentialCategories: GearCategory[] = ['tent', 'cooking', 'clothing', 'firstaid', 'food'];
  const missingCategories = essentialCategories.filter(cat => 
    !plan.gearList.some(item => item.category === cat && item.quantity > 0)
  );

  const validBackpackIds = new Set(plan.backpacks.map(b => b.id));
  
  const totalCheckUnits = (() => {
    let count = 0;
    plan.gearList.forEach(item => {
      if (item.isShared) {
        count += 1;
        return;
      }
      const allocs = item.allocations || [];
      if (allocs.length > 0) {
        count += allocs.length;
        const totalAlloc = allocs.reduce((s, a) => s + a.quantity, 0);
        if (totalAlloc < item.quantity) {
          count += 1;
        }
      } else {
        count += 1;
      }
    });
    return count;
  })();

  const checkedUnits = (() => {
    let count = 0;
    plan.gearList.forEach(item => {
      if (item.isShared) {
        if (plan.checkProgress[item.id]) count += 1;
        return;
      }
      const allocs = item.allocations || [];
      if (allocs.length > 0) {
        allocs.forEach(alloc => {
          const key = `${item.id}:${alloc.backpackId}`;
          if (plan.checkProgress[key]) count += 1;
        });
        const totalAlloc = allocs.reduce((s, a) => s + a.quantity, 0);
        if (totalAlloc < item.quantity) {
          const key = `${item.id}:unassigned`;
          if (plan.checkProgress[key]) count += 1;
        }
      } else {
        if (plan.checkProgress[item.id]) count += 1;
      }
    });
    return count;
  })();

  const uncheckedCount = totalCheckUnits - checkedUnits;

  const sharedItems = plan.gearList.filter(item => item.isShared);

  const handleJump = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onClose();
  };

  const categories = [
    {
      id: 'unassigned',
      icon: Package,
      label: '未分配装备',
      count: unassignedCount,
      unit: '件',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      jumpTo: 'backpack-allocation',
      description: '还没有放进背包的装备',
    },
    {
      id: 'shortage',
      icon: Droplets,
      label: '消耗品缺口',
      count: shortageCount,
      unit: '种',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      jumpTo: 'consumable-estimate',
      description: '建议数量不足的消耗品',
    },
    {
      id: 'overweight',
      icon: AlertTriangle,
      label: '超重背包',
      count: overweightBackpacks.length,
      unit: '个',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      jumpTo: 'backpack-allocation',
      description: '超过承重上限的背包',
    },
    {
      id: 'unchecked',
      icon: ClipboardList,
      label: '未检查项',
      count: uncheckedCount,
      unit: '项',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      action: 'check',
      description: '出发前还没确认的装备',
    },
  ];

  const totalIssues = unassignedCount + shortageCount + overweightBackpacks.length + uncheckedCount;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-hover w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-cream-200 bg-gradient-to-r from-camp-orange to-amber-500 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              出发前核对
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-white/80">
            出发前先过一遍，确保万无一失
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {totalIssues === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-forest-800 mb-2">
                全部准备就绪！
              </h3>
              <p className="text-sm text-earth-500">
                所有事项都已处理完毕，放心出发吧
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-medium transition-colors"
              >
                开始出发！
              </button>
            </div>
          ) : (
            <>
              {categories.map(cat => {
                const Icon = cat.icon;
                const isExpanded = activeTab === cat.id;
                const hasItems = cat.count > 0;

                return (
                  <div
                    key={cat.id}
                    className={`rounded-xl border-2 transition-all ${
                      hasItems
                        ? `${cat.borderColor} ${cat.bgColor}`
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <button
                      onClick={() => setActiveTab(isExpanded ? null : cat.id)}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${cat.bgColor}`}>
                          <Icon className={`w-5 h-5 ${hasItems ? cat.color : 'text-green-600'}`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${
                            hasItems ? 'text-forest-800' : 'text-green-700'
                          }`}>
                            {cat.label}
                          </h3>
                          <p className="text-xs text-earth-500">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          hasItems ? cat.color : 'text-green-600'
                        }`}>
                          {hasItems ? `${cat.count} ${cat.unit}` : '✓ 完成'}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-earth-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/50">
                        {cat.id === 'unassigned' && (
                          <div className="space-y-2 pt-3">
                            {unassignedItems.slice(0, 5).map(({ item, quantity }) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between px-3 py-2 bg-white/60 rounded-lg text-sm"
                              >
                                <span className="text-forest-700 truncate flex-1">
                                  {item.name}
                                </span>
                                <span className="text-xs text-earth-500">
                                  {quantity} 件
                                </span>
                              </div>
                            ))}
                            {unassignedItems.length > 5 && (
                              <p className="text-xs text-earth-400 text-center">
                                还有 {unassignedItems.length - 5} 件...
                              </p>
                            )}
                            <button
                              onClick={() => handleJump(cat.jumpTo!)}
                              className="w-full mt-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors"
                            >
                              去分配背包 →
                            </button>
                          </div>
                        )}

                        {cat.id === 'shortage' && (
                          <div className="space-y-2 pt-3">
                            {shortageItems.slice(0, 5).map(item => (
                              <div
                                key={item.itemId}
                                className="flex items-center justify-between px-3 py-2 bg-white/60 rounded-lg text-sm"
                              >
                                <span className="text-forest-700 truncate flex-1">
                                  {item.itemName}
                                </span>
                                <span className="text-xs text-red-500">
                                  缺 {-item.diff}
                                </span>
                              </div>
                            ))}
                            {shortageItems.length > 5 && (
                              <p className="text-xs text-earth-400 text-center">
                                还有 {shortageItems.length - 5} 种...
                              </p>
                            )}
                            <button
                              onClick={() => handleJump(cat.jumpTo!)}
                              className="w-full mt-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                            >
                              去补充消耗品 →
                            </button>
                          </div>
                        )}

                        {cat.id === 'overweight' && (
                          <div className="space-y-2 pt-3">
                            {overweightBackpacks.map(bp => {
                              const bpItems = getBackpackItems(bp.id, plan.gearList);
                              const weight = bpItems.reduce(
                                (sum, { item, quantity }) => sum + item.weight * quantity, 0
                              );
                              const owner = plan.crew.find(c => c.id === bp.ownerId);
                              return (
                                <div
                                  key={bp.id}
                                  className="flex items-center justify-between px-3 py-2 bg-white/60 rounded-lg text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <BackpackIcon className="w-4 h-4 text-red-500" />
                                    <span className="text-forest-700">
                                      {owner?.name} - {bp.name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-red-500">
                                    超重 {formatWeight(weight - bp.maxWeight)}
                                  </span>
                                </div>
                              );
                            })}
                            <button
                              onClick={() => handleJump(cat.jumpTo!)}
                              className="w-full mt-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                            >
                              去调整背包 →
                            </button>
                          </div>
                        )}

                        {cat.id === 'unchecked' && (
                          <div className="pt-3">
                            <div className="flex items-center justify-between mb-3 px-1">
                              <p className="text-sm text-earth-600">
                                已确认 {checkedUnits}/{totalCheckUnits} 项
                              </p>
                              <div className="flex-1 mx-3 h-2 bg-earth-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                  style={{ width: `${totalCheckUnits > 0 ? (checkedUnits / totalCheckUnits) * 100 : 0}%` }}
                                />
                              </div>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
                              {plan.crew.map(member => {
                                const memberBackpacks = plan.backpacks.filter(b => b.ownerId === member.id);
                                let memberTotal = 0;
                                let memberChecked = 0;

                                const backpackStats = memberBackpacks.map(bp => {
                                  const bpItems = getBackpackItems(bp.id, plan.gearList);
                                  const bpTotal = bpItems.length;
                                  const bpChecked = bpItems.filter(
                                    ({ item }) => plan.checkProgress[`${item.id}:${bp.id}`]
                                  ).length;
                                  memberTotal += bpTotal;
                                  memberChecked += bpChecked;
                                  return { bp, bpTotal, bpChecked };
                                });

                                const memberUnassignedItems = getUnassignedItems(plan.gearList).filter(
                                  ({ item }) => !item.isShared && item.carrierId === member.id
                                );
                                const unassignedTotal = memberUnassignedItems.length;
                                const unassignedChecked = memberUnassignedItems.filter(
                                  ({ item }) => plan.checkProgress[`${item.id}:unassigned`]
                                ).length;
                                memberTotal += unassignedTotal;
                                memberChecked += unassignedChecked;

                                if (memberTotal === 0) return null;

                                return (
                                  <div key={member.id} className="space-y-1.5">
                                    <div className="flex items-center gap-2 px-2 py-1">
                                      <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: member.avatarColor }}
                                      />
                                      <span className="text-sm font-medium text-forest-800">
                                        {member.name}
                                      </span>
                                      <span className={`text-xs ml-auto ${
                                        memberChecked === memberTotal
                                          ? 'text-green-600'
                                          : 'text-earth-500'
                                      }`}>
                                        {memberChecked}/{memberTotal}
                                        {memberChecked === memberTotal && memberTotal > 0 && ' ✓'}
                                      </span>
                                    </div>
                                    
                                    {backpackStats.map(({ bp, bpTotal, bpChecked }) => (
                                      <div
                                        key={bp.id}
                                        className={`flex items-center gap-2 px-3 py-1.5 ml-4 rounded text-sm ${
                                          bpChecked === bpTotal && bpTotal > 0
                                            ? 'bg-green-50'
                                            : 'bg-white/60'
                                        }`}
                                      >
                                        <BackpackIcon className={`w-3.5 h-3.5 ${
                                          bpChecked === bpTotal && bpTotal > 0
                                            ? 'text-green-500'
                                            : 'text-earth-400'
                                        }`} />
                                        <span className="text-forest-700 flex-1">
                                          {bp.name}
                                        </span>
                                        <span className={`text-xs ${
                                          bpChecked === bpTotal
                                            ? 'text-green-600'
                                            : 'text-earth-500'
                                        }`}>
                                          {bpChecked}/{bpTotal}
                                        </span>
                                      </div>
                                    ))}

                                    {unassignedTotal > 0 && (
                                      <div
                                        className={`flex items-center gap-2 px-3 py-1.5 ml-4 rounded text-sm ${
                                          unassignedChecked === unassignedTotal
                                            ? 'bg-green-50'
                                            : 'bg-white/60'
                                        }`}
                                      >
                                        <Package className={`w-3.5 h-3.5 ${
                                          unassignedChecked === unassignedTotal
                                            ? 'text-green-500'
                                            : 'text-earth-400'
                                        }`} />
                                        <span className="text-earth-700 flex-1">
                                          未分配背包
                                        </span>
                                        <span className={`text-xs ${
                                          unassignedChecked === unassignedTotal
                                            ? 'text-green-600'
                                            : 'text-earth-500'
                                        }`}>
                                          {unassignedChecked}/{unassignedTotal}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {sharedItems.length > 0 && (() => {
                                const sharedTotal = sharedItems.length;
                                const sharedChecked = sharedItems.filter(
                                  item => plan.checkProgress[item.id]
                                ).length;
                                return (
                                  <div className="space-y-1.5 pt-1">
                                    <div
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                                        sharedChecked === sharedTotal
                                          ? 'bg-green-50'
                                          : 'bg-white/60'
                                      }`}
                                    >
                                      <span>👥</span>
                                      <span className="text-forest-700 flex-1">
                                        共享装备
                                      </span>
                                      <span className={`text-xs ${
                                        sharedChecked === sharedTotal
                                          ? 'text-green-600'
                                          : 'text-earth-500'
                                      }`}>
                                        {sharedChecked}/{sharedTotal}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>

                            <button
                              onClick={() => {
                                const startCheckBtn = document.querySelector('[data-check-mode]') as HTMLButtonElement;
                                if (startCheckBtn) startCheckBtn.click();
                                onClose();
                              }}
                              className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              开始检查模式 →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {duplicateWarnings.length > 0 && (
                <div className="rounded-xl border-2 border-orange-200 bg-orange-50 mt-4">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-forest-800">
                          重复携带提醒
                        </h3>
                        <p className="text-xs text-earth-500">
                          {duplicateWarnings.length} 个重复项需要处理
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {missingCategories.length > 0 && (
                <div className="rounded-xl border-2 border-forest-200 bg-forest-50">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-forest-100">
                        <Package className="w-5 h-5 text-forest-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-forest-800">
                          遗漏类别提醒
                        </h3>
                        <p className="text-xs text-earth-500">
                          {missingCategories.length} 个类别可能缺装备
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-cream-200 bg-cream-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-forest-500 hover:bg-forest-600 text-white rounded-xl font-medium transition-colors"
          >
            {totalIssues === 0 ? '准备出发！' : '我知道了'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartureChecklist;
