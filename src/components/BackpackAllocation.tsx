import { Backpack } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { calculateWeight, formatWeight } from '@/utils/weightCalc';

const BackpackAllocation = () => {
  const plan = useGearStore(state => state.getCurrentPlan());

  if (!plan) return null;

  const { byPerson } = calculateWeight(plan.gearList, plan.crew);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
      <h2 className="text-lg font-bold text-forest-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🎒</span>
        背包分配
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {plan.crew.map(member => {
          const personalWeight = byPerson[member.id] || 0;
          const percentage = Math.min((personalWeight / member.maxWeight) * 100, 100);
          const isOverweight = personalWeight > member.maxWeight;

          return (
            <div
              key={member.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                isOverweight
                  ? 'border-red-300 bg-red-50'
                  : 'border-cream-200 bg-cream-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: member.avatarColor }}
                >
                  <Backpack className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-forest-800">{member.name}的背包</h3>
                  <p className="text-xs text-earth-500">
                    承重上限: {formatWeight(member.maxWeight)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-earth-600">当前重量</span>
                  <span className={`font-medium ${
                    isOverweight ? 'text-red-600' : 'text-forest-700'
                  }`}>
                    {formatWeight(personalWeight)}
                  </span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden border border-cream-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverweight ? 'bg-red-500' : 'bg-forest-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {isOverweight && (
                  <p className="text-xs text-red-500">
                    ⚠️ 超重 {formatWeight(personalWeight - member.maxWeight)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-earth-400 mt-4">
        💡 提示：共享装备会按人数平均分摊计算个人负重
      </p>
    </div>
  );
};

export default BackpackAllocation;
