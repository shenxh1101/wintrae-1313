import { ListItem, CrewMember, WeightBreakdown, GearCategory } from '@/types';

export const calculateWeight = (
  gearList: ListItem[],
  crew: CrewMember[]
): WeightBreakdown => {
  const byCategory: Record<GearCategory, number> = {
    tent: 0,
    cooking: 0,
    lighting: 0,
    firstaid: 0,
    clothing: 0,
    food: 0,
    other: 0,
  };

  const byPerson: Record<string, number> = {};
  crew.forEach(member => {
    byPerson[member.id] = 0;
  });

  let total = 0;

  gearList.forEach(item => {
    const itemWeight = item.weight * item.quantity;
    total += itemWeight;
    byCategory[item.category] += itemWeight;

    if (item.isShared) {
      const shareWeight = itemWeight / Math.max(crew.length, 1);
      crew.forEach(member => {
        byPerson[member.id] += shareWeight;
      });
    } else if (item.carrierId && byPerson[item.carrierId] !== undefined) {
      byPerson[item.carrierId] += itemWeight;
    }
  });

  const perPerson = crew.length > 0 ? total / crew.length : 0;

  return {
    total,
    perPerson,
    byCategory,
    byPerson,
  };
};

export const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`;
  }
  return `${grams.toFixed(0)} g`;
};

export const getWeightPercentage = (current: number, max: number): number => {
  if (max <= 0) return 0;
  return Math.min((current / max) * 100, 100);
};
