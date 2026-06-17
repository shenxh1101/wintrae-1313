import { useState } from 'react';
import { Backpack, Plus, Trash2, Edit2, Check, X, Package } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { formatWeight, getWeightPercentage } from '@/utils/weightCalc';

const BackpackAllocation = () => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const addBackpack = useGearStore(state => state.addBackpack);
  const removeBackpack = useGearStore(state => state.removeBackpack);
  const updateBackpack = useGearStore(state => state.updateBackpack);
  const setGearBackpack = useGearStore(state => state.setGearBackpack);
  const setGearCarrier = useGearStore(state => state.setGearCarrier);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [editingBackpackId, setEditingBackpackId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMaxWeight, setEditMaxWeight] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBackpackName, setNewBackpackName] = useState('');
  const [newBackpackWeight, setNewBackpackWeight] = useState('10000');

  if (!plan) return null;

  const getBackpackItems = (backpackId: string) => {
    return plan.gearList.filter(item => item.backpackId === backpackId);
  };

  const getBackpackWeight = (backpackId: string) => {
    return getBackpackItems(backpackId).reduce(
      (sum, item) => sum + item.weight * item.quantity, 0
    );
  };

  const unassignedItems = plan.gearList.filter(
    item => !item.isShared && !item.backpackId
  );

  const sharedItems = plan.gearList.filter(item => item.isShared);

  const handleAddBackpack = () => {
    if (!selectedOwnerId || !newBackpackName) return;
    
    const maxWeight = parseInt(newBackpackWeight) || 10000;
    addBackpack(newBackpackName, selectedOwnerId, maxWeight);
    setNewBackpackName('');
    setNewBackpackWeight('10000');
    setShowAddForm(false);
  };

  const handleRemoveBackpack = (backpackId: string) => {
    if (confirm('确定删除这个背包吗？背包里的装备将变为未分配状态。')) {
      removeBackpack(backpackId);
    }
  };

  const startEditBackpack = (backpackId: string, name: string, maxWeight: number) => {
    setEditingBackpackId(backpackId);
    setEditName(name);
    setEditMaxWeight(maxWeight.toString());
  };

  const saveEditBackpack = (backpackId: string) => {
    if (!editName.trim()) return;
    const maxWeight = parseInt(editMaxWeight) || 10000;
    updateBackpack(backpackId, { name: editName.trim(), maxWeight });
    setEditingBackpackId(null);
  };

  const handleAssignToBackpack = (itemId: string, backpackId: string | undefined) => {
    if (backpackId) {
      const backpack = plan.backpacks.find(b => b.id === backpackId);
      if (backpack) {
        setGearCarrier(itemId, backpack.ownerId);
      }
    }
    setGearBackpack(itemId, backpackId);
  };

  const getBackpacksByOwner = (ownerId: string) => {
    return plan.backpacks.filter(b => b.ownerId === ownerId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
          <span className="text-2xl">🎒</span>
          背包分配
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-500 hover:bg-forest-600 text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加背包
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-cream-50 rounded-xl border border-cream-200">
          <h3 className="font-medium text-forest-800 mb-3">新建背包</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <select
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
              className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            >
              <option value="">选择持有人</option>
              {plan.crew.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newBackpackName}
              onChange={(e) => setNewBackpackName(e.target.value)}
              placeholder="背包名称"
              className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
            <input
              type="number"
              value={newBackpackWeight}
              onChange={(e) => setNewBackpackWeight(e.target.value)}
              placeholder="承重上限(g)"
              className="px-3 py-2 border border-cream-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddBackpack}
              className="px-4 py-1.5 bg-forest-500 hover:bg-forest-600 text-white text-sm rounded-lg transition-colors"
            >
              确认添加
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 bg-earth-200 hover:bg-earth-300 text-earth-700 text-sm rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {plan.backpacks.length === 0 ? (
        <div className="text-center py-8 text-earth-400">
          <Backpack className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>还没有背包</p>
          <p className="text-sm">点击上方按钮添加背包吧</p>
        </div>
      ) : (
        <div className="space-y-6">
          {plan.crew.map(member => {
            const memberBackpacks = getBackpacksByOwner(member.id);
            if (memberBackpacks.length === 0) return null;

            return (
              <div key={member.id} className="space-y-3">
                <h3 className="font-medium text-forest-700 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: member.avatarColor }}
                  />
                  {member.name}的背包
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {memberBackpacks.map(backpack => {
                    const weight = getBackpackWeight(backpack.id);
                    const percentage = getWeightPercentage(weight, backpack.maxWeight);
                    const isOverweight = weight > backpack.maxWeight;
                    const items = getBackpackItems(backpack.id);
                    const isEditing = editingBackpackId === backpack.id;

                    return (
                      <div
                        key={backpack.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isOverweight
                            ? 'border-red-300 bg-red-50'
                            : 'border-cream-200 bg-cream-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: backpack.color }}
                            >
                              <Backpack className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-32 px-2 py-1 text-sm border border-cream-300 rounded focus:outline-none focus:ring-2 focus:ring-forest-400"
                                  autoFocus
                                />
                              ) : (
                                <h4 className="font-medium text-forest-800">
                                  {backpack.name}
                                </h4>
                              )}
                              {isEditing ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <input
                                    type="number"
                                    value={editMaxWeight}
                                    onChange={(e) => setEditMaxWeight(e.target.value)}
                                    className="w-20 px-1 py-0.5 text-xs border border-cream-300 rounded focus:outline-none focus:ring-1 focus:ring-forest-400"
                                  />
                                  <span className="text-xs text-earth-500">g</span>
                                </div>
                              ) : (
                                <p className="text-xs text-earth-500">
                                  上限: {formatWeight(backpack.maxWeight)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEditBackpack(backpack.id)}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingBackpackId(null)}
                                  className="p-1.5 text-earth-500 hover:bg-earth-200 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditBackpack(backpack.id, backpack.name, backpack.maxWeight)}
                                  className="p-1.5 text-earth-400 hover:text-earth-600 hover:bg-cream-100 rounded transition-colors"
                                  title="编辑"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveBackpack(backpack.id)}
                                  className="p-1.5 text-earth-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="删除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-earth-600">当前重量</span>
                            <span className={`font-medium ${
                              isOverweight ? 'text-red-600' : 'text-forest-700'
                            }`}>
                              {formatWeight(weight)}
                            </span>
                          </div>
                          <div className="h-2.5 bg-white rounded-full overflow-hidden border border-cream-200">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isOverweight ? 'bg-red-500' : 'bg-forest-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          {isOverweight && (
                            <p className="text-xs text-red-500">
                              ⚠️ 超重 {formatWeight(weight - backpack.maxWeight)}
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-earth-500 mb-2">
                          装备 {items.length} 件
                        </div>
                        
                        {items.length > 0 && (
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {items.map(item => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between px-2 py-1 bg-white/60 rounded text-sm"
                              >
                                <span className="text-forest-700 truncate flex-1">
                                  {item.name} ×{item.quantity}
                                </span>
                                <button
                                  onClick={() => handleAssignToBackpack(item.id, undefined)}
                                  className="ml-2 text-earth-400 hover:text-red-500 transition-colors"
                                  title="移出背包"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-cream-200">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-earth-500" />
          <h3 className="font-medium text-forest-800">未分配装备</h3>
          <span className="text-xs text-earth-500">
            ({unassignedItems.length} 件)
          </span>
        </div>
        
        {unassignedItems.length === 0 ? (
          <p className="text-sm text-earth-400 text-center py-4">
            ✅ 所有个人装备都已分配到背包
          </p>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1">
            {unassignedItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 bg-cream-50 rounded-lg border border-cream-200"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-forest-700 truncate block">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="text-xs text-earth-500">
                    {formatWeight(item.weight * item.quantity)}
                  </span>
                </div>
                <select
                  value=""
                  onChange={(e) => handleAssignToBackpack(item.id, e.target.value || undefined)}
                  className="ml-2 text-xs px-2 py-1 bg-white border border-cream-300 rounded-lg text-earth-600 focus:outline-none focus:ring-2 focus:ring-forest-400"
                >
                  <option value="">分配到...</option>
                  {plan.backpacks.map(bp => {
                    const owner = plan.crew.find(c => c.id === bp.ownerId);
                    return (
                      <option key={bp.id} value={bp.id}>
                        {owner?.name || '未知'} - {bp.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {sharedItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-cream-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👥</span>
            <h3 className="font-medium text-forest-800">共享装备</h3>
            <span className="text-xs text-earth-500">
              ({sharedItems.length} 件，按人数分摊)
            </span>
          </div>
          <p className="text-sm text-earth-400">
            共享装备由全队共同承担，不计入单个背包重量
          </p>
        </div>
      )}

      <p className="text-xs text-earth-400 mt-4">
        💡 提示：点击装备右侧下拉菜单可将其分配到不同背包
      </p>
    </div>
  );
};

export default BackpackAllocation;
