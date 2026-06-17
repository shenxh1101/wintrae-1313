import { useGearStore } from '@/store/useGearStore';
import { calculateWeight, formatWeight } from '@/utils/weightCalc';
import { CATEGORY_LABELS, CATEGORY_COLORS, GearCategory } from '@/types';

const WeightOverview = () => {
  const plan = useGearStore(state => state.getCurrentPlan());

  if (!plan) return null;

  const { total, perPerson, byCategory, byPerson } = calculateWeight(plan.gearList, plan.crew);

  // 分类重量排序
  const sortedCategories = Object.entries(byCategory)
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1]) as [GearCategory, number][];

  const maxCategoryWeight = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
      <h2 className="text-lg font-bold text-forest-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">⚖️</span>
        重量概览
      </h2>

      {/* 总重量卡片 */}
      <div className="bg-gradient-to-br from-forest-500 to-forest-700 rounded-2xl p-5 text-white mb-4">
        <div className="text-sm opacity-80 mb-1">总重量</div>
        <div className="text-4xl font-bold mb-2">
          {(total / 1000).toFixed(1)}
          <span className="text-lg font-normal ml-1 opacity-80">kg</span>
        </div>
        <div className="text-sm opacity-80">
          人均约 {(perPerson / 1000).toFixed(1)} kg
        </div>
      </div>

      {/* 分类重量图表 */}
      {sortedCategories.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-earth-700 mb-3">分类重量</h3>
          <div className="space-y-2">
            {sortedCategories.map(([category, weight]) => (
              <div key={category} className="flex items-center gap-3">
                <div className="w-20 text-xs text-earth-600 truncate">
                  {CATEGORY_LABELS[category]}
                </div>
                <div className="flex-1 h-5 bg-cream-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(weight / maxCategoryWeight) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[category],
                    }}
                  />
                </div>
                <div className="w-16 text-right text-xs font-medium text-earth-700">
                  {formatWeight(weight)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 个人负重 */}
      <div>
        <h3 className="text-sm font-medium text-earth-700 mb-3">个人负重</h3>
        <div className="space-y-3">
          {plan.crew.map(member => {
            const personalWeight = byPerson[member.id] || 0;
            const percentage = Math.min((personalWeight / member.maxWeight) * 100, 100);
            const isOverweight = personalWeight > member.maxWeight;

            return (
              <div key={member.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-sm text-forest-800">{member.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    isOverweight ? 'text-red-500' : 'text-earth-700'
                  }`}>
                    {formatWeight(personalWeight)} / {formatWeight(member.maxWeight)}
                  </span>
                </div>
                <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverweight ? 'bg-red-500' : 'bg-forest-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeightOverview;
