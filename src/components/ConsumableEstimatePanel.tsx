import { useState } from 'react';
import { Droplets, UtensilsCrossed, Flame, Shirt, MoreHorizontal, Plus, Minus, TrendingUp, TrendingDown, Check, ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { calculateConsumableEstimates, getConsumableByType, formatEstimateSummary, getGearItemById } from '@/utils/consumableEstimate';
import { formatWeight } from '@/utils/weightCalc';
import { ConsumableType, CONSUMABLE_TYPE_LABELS } from '@/types';

const typeIcons = {
  water: <Droplets className="w-5 h-5" />,
  food: <UtensilsCrossed className="w-5 h-5" />,
  fuel: <Flame className="w-5 h-5" />,
  clothing: <Shirt className="w-5 h-5" />,
  other: <MoreHorizontal className="w-5 h-5" />,
};

const typeColors = {
  water: 'bg-blue-100 text-blue-700 border-blue-200',
  food: 'bg-purple-100 text-purple-700 border-purple-200',
  fuel: 'bg-orange-100 text-orange-700 border-orange-200',
  clothing: 'bg-green-100 text-green-700 border-green-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ConsumableEstimatePanel = () => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const updateGearQuantity = useGearStore(state => state.updateGearQuantity);
  const addGearItem = useGearStore(state => state.addGearItem);
  const [activeType, setActiveType] = useState<ConsumableType | 'all'>('all');
  const [showNotInList, setShowNotInList] = useState(true);

  if (!plan) return null;

  const estimates = calculateConsumableEstimates(
    plan.gearList,
    plan.crew,
    plan.destination.days
  );

  const byType = getConsumableByType(estimates);
  const summary = formatEstimateSummary(estimates);

  const filteredByType = activeType === 'all'
    ? estimates
    : byType[activeType];

  const filteredEstimates = showNotInList
    ? filteredByType
    : filteredByType.filter(e => e.inList);

  const consumableTypes: ConsumableType[] = ['water', 'food', 'fuel', 'clothing', 'other'];
  const availableTypes = consumableTypes.filter(t => byType[t].length > 0);

  const handleAddToPlan = (itemId: string, qty: number) => {
    const gearItem = getGearItemById(itemId);
    if (gearItem) {
      addGearItem(gearItem, qty);
    }
  };

  const handleQuickAdd = (itemId: string, currentQty: number, recommendedQty: number, inList: boolean) => {
    if (inList) {
      if (recommendedQty > currentQty) {
        updateGearQuantity(itemId, recommendedQty);
      }
    } else {
      handleAddToPlan(itemId, recommendedQty);
    }
  };

  const deficitItems = estimates.filter(e => e.diff < 0);
  const hasDeficit = deficitItems.length > 0;

  const handleQuickAddAll = () => {
    deficitItems.forEach(item => {
      const qtyToAdd = item.recommendedQty;
      if (item.inList) {
        updateGearQuantity(item.itemId, item.recommendedQty);
      } else {
        const gearItem = getGearItemById(item.itemId);
        if (gearItem) {
          addGearItem(gearItem, qtyToAdd);
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          易耗品估算
          <span className="text-sm font-normal text-earth-500">({plan.destination.days}天 × {plan.crew.length}人)</span>
        </h2>
        <button
          onClick={() => setShowNotInList(!showNotInList)}
          className="flex items-center gap-1 text-xs text-earth-500 hover:text-earth-700 transition-colors"
        >
          {showNotInList ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showNotInList ? '隐藏未添加' : '显示未添加'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
          <div className="text-xs text-earth-500 mb-1">物品种类</div>
          <div className="text-xl font-bold text-forest-800">{estimates.length}</div>
        </div>
        <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
          <div className="text-xs text-earth-500 mb-1">已添加</div>
          <div className="text-xl font-bold text-forest-800">
            {estimates.filter(e => e.inList).length}
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-xs text-blue-600 mb-1">建议总数</div>
          <div className="text-xl font-bold text-blue-700">{summary.totalRecommended}</div>
        </div>
        <div className={`p-3 rounded-xl border ${
          summary.totalDiff >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`text-xs mb-1 ${summary.totalDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            差额
          </div>
          <div className={`text-xl font-bold flex items-center gap-1 ${
            summary.totalDiff >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {summary.totalDiff >= 0 ? (
              <><TrendingUp className="w-4 h-4" /> +{summary.totalDiff}</>
            ) : (
              <><TrendingDown className="w-4 h-4" /> {summary.totalDiff}</>
            )}
          </div>
        </div>
      </div>

      {hasDeficit && (
        <button
          onClick={handleQuickAddAll}
          className="w-full mb-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          一键补齐所有缺口 ({deficitItems.length}种)
        </button>
      )}

      {availableTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeType === 'all'
                ? 'bg-forest-500 text-white'
                : 'bg-cream-100 text-earth-600 hover:bg-cream-200'
            }`}
          >
            全部
          </button>
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                activeType === type
                  ? 'bg-forest-500 text-white'
                  : 'bg-cream-100 text-earth-600 hover:bg-cream-200'
              }`}
            >
              {typeIcons[type]}
              {CONSUMABLE_TYPE_LABELS[type]}
              <span className="text-xs opacity-70">({byType[type].length})</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filteredEstimates.map(estimate => {
          const isDeficit = estimate.diff < 0;
          const isSurplus = estimate.diff > 0;
          const consumableType = estimate.consumableType || 'other';

          return (
            <div
              key={estimate.itemId}
              className={`p-3 rounded-xl border transition-all ${
                !estimate.inList
                  ? 'bg-earth-50 border-earth-200 opacity-75'
                  : isDeficit
                    ? 'bg-red-50 border-red-200'
                    : isSurplus
                      ? 'bg-green-50 border-green-200'
                      : 'bg-cream-50 border-cream-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${typeColors[consumableType]}`}>
                    {typeIcons[consumableType]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-forest-800 text-sm">
                        {estimate.itemName}
                      </h4>
                      {estimate.isShared && (
                        <span className="text-xs px-1.5 py-0.5 bg-forest-100 text-forest-700 rounded">
                          共享
                        </span>
                      )}
                      {!estimate.inList && (
                        <span className="text-xs px-1.5 py-0.5 bg-earth-200 text-earth-600 rounded">
                          未添加
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-earth-500 mt-0.5">
                      {estimate.perPersonPerDay && (
                        <span>每人每天 {estimate.perPersonPerDay} 份</span>
                      )}
                      {estimate.perDay && !estimate.perPersonPerDay && (
                        <span>每天 {estimate.perDay} 份</span>
                      )}
                      <span className="mx-1">·</span>
                      <span>单份 {formatWeight(estimate.unitWeight)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {estimate.inList ? (
                    <>
                      <div className="flex items-center gap-1 mb-1">
                        <button
                          onClick={() => updateGearQuantity(estimate.itemId, estimate.currentQty - 1)}
                          className="w-6 h-6 flex items-center justify-center text-earth-500 hover:bg-earth-200 rounded transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 text-center font-medium text-forest-800">
                          {estimate.currentQty}
                        </span>
                        <button
                          onClick={() => updateGearQuantity(estimate.itemId, estimate.currentQty + 1)}
                          className="w-6 h-6 flex items-center justify-center text-earth-500 hover:bg-earth-200 rounded transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className={`text-xs font-medium ${
                        isDeficit ? 'text-red-600' : isSurplus ? 'text-green-600' : 'text-earth-500'
                      }`}>
                        建议 {estimate.recommendedQty} 份
                        {isDeficit && ` (缺${Math.abs(estimate.diff)})`}
                        {isSurplus && ` (多${estimate.diff})`}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-earth-400 text-sm">0</span>
                        <span className="text-earth-400 text-xs">/</span>
                        <span className="text-blue-600 font-medium text-sm">{estimate.recommendedQty}</span>
                      </div>
                      <div className="text-xs text-earth-500">
                        建议 {estimate.recommendedQty} 份
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isDeficit && (
                <button
                  onClick={() => handleQuickAdd(estimate.itemId, estimate.currentQty, estimate.recommendedQty, estimate.inList)}
                  className={`mt-2 w-full py-1.5 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    estimate.inList
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {estimate.inList ? '补充到建议数量' : '添加到清单'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {summary.deficitCount > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            有 {summary.deficitCount} 种消耗品数量不足，建议及时补充
            {summary.notInListCount > 0 && `（含 ${summary.notInListCount} 种未添加）`}
          </p>
        </div>
      )}

      {summary.deficitCount === 0 && estimates.some(e => e.inList) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <Check className="w-4 h-4" />
            已添加的消耗品数量充足，准备充分！
          </p>
        </div>
      )}

      <p className="text-xs text-earth-400 mt-4">
        💡 提示：建议数量根据行程天数和人数自动计算，仅供参考
      </p>
    </div>
  );
};

export default ConsumableEstimatePanel;
