import { useState } from 'react';
import { UserPlus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { formatWeight } from '@/utils/weightCalc';

const CrewMembers = () => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const addCrewMember = useGearStore(state => state.addCrewMember);
  const removeCrewMember = useGearStore(state => state.removeCrewMember);
  const updateCrewMember = useGearStore(state => state.updateCrewMember);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState(15);

  if (!plan) return null;

  const handleAdd = () => {
    if (newName.trim()) {
      addCrewMember(newName.trim(), newWeight * 1000);
      setNewName('');
      setNewWeight(15);
      setShowAdd(false);
    }
  };

  const startEdit = (id: string, name: string, maxWeight: number) => {
    setEditingId(id);
    setEditName(name);
    setEditWeight(Math.round(maxWeight / 1000));
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      updateCrewMember(id, { name: editName.trim(), maxWeight: editWeight * 1000 });
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-forest-800 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          同行人员
          <span className="text-sm font-normal text-earth-500">({plan.crew.length}人)</span>
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-1.5 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          添加
        </button>
      </div>

      {/* 添加人员表单 */}
      {showAdd && (
        <div className="mb-4 p-4 bg-cream-50 rounded-xl animate-slide-in">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[120px]">
              <label className="text-xs text-earth-600 block mb-1">姓名</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="输入姓名"
                className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-earth-600 block mb-1">承重(kg)</label>
              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                min={1}
                max={50}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-forest-500 hover:bg-forest-600 text-white rounded-lg font-medium transition-colors"
            >
              确认
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-earth-200 hover:bg-earth-300 text-earth-700 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 人员列表 */}
      <div className="space-y-3">
        {plan.crew.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors group"
          >
            {/* 头像 */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: member.avatarColor }}
            >
              {member.name.charAt(0)}
            </div>

            {editingId === member.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 border border-forest-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(member.id)}
                />
                <input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-forest-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
                />
                <span className="text-sm text-earth-500">kg</span>
                <button
                  onClick={() => saveEdit(member.id)}
                  className="p-1.5 text-forest-600 hover:bg-forest-100 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 text-earth-500 hover:bg-earth-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="font-medium text-forest-800">{member.name}</div>
                  <div className="text-xs text-earth-500">
                    承重上限: {formatWeight(member.maxWeight)}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(member.id, member.name, member.maxWeight)}
                    className="p-1.5 text-earth-500 hover:bg-cream-200 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {plan.crew.length > 1 && (
                    <button
                      onClick={() => removeCrewMember(member.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrewMembers;
