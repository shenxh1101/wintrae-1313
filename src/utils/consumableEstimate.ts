import { ListItem, CrewMember, ConsumableEstimate, ConsumableType, CONSUMABLE_TYPE_LABELS, GearCategory, GearItem } from '@/types';
import { gearLibrary } from '@/data/gearData';

export const calculateConsumableEstimates = (
  gearList: ListItem[],
  crew: CrewMember[],
  days: number
): ConsumableEstimate[] => {
  const estimates: ConsumableEstimate[] = [];
  const itemMap = new Map(gearList.map(i => [i.id, i]));

  const allConsumables = gearLibrary.filter(item => item.isConsumable);

  allConsumables.forEach(gearItem => {
    const listItem = itemMap.get(gearItem.id);
    const currentQty = listItem?.quantity || 0;
    const inList = !!listItem;

    let recommendedQty = 0;
    let perPersonPerDay: number | undefined;
    let perDay: number | undefined;
    const isShared = listItem?.isShared ?? gearItem.isShared;

    if (gearItem.recommendedPerPersonPerDay && !isShared) {
      perPersonPerDay = gearItem.recommendedPerPersonPerDay;
      recommendedQty = Math.ceil(gearItem.recommendedPerPersonPerDay * days * Math.max(crew.length, 1));
    } else if (gearItem.recommendedPerDay && isShared) {
      perDay = gearItem.recommendedPerDay;
      recommendedQty = Math.ceil(gearItem.recommendedPerDay * days);
    } else if (gearItem.recommendedPerPersonPerDay && isShared) {
      perDay = gearItem.recommendedPerPersonPerDay * Math.max(crew.length, 1);
      recommendedQty = Math.ceil(gearItem.recommendedPerPersonPerDay * days * Math.max(crew.length, 1));
    }

    if (recommendedQty > 0) {
      estimates.push({
        itemId: gearItem.id,
        itemName: gearItem.name,
        category: gearItem.category,
        currentQty,
        recommendedQty,
        diff: currentQty - recommendedQty,
        unitWeight: gearItem.weight,
        isShared,
        perPersonPerDay,
        perDay,
        consumableType: gearItem.consumableType,
        inList,
      });
    }
  });

  return estimates.sort((a, b) => {
    if (a.inList !== b.inList) return a.inList ? -1 : 1;
    return a.diff - b.diff;
  });
};

export const getConsumableByType = (
  estimates: ConsumableEstimate[]
): Record<ConsumableType, ConsumableEstimate[]> => {
  const result: Record<ConsumableType, ConsumableEstimate[]> = {
    water: [],
    food: [],
    fuel: [],
    clothing: [],
    other: [],
  };

  estimates.forEach(estimate => {
    const type = estimate.consumableType || 'other';
    result[type].push(estimate);
  });

  return result;
};

export const formatEstimateSummary = (
  estimates: ConsumableEstimate[]
): { totalCurrent: number; totalRecommended: number; totalDiff: number; deficitCount: number; notInListCount: number } => {
  let totalCurrent = 0;
  let totalRecommended = 0;
  let deficitCount = 0;
  let notInListCount = 0;

  estimates.forEach(e => {
    totalCurrent += e.currentQty;
    totalRecommended += e.recommendedQty;
    if (e.diff < 0) deficitCount++;
    if (!e.inList) notInListCount++;
  });

  return {
    totalCurrent,
    totalRecommended,
    totalDiff: totalCurrent - totalRecommended,
    deficitCount,
    notInListCount,
  };
};

export const getGearItemById = (itemId: string): GearItem | undefined => {
  return gearLibrary.find(g => g.id === itemId);
};
