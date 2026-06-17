import { ListItem, CrewMember, WeightBreakdown, GearCategory, Backpack, ItemAllocation } from '@/types';

export const calculateWeight = (
  gearList: ListItem[],
  crew: CrewMember[],
  backpacks: Backpack[] = []
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

  const byBackpack: Record<string, number> = {};
  backpacks.forEach(bp => {
    byBackpack[bp.id] = 0;
  });

  let total = 0;
  let unassigned = 0;

  const backpackOwners: Record<string, string> = {};
  backpacks.forEach(bp => {
    backpackOwners[bp.id] = bp.ownerId;
  });

  gearList.forEach(item => {
    const itemWeight = item.weight * item.quantity;
    total += itemWeight;
    byCategory[item.category] += itemWeight;

    if (item.isShared) {
      const shareWeight = itemWeight / Math.max(crew.length, 1);
      crew.forEach(member => {
        byPerson[member.id] += shareWeight;
      });
      unassigned += itemWeight;
      return;
    }

    const allocations = getItemAllocations(item);
    const totalAllocQty = allocations.reduce((s, a) => s + a.quantity, 0);
    const unallocatedQty = item.quantity - totalAllocQty;

    allocations.forEach(alloc => {
      const allocWeight = item.weight * alloc.quantity;
      
      if (byBackpack[alloc.backpackId] !== undefined) {
        byBackpack[alloc.backpackId] += allocWeight;
      }
      
      const ownerId = backpackOwners[alloc.backpackId];
      if (ownerId && byPerson[ownerId] !== undefined) {
        byPerson[ownerId] += allocWeight;
      }
    });

    if (unallocatedQty > 0) {
      unassigned += item.weight * unallocatedQty;
      
      if (item.carrierId && byPerson[item.carrierId] !== undefined) {
        byPerson[item.carrierId] += item.weight * unallocatedQty;
      }
    }
  });

  const perPerson = crew.length > 0 ? total / crew.length : 0;

  return {
    total,
    perPerson,
    byCategory,
    byPerson,
    byBackpack,
    unassigned,
  };
};

export const getItemAllocations = (item: ListItem): ItemAllocation[] => {
  if (item.allocations && item.allocations.length > 0) {
    return item.allocations;
  }
  
  if (item.backpackId) {
    return [{ backpackId: item.backpackId, quantity: item.quantity }];
  }
  
  return [];
};

export const getBackpackWeight = (
  backpackId: string,
  gearList: ListItem[]
): number => {
  return gearList.reduce((sum, item) => {
    if (item.isShared) return sum;
    
    const allocations = getItemAllocations(item);
    const alloc = allocations.find(a => a.backpackId === backpackId);
    if (alloc) {
      return sum + item.weight * alloc.quantity;
    }
    return sum;
  }, 0);
};

export const getBackpackItems = (
  backpackId: string,
  gearList: ListItem[]
): { item: ListItem; quantity: number }[] => {
  const items: { item: ListItem; quantity: number }[] = [];
  
  gearList.forEach(item => {
    if (item.isShared) return;
    
    const allocations = getItemAllocations(item);
    const alloc = allocations.find(a => a.backpackId === backpackId);
    if (alloc && alloc.quantity > 0) {
      items.push({ item, quantity: alloc.quantity });
    }
  });
  
  return items;
};

export const getUnassignedItems = (gearList: ListItem[]): { item: ListItem; quantity: number }[] => {
  const items: { item: ListItem; quantity: number }[] = [];
  
  gearList.forEach(item => {
    if (item.isShared) return;
    
    const allocations = getItemAllocations(item);
    const totalAlloc = allocations.reduce((s, a) => s + a.quantity, 0);
    const unallocated = item.quantity - totalAlloc;
    
    if (unallocated > 0) {
      items.push({ item, quantity: unallocated });
    }
  });
  
  return items;
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
