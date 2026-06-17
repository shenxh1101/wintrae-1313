import { SmartTip, ListItem, CrewMember, Season, CampType, Weather, GearCategory, CATEGORY_LABELS } from '@/types';

interface TipContext {
  gearList: ListItem[];
  crew: CrewMember[];
  season: Season;
  days: number;
  weather: Weather;
  campType: CampType;
  totalWeight: number;
  perPersonWeight: number;
}

export const generateSmartTips = (context: TipContext): SmartTip[] => {
  const tips: SmartTip[] = [];
  let tipId = 0;

  const addTip = (type: SmartTip['type'], title: string, description: string, category?: string) => {
    tips.push({
      id: `tip-${++tipId}`,
      type,
      title,
      description,
      category,
    });
  };

  // 1. 检查必备类别是否遗漏
  const essentialCategories: { cat: GearCategory; reason: string }[] = [];
  
  // 基本必备
  essentialCategories.push({ cat: 'tent', reason: '露营住宿' });
  essentialCategories.push({ cat: 'lighting', reason: '夜间照明' });
  essentialCategories.push({ cat: 'firstaid', reason: '安全保障' });
  
  // 按营地类型
  if (context.campType === 'mountain' || context.campType === 'desert') {
    essentialCategories.push({ cat: 'cooking', reason: '野外烹饪' });
  }

  essentialCategories.forEach(({ cat, reason }) => {
    const hasItems = context.gearList.some(item => item.category === cat && item.quantity > 0);
    if (!hasItems) {
      addTip(
        'warning',
        `缺少${CATEGORY_LABELS[cat]}装备`,
        `建议准备${CATEGORY_LABELS[cat]}相关装备，用于${reason}。`,
        cat
      );
    }
  });

  // 2. 季节相关提示
  if (context.season === 'winter') {
    const hasWinterGear = context.gearList.some(
      item => item.id === 'sleeping-bag-winter' || item.id === 'down-jacket'
    );
    if (!hasWinterGear) {
      addTip(
        'warning',
        '冬季保暖装备不足',
        '冬季露营建议配备冬季睡袋和羽绒服，注意保暖。',
        'clothing'
      );
    }
  }

  if (context.season === 'summer') {
    const hasSunProtection = context.gearList.some(
      item => item.id === 'sunscreen' || item.id === 'sun-hat'
    );
    if (!hasSunProtection) {
      addTip(
        'info',
        '建议准备防晒用品',
        '夏季露营紫外线强，建议准备防晒霜和遮阳帽。',
        'firstaid'
      );
    }
  }

  // 3. 天气相关提示
  if (context.weather === 'rainy') {
    const hasRainGear = context.gearList.some(
      item => item.id === 'rain-jacket'
    );
    if (!hasRainGear) {
      addTip(
        'warning',
        '缺少防雨装备',
        '雨天露营建议准备冲锋衣，注意防水。',
        'clothing'
      );
    }
  }

  if (context.weather === 'snowy') {
    const hasSnowGear = context.gearList.some(
      item => item.id === 'warm-hat' || item.id === 'gloves'
    );
    if (!hasSnowGear) {
      addTip(
        'warning',
        '雪天保暖装备不足',
        '雪天露营建议配备保暖帽和手套，防止冻伤。',
        'clothing'
      );
    }
  }

  // 4. 重量超限检查
  context.crew.forEach(member => {
    const personalWeight = context.gearList
      .filter(item => !item.isShared && item.carrierId === member.id)
      .reduce((sum, item) => sum + item.weight * item.quantity, 0);
    
    const sharedWeight = context.gearList
      .filter(item => item.isShared)
      .reduce((sum, item) => sum + item.weight * item.quantity, 0) / Math.max(context.crew.length, 1);
    
    const totalPersonalWeight = personalWeight + sharedWeight;
    
    if (totalPersonalWeight > member.maxWeight) {
      addTip(
        'error',
        `${member.name}的背包超重`,
        `${member.name}的背包重量约为${(totalPersonalWeight / 1000).toFixed(1)}kg，超出其承重上限${(member.maxWeight / 1000).toFixed(1)}kg。建议减轻装备或调整分配。`,
        'other'
      );
    }
  });

  // 5. 易耗品数量检查
  context.gearList
    .filter(item => item.isConsumable && item.recommendedPerDay && item.quantity > 0)
    .forEach(item => {
      const recommendedQty = Math.ceil(item.recommendedPerDay! * context.days * (item.isShared ? 1 : 1));
      if (item.isShared) {
        // 共享易耗品按人头计算
        const perPersonRec = item.recommendedPerDay! * context.days;
        const totalRec = Math.ceil(perPersonRec * Math.max(context.crew.length, 1));
        if (item.quantity < totalRec) {
          addTip(
            'info',
            `${item.name}数量可能不足`,
            `按${context.days}天${context.crew.length}人计算，建议准备${totalRec}份，当前只有${item.quantity}份。`,
            item.category
          );
        }
      }
    });

  // 6. 重复携带检查（共享装备被多个人添加为个人装备）
  const sharedGearIds = context.gearList.filter(item => item.isShared).map(item => item.id);
  const duplicateItems: string[] = [];
  
  context.gearList.forEach(item => {
    if (!item.isShared && sharedGearIds.includes(item.id)) {
      // 检查是否为同一件装备但被标记为个人
      const baseItem = context.gearList.find(g => g.id === item.id && g.isShared);
      if (baseItem) {
        duplicateItems.push(item.name);
      }
    }
  });

  if (duplicateItems.length > 0) {
    addTip(
      'warning',
      '存在重复携带的装备',
      `以下装备既作为共享装备又作为个人装备：${duplicateItems.join('、')}。请确认是否需要重复携带。`,
      'other'
    );
  }

  // 7. 天数相关提示
  if (context.days >= 3) {
    const hasEnoughFood = context.gearList.filter(item => item.category === 'food').length >= 3;
    if (!hasEnoughFood) {
      addTip(
        'info',
        '建议准备更多食物',
        `${context.days}天的行程建议准备充足的食物和水，注意营养搭配。`,
        'food'
      );
    }
  }

  // 8. 成功提示 - 清单比较完整时
  const categoriesWithItems = new Set(context.gearList.filter(i => i.quantity > 0).map(i => i.category));
  if (categoriesWithItems.size >= 5) {
    addTip(
      'success',
      '装备清单比较完整',
      '你已经准备了多个类别的装备，继续完善细节吧！',
      'other'
    );
  }

  return tips;
};
