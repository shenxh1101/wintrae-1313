import { Plan, ListItem, CrewMember, CATEGORY_LABELS, SEASON_LABELS, WEATHER_LABELS, CAMPTYPE_LABELS } from '@/types';
import { formatWeight } from './weightCalc';

export const exportAsText = (plan: Plan): string => {
  const lines: string[] = [];
  
  lines.push('═══ 露营装备清单 ═══');
  lines.push('');
  lines.push(`方案名称：${plan.name}`);
  lines.push(`季节：${SEASON_LABELS[plan.destination.season]}`);
  lines.push(`天数：${plan.destination.days}天`);
  lines.push(`天气：${WEATHER_LABELS[plan.destination.weather]}`);
  lines.push(`营地类型：${CAMPTYPE_LABELS[plan.destination.campType]}`);
  lines.push(`同行人数：${plan.crew.length}人`);
  lines.push('');

  // 按类别分组
  const categories = [...new Set(plan.gearList.map(item => item.category))];
  
  categories.forEach(category => {
    lines.push(`── ${CATEGORY_LABELS[category]} ──`);
    const categoryItems = plan.gearList.filter(item => item.category === category);
    
    categoryItems.forEach(item => {
      const shared = item.isShared ? '[共享]' : '[个人]';
      const carrier = item.carrierId 
        ? ` - 携带者: ${plan.crew.find(c => c.id === item.carrierId)?.name || '未分配'}`
        : item.isShared ? ' - 全队共享' : '';
      const weight = ` (${formatWeight(item.weight * item.quantity)})`;
      lines.push(`  ${shared} ${item.name} x${item.quantity}${weight}${carrier}`);
    });
    lines.push('');
  });

  // 按人汇总
  lines.push('── 个人装备汇总 ──');
  plan.crew.forEach(member => {
    const personalItems = plan.gearList.filter(
      item => !item.isShared && item.carrierId === member.id
    );
    const sharedItems = plan.gearList.filter(item => item.isShared);
    
    const personalWeight = personalItems.reduce(
      (sum, item) => sum + item.weight * item.quantity, 0
    );
    const sharedWeight = sharedItems.reduce(
      (sum, item) => sum + item.weight * item.quantity, 0
    ) / plan.crew.length;
    
    lines.push(`  ${member.name}:`);
    lines.push(`    个人装备: ${formatWeight(personalWeight)}`);
    lines.push(`    分摊共享: ${formatWeight(sharedWeight)}`);
    lines.push(`    总计: ${formatWeight(personalWeight + sharedWeight)} / ${formatWeight(member.maxWeight)}`);
    lines.push('');
  });

  // 总重量
  const totalWeight = plan.gearList.reduce(
    (sum, item) => sum + item.weight * item.quantity, 0
  );
  lines.push(`总重量：${formatWeight(totalWeight)}`);
  lines.push('');
  lines.push('═══ 清单结束 ═══');

  return lines.join('\n');
};

export const exportByPerson = (plan: Plan, memberId: string): string => {
  const member = plan.crew.find(c => c.id === memberId);
  if (!member) return '';

  const lines: string[] = [];
  
  lines.push(`═══ ${member.name}的装备清单 ═══`);
  lines.push('');
  lines.push(`方案：${plan.name}`);
  lines.push(`行程：${plan.destination.days}天 ${SEASON_LABELS[plan.destination.season]}`);
  lines.push('');

  // 个人装备
  lines.push('── 个人装备 ──');
  const personalItems = plan.gearList.filter(
    item => !item.isShared && item.carrierId === memberId
  );
  
  const personalCategories = [...new Set(personalItems.map(i => i.category))];
  personalCategories.forEach(cat => {
    lines.push(`【${CATEGORY_LABELS[cat]}】`);
    personalItems.filter(i => i.category === cat).forEach(item => {
      lines.push(`  □ ${item.name} x${item.quantity}  (${formatWeight(item.weight * item.quantity)})`);
    });
  });
  lines.push('');

  // 共享装备
  lines.push('── 共享装备（分摊）──');
  const sharedItems = plan.gearList.filter(item => item.isShared);
  const sharedCategories = [...new Set(sharedItems.map(i => i.category))];
  sharedCategories.forEach(cat => {
    lines.push(`【${CATEGORY_LABELS[cat]}】`);
    sharedItems.filter(i => i.category === cat).forEach(item => {
      const shareWeight = (item.weight * item.quantity) / plan.crew.length;
      lines.push(`  □ ${item.name} x${item.quantity}  (个人分摊: ${formatWeight(shareWeight)})`);
    });
  });
  lines.push('');

  // 重量汇总
  const personalWeight = personalItems.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const sharedWeight = sharedItems.reduce((sum, item) => sum + item.weight * item.quantity, 0) / plan.crew.length;
  
  lines.push(`个人装备重量：${formatWeight(personalWeight)}`);
  lines.push(`共享装备分摊：${formatWeight(sharedWeight)}`);
  lines.push(`个人总负重：${formatWeight(personalWeight + sharedWeight)} / ${formatWeight(member.maxWeight)}`);
  lines.push('');
  lines.push('═══ 请逐项检查确认 ═══');

  return lines.join('\n');
};

export const exportAsJSON = (plan: Plan): string => {
  return JSON.stringify(plan, null, 2);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const downloadAsFile = (content: string, filename: string, type: string = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
