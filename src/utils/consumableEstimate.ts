import { ListItem, CrewMember, ConsumableEstimate, ConsumableType, CONSUMABLE_TYPE_LABELS, GearCategory } from '@/types';

export const calculateConsumableEstimates = (
  gearList: ListItem[],
  crew: CrewMember[],
  days: number
): ConsumableEstimate[] => {
  const estimates: ConsumableEstimate[] = [];

  gearList
    .filter(item => item.isConsumable)
    .forEach(item => {
      let recommendedQty = 0;
      let perPersonPerDay: number | undefined;
      let perDay: number | undefined;

      if (item.recommendedPerPersonPerDay && !item.isShared) {
        perPersonPerDay = item.recommendedPerPersonPerDay;
        recommendedQty = Math.ceil(item.recommendedPerPersonPerDay * days * Math.max(crew.length, 1));
      } else if (item.recommendedPerDay && item.isShared) {
        perDay = item.recommendedPerDay;
        recommendedQty = Math.ceil(item.recommendedPerDay * days);
      } else if (item.recommendedPerPersonPerDay && item.isShared) {
        perDay = item.recommendedPerPersonPerDay * Math.max(crew.length, 1);
        recommendedQty = Math.ceil(item.recommendedPerPersonPerDay * days * Math.max(crew.length, 1));
      }

      if (recommendedQty > 0) {
        estimates.push({
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          currentQty: item.quantity,
          recommendedQty,
          diff: item.quantity - recommendedQty,
          unitWeight: item.weight,
          isShared: item.isShared,
          perPersonPerDay,
          perDay,
        });
      }
    });

  return estimates.sort((a, b) => a.diff - b.diff);
};

export const getConsumableByType = (
  estimates: ConsumableEstimate[],
  gearList: ListItem[]
): Record<ConsumableType, ConsumableEstimate[]> => {
  const result: Record<ConsumableType, ConsumableEstimate[]> = {
    water: [],
    food: [],
    fuel: [],
    clothing: [],
    other: [],
  };

  estimates.forEach(estimate => {
    const item = gearList.find(g => g.id === estimate.itemId);
    const type = item?.consumableType || 'other';
    result[type].push(estimate);
  });

  return result;
};

export const formatEstimateSummary = (
  estimates: ConsumableEstimate[]
): { totalCurrent: number; totalRecommended: number; totalDiff: number; deficitCount: number } => {
  let totalCurrent = 0;
  let totalRecommended = 0;
  let deficitCount = 0;

  estimates.forEach(e => {
    totalCurrent += e.currentQty;
    totalRecommended += e.recommendedQty;
    if (e.diff < 0) deficitCount++;
  });

  return {
    totalCurrent,
    totalRecommended,
    totalDiff: totalCurrent - totalRecommended,
    deficitCount,
  };
};
