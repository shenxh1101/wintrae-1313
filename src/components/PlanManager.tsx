import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, FolderOpen } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';

const PlanManager = () => {
  const plans = useGearStore(state => state.plans);
  const currentPlanId = useGearStore(state => state.currentPlanId);
  const switchPlan = useGearStore(state => state.switchPlan);
  const createNewPlan = useGearStore(state => state.createNewPlan);
  const deletePlan = useGearStore(state => state.deletePlan);
  const updatePlanName = useGearStore(state => state.updatePlanName);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const currentPlan = plans.find(p => p.id === currentPlanId);

  const handleCreatePlan = () => {
    if (newPlanName.trim()) {
      createNewPlan(newPlanName.trim());
      setNewPlanName('');
      setShowNewPlan(false);
      setShowDropdown(false);
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      updatePlanName(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    if (plans.length <= 1) return;
    if (confirm('确定要删除这个方案吗？')) {
      deletePlan(planId);
    }
  };

  return (
    <div className="relative">
      {/* 当前方案显示 */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-300 rounded-xl hover:bg-cream-50 transition-colors"
      >
        <FolderOpen className="w-5 h-5 text-forest-600" />
        <span className="font-medium text-forest-800">{currentPlan?.name || '未命名方案'}</span>
        <span className="text-earth-400 text-sm">▼</span>
      </button>

      {/* 下拉菜单 */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-hover border border-cream-200 overflow-hidden z-50 animate-slide-in">
          {/* 方案列表 */}
          <div className="max-h-64 overflow-y-auto">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  plan.id === currentPlanId
                    ? 'bg-forest-50'
                    : 'hover:bg-cream-50'
                }`}
                onClick={() => {
                  switchPlan(plan.id);
                  setShowDropdown(false);
                }}
              >
                {plan.id === currentPlanId && (
                  <Check className="w-4 h-4 text-forest-600 flex-shrink-0" />
                )}
                {plan.id !== currentPlanId && (
                  <div className="w-4" />
                )}

                {editingId === plan.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-forest-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(plan.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit(plan.id);
                      }}
                      className="p-1 text-forest-600 hover:bg-forest-100 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      className="p-1 text-earth-400 hover:bg-earth-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-forest-800 text-sm truncate">
                        {plan.name}
                      </div>
                      <div className="text-xs text-earth-500">
                        {plan.gearList.length}件装备 · {plan.crew.length}人
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(plan.id, plan.name);
                      }}
                      className="p-1.5 text-earth-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg opacity-0 group-hover:opacity-100"
                      title="重命名"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {plans.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(e, plan.id)}
                        className="p-1.5 text-earth-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 新建方案 */}
          <div className="border-t border-cream-200 p-3">
            {showNewPlan ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="方案名称"
                  className="w-full px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePlan()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreatePlan}
                    className="flex-1 py-1.5 bg-forest-500 hover:bg-forest-600 text-white text-sm rounded-lg transition-colors"
                  >
                    创建
                  </button>
                  <button
                    onClick={() => {
                      setShowNewPlan(false);
                      setNewPlanName('');
                    }}
                    className="flex-1 py-1.5 bg-earth-100 hover:bg-earth-200 text-earth-700 text-sm rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewPlan(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-cream-50 hover:bg-cream-100 text-forest-700 text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建方案
              </button>
            )}
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default PlanManager;
