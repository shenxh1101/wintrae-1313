import { SmartTip, ListItem, CrewMember, Season, CampType, Weather, GearCategory, CATEGORY_LABELS, DuplicateItem, ConsumableType, Backpack } from '@/types';

interface TipContext {
  gearList: ListItem[];
  crew: CrewMember[];
  backpacks: Backpack[];
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

  const addTip = (type: SmartTip['type'], title: string, description: string, category?: string, dismissible: boolean = true) => {
    tips.push({
      id: `tip-${++tipId}`,
      type,
      title,
      description,
      category,
      dismissible,
    });
  };

  // 1. 检查必备类别是否遗漏
  const essentialCategories: { cat: GearCategory; reason: string }[] = [];
  
  essentialCategories.push({ cat: 'tent', reason: '露营住宿' });
  essentialCategories.push({ cat: 'lighting', reason: '夜间照明' });
  essentialCategories.push({ cat: 'firstaid', reason: '安全保障' });
  
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

  // 4. 同类装备重复携带检测
  const duplicates = findDuplicateItems(context.gearList, context.backpacks);
  duplicates.forEach(dup => {
    if (!dup.shouldWarn) return;
    
    addTip(
      'warning',
      `检测到${dup.itemName}可能重复携带`,
      `共有 ${dup.totalCount} 件${dup.itemName}。${dup.reason || '如果确实需要多件，可以在装备列表中标记为"保留重复"或分配给不同的人。'}`,
      dup.category
    );
  });

  // 5. 未分配装备提示
  const unassignedCount = context.gearList.filter(
    item => !item.isShared && !item.backpackId
  ).length;
  
  if (unassignedCount > 0) {
    addTip(
      'info',
      `${unassignedCount}件装备未分配背包`,
      '请前往背包分配页面，将装备分配到具体背包中。',
      'other'
    );
  }

  // 6. 天数相关提示
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

  // 7. 成功提示 - 清单比较完整时
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

export const findDuplicateItems = (gearList: ListItem[], backpacks: Backpack[] = []): DuplicateItem[] => {
  const categoryMap: Record<string, ListItem[]> = {};
  
  gearList.forEach(item => {
    if (item.isShared) return;
    if (item.keepDuplicate) return;
    
    const key = `${item.category}-${getSimilarityKey(item.name)}`;
    if (!categoryMap[key]) {
      categoryMap[key] = [];
    }
    categoryMap[key].push(item);
  });

  const duplicates: DuplicateItem[] = [];
  
  Object.entries(categoryMap).forEach(([key, items]) => {
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalCount <= 1) return;
    
    const category = items[0].category;
    const itemName = getCategoryDisplayName(key, category);
    
    const carrierIds = new Set<string>();
    items.forEach(item => {
      if (item.carrierId) {
        carrierIds.add(item.carrierId);
      }
    });
    
    const distinctCarriers = carrierIds.size;
    const hasMixedCarriers = distinctCarriers > 1;
    
    let shouldWarn = true;
    let reason = '';
    
    if (hasMixedCarriers && totalCount === distinctCarriers) {
      shouldWarn = false;
      reason = '已分配给不同的人';
    } else if (hasMixedCarriers) {
      shouldWarn = true;
      reason = `分配给了 ${distinctCarriers} 个人，但有 ${totalCount} 件`;
    } else if (items.length === 1 && items[0].quantity > 1) {
      shouldWarn = true;
      reason = '同一件装备数量为多件';
    } else {
      shouldWarn = true;
      reason = '多个同类装备都由同一人携带';
    }
    
    const allKeepDuplicate = items.every(i => i.keepDuplicate);
    if (allKeepDuplicate) {
      shouldWarn = false;
      reason = '已全部标记为保留重复';
    }
    
    duplicates.push({
      category,
      itemName,
      count: items.length,
      totalCount,
      itemIds: items.map(i => i.id),
      isSharedMixed: false,
      shouldWarn,
      reason,
      distinctCarriers,
    });
  });

  return duplicates;
};

const getSimilarityKey = (name: string): string => {
  const keywords: Record<string, string[]> = {
    'tent': ['帐篷', '天幕'],
    'sleeping-bag': ['睡袋'],
    'sleeping-pad': ['防潮垫', '睡垫'],
    'stove': ['炉头', '炉具', '炉子'],
    'pot': ['套锅', '锅'],
    'light': ['露营灯', '头灯', '手电', '灯'],
    'chair': ['椅子', '折叠椅'],
    'table': ['桌子', '折叠桌'],
    'backpack': ['背包', '登山包'],
    'water-bottle': ['水壶', '水袋'],
  };

  for (const [key, words] of Object.entries(keywords)) {
    if (words.some(word => name.includes(word))) {
      return key;
    }
  }
  
  return name.slice(0, 2);
};

const getCategoryDisplayName = (key: string, category: GearCategory): string => {
  const keyPart = key.split('-').slice(1).join('-');
  
  const displayNames: Record<string, string> = {
    'tent': '帐篷/天幕',
    'sleeping-bag': '睡袋',
    'sleeping-pad': '睡垫/防潮垫',
    'stove': '炉具',
    'pot': '炊具',
    'light': '照明设备',
    'chair': '椅子',
    'table': '桌子',
    'backpack': '背包',
    'water-bottle': '水壶',
  };

  return displayNames[keyPart] || CATEGORY_LABELS[category];
};
