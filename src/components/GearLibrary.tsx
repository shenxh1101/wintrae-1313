import { useState } from 'react';
import { Search, Plus, Users, User } from 'lucide-react';
import { useGearStore, gearLibrary } from '@/store/useGearStore';
import { GearCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { formatWeight } from '@/utils/weightCalc';

const categories: { key: GearCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'tent', label: '帐篷' },
  { key: 'cooking', label: '炊具' },
  { key: 'lighting', label: '照明' },
  { key: 'firstaid', label: '急救' },
  { key: 'clothing', label: '衣物' },
  { key: 'food', label: '食品' },
  { key: 'other', label: '其他' },
];

const GearLibrary = () => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const addGearItem = useGearStore(state => state.addGearItem);
  const activeCategory = useGearStore(state => state.activeCategory);
  const setActiveCategory = useGearStore(state => state.setActiveCategory);
  const [searchTerm, setSearchTerm] = useState('');

  if (!plan) return null;

  const listItemIds = new Set(plan.gearList.map(i => i.id));

  const filteredGear = gearLibrary.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-200 flex flex-col h-full">
      <div className="p-4 border-b border-cream-200">
        <h2 className="text-lg font-bold text-forest-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">🎒</span>
          装备库
          <span className="text-sm font-normal text-earth-500">({gearLibrary.length}件)</span>
        </h2>

        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
          <input
            type="text"
            placeholder="搜索装备..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
          />
        </div>

        {/* 分类标签 */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-forest-500 text-white'
                  : 'bg-cream-100 text-earth-600 hover:bg-cream-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 装备列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredGear.length === 0 ? (
          <div className="text-center py-8 text-earth-400">
            没有找到相关装备
          </div>
        ) : (
          filteredGear.map(item => {
            const isInList = listItemIds.has(item.id);
            const listItem = plan.gearList.find(i => i.id === item.id);
            
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  isInList
                    ? 'bg-forest-50 border-forest-300'
                    : 'bg-cream-50 border-cream-200 hover:border-forest-300 hover:bg-forest-50/50'
                }`}
                onClick={() => !isInList && addGearItem(item, 1)}
              >
                <div className="flex items-start gap-3">
                  {/* 类别指示条 */}
                  <div
                    className="w-1.5 h-10 rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-forest-800 text-sm truncate">
                        {item.name}
                      </h3>
                      {item.isShared && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-forest-100 text-forest-700 text-xs rounded-md flex-shrink-0">
                          <Users className="w-3 h-3" />
                          共享
                        </span>
                      )}
                      {item.isConsumable && (
                        <span className="px-1.5 py-0.5 bg-camp-orange/10 text-camp-orange text-xs rounded-md flex-shrink-0">
                          消耗品
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-earth-500 mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-earth-500">
                        {formatWeight(item.weight)}
                      </span>
                      {item.recommendedPerDay && (
                        <span className="text-xs text-earth-400">
                          推荐: {item.recommendedPerDay}/天
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 添加按钮 */}
                  {isInList ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-forest-500 text-white text-xs font-medium rounded-lg">
                      ✓ 已添加
                      {listItem && listItem.quantity > 1 && (
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                          ×{listItem.quantity}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addGearItem(item, 1);
                      }}
                      className="p-1.5 bg-forest-500 hover:bg-forest-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GearLibrary;
