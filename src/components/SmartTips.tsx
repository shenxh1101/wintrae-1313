import { AlertTriangle, Info, CheckCircle, XCircle, X, EyeOff } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { generateSmartTips } from '@/utils/smartTips';
import { calculateWeight } from '@/utils/weightCalc';
import { SmartTip } from '@/types';

const tipIcons = {
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
};

const tipStyles = {
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const tipIconColors = {
  warning: 'text-amber-500',
  info: 'text-blue-500',
  success: 'text-green-500',
  error: 'text-red-500',
};

const SmartTips = () => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const ignoreTip = useGearStore(state => state.ignoreTip);
  const unignoreTip = useGearStore(state => state.unignoreTip);

  if (!plan) return null;

  const { total, perPerson } = calculateWeight(plan.gearList, plan.crew, plan.backpacks);

  const allTips = generateSmartTips({
    gearList: plan.gearList,
    crew: plan.crew,
    backpacks: plan.backpacks,
    season: plan.destination.season,
    days: plan.destination.days,
    weather: plan.destination.weather,
    campType: plan.destination.campType,
    totalWeight: total,
    perPersonWeight: perPerson,
  });

  const tips = allTips.filter(tip => !plan.ignoredTips.includes(tip.id));
  const ignoredCount = allTips.length - tips.length;

  const handleIgnore = (tipId: string) => {
    ignoreTip(tipId);
  };

  const handleShowIgnored = () => {
    const ignoredTipIds = allTips
      .filter(t => plan.ignoredTips.includes(t.id))
      .map(t => t.id);
    ignoredTipIds.forEach(id => unignoreTip(id));
  };

  if (tips.length === 0 && ignoredCount === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-800">装备清单看起来不错！</h3>
            <p className="text-sm text-green-600">没有发现需要特别注意的问题，继续完善吧~</p>
          </div>
        </div>
      </div>
    );
  }

  const warningCount = tips.filter(t => t.type === 'warning' || t.type === 'error').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-earth-700 flex items-center gap-2">
          <span className="text-xl">💡</span>
          智能提示
          {warningCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              {warningCount} 项注意
            </span>
          )}
        </h3>
        {ignoredCount > 0 && (
          <button
            onClick={handleShowIgnored}
            className="flex items-center gap-1 text-xs text-earth-500 hover:text-earth-700 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
            显示已忽略 ({ignoredCount})
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tips.map(tip => (
          <div
            key={tip.id}
            className={`p-3 rounded-xl border ${tipStyles[tip.type]} animate-slide-in relative group`}
          >
            {tip.dismissible !== false && (
              <button
                onClick={() => handleIgnore(tip.id)}
                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
                title="忽略此提示"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 mt-0.5 ${tipIconColors[tip.type]}`}>
                {tipIcons[tip.type]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{tip.title}</h4>
                <p className="text-xs mt-1 opacity-80">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartTips;
