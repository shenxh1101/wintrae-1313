import { useState } from 'react';
import { Minus, Plus, Trash2, Users, User, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { GearCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { formatWeight } from '@/utils/weightCalc';

const GearList = () => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const updateGearQuantity = useGearStore(state => state.updateGearQuantity);
  const removeGearItem = useGearStore(state => state.removeGearItem);
  const setGearCarrier = useGearStore(state => state.setGearCarrier);
  const toggleGearShared = useGearStore(state => state.toggleGearShared);
  const checkMode = useGearStore(state => state.checkMode);
  const setCheckItem = useGearStore(state => state.setCheckItem);
  const [expandedCategories, setExpandedCategories] = useState<Set<GearCategory>>(
    new Set(['tent', 'cooking', 'lighting', 'firstaid', 'clothing', 'food', 'other'])
  );

  if (!plan) return null;

  const toggleCategory = (cat: GearCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(cat)) {
      newExpanded.delete(cat);
    } else {
      newExpanded.add(cat);
    }
    setExpandedCategories(newExpanded);
  };

  // 按类别分组
  const categories = Object.keys(CATEGORY_LABELS) as GearCategory[];
  
  const itemsByCategory = categories.map(cat => ({
    category: cat,
    items: plan.gearList.filter(item => item.category === cat),
  })).filter(group => group.items.length > 0);

  const totalItems = plan.gearList.reduce((sum, item) => sum + item.quantity, 0);

  if (plan.gearList.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-8">
        <h2 className="text-lg font-bold text-forest-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          装备清单
        </h2>
        <div className="text-center py-12 text-earth-400">
          <div className="text-5xl mb-3">🎒</div>
          <p>还没有添加装备</p>
          <p className="text-sm mt-1">从左侧装备库中选择需要的装备吧</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-200 flex flex-col h-full">
      <div className="p-4 border-b border-cream-200 flex-shrink-0">
        <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          装备清单
          <span className="text-sm font-normal text-earth-500">({plan.gearList.length}类 / {totalItems}件)</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {itemsByCategory.map(({ category, items }) => {
          const categoryWeight = items.reduce((sum, i) => sum + i.weight * i.quantity, 0);
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="border border-cream-200 rounded-xl overflow-hidden">
              {/* 类别标题 */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-3 p-3 bg-cream-50 hover:bg-cream-100 transition-colors"
              >
                <div
                  className="w-2 h-6 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span className="font-medium text-forest-800 flex-1 text-left">
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="text-sm text-earth-500">
                  {items.length}类 / {items.reduce((s, i) => s + i.quantity, 0)}件
                </span>
                <span className="text-sm font-medium text-earth-600">
                  {formatWeight(categoryWeight)}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-earth-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-earth-400" />
                )}
              </button>

              {/* 装备列表 */}
              {isExpanded && (
                <div className="divide-y divide-cream-100">
                  {items.map(item => {
                    const isChecked = plan.checkProgress[item.id];
                    
                    return (
                      <div
                        key={item.id}
                        className={`p-3 flex items-center gap-3 transition-colors ${
                          checkMode && isChecked ? 'bg-green-50' : 'hover:bg-cream-50/50'
                        }`}
                      >
                        {checkMode && (
                          <button
                            onClick={() => setCheckItem(item.id, !isChecked)}
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isChecked
                                ? 'bg-forest-500 border-forest-500 text-white'
                                : 'border-earth-300 hover:border-forest-400'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4" />}
                          </button>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-forest-800 text-sm truncate">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => toggleGearShared(item.id)}
                              className={`flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded transition-colors ${
                                item.isShared
                                  ? 'bg-forest-100 text-forest-700 hover:bg-forest-200'
                                  : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
                              }`}
                              title={item.isShared ? '改为个人携带' : '改为共享装备'}
                            >
                              {item.isShared ? (
                                <><Users className="w-3 h-3" /> 共享</>
                              ) : (
                                <><User className="w-3 h-3" /> 个人</>
                              )}
                            </button>
                          </div>
                          <div className="text-xs text-earth-500 mt-0.5">
                            {formatWeight(item.weight)} × {item.quantity} = {formatWeight(item.weight * item.quantity)}
                          </div>
                        </div>

                        {/* 数量调整 */}
                        {!checkMode && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-cream-100 rounded-lg">
                              <button
                                onClick={() => updateGearQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-earth-600 hover:bg-cream-200 rounded-l-lg transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-medium text-forest-800 text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateGearQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-earth-600 hover:bg-cream-200 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* 携带者选择 */}
                            {!item.isShared && (
                              <select
                                value={item.carrierId || ''}
                                onChange={(e) => setGearCarrier(item.id, e.target.value || undefined)}
                                className="text-xs px-2 py-1.5 bg-cream-50 border border-cream-300 rounded-lg text-earth-600 focus:outline-none focus:ring-2 focus:ring-forest-400"
                              >
                                <option value="">未分配</option>
                                {plan.crew.map(member => (
                                  <option key={member.id} value={member.id}>
                                    {member.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            <button
                              onClick={() => removeGearItem(item.id)}
                              className="p-1.5 text-earth-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GearList;
