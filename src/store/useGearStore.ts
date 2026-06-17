import { create } from 'zustand';
import {
  Plan,
  ListItem,
  CrewMember,
  Backpack,
  Season,
  Weather,
  CampType,
  GearItem,
  AVATAR_COLORS,
  BACKPACK_COLORS,
} from '@/types';
import { gearLibrary } from '@/data/gearData';
import { loadPlans, savePlans, loadCurrentPlanId, saveCurrentPlanId } from '@/utils/storage';

interface GearState {
  plans: Plan[];
  currentPlanId: string | null;
  checkMode: boolean;
  activeCategory: string;
  
  getCurrentPlan: () => Plan | null;
  createNewPlan: (name: string) => void;
  deletePlan: (planId: string) => void;
  switchPlan: (planId: string) => void;
  updatePlanName: (planId: string, name: string) => void;
  
  setSeason: (season: Season) => void;
  setDays: (days: number) => void;
  setWeather: (weather: Weather) => void;
  setCampType: (campType: CampType) => void;
  
  addCrewMember: (name: string, maxWeight: number) => void;
  removeCrewMember: (memberId: string) => void;
  updateCrewMember: (memberId: string, updates: Partial<CrewMember>) => void;
  
  addBackpack: (name: string, ownerId: string, maxWeight: number) => void;
  removeBackpack: (backpackId: string) => void;
  updateBackpack: (backpackId: string, updates: Partial<Backpack>) => void;
  
  addGearItem: (gearItem: GearItem, quantity?: number, carrierId?: string, backpackId?: string) => void;
  removeGearItem: (itemId: string) => void;
  updateGearQuantity: (itemId: string, quantity: number) => void;
  setGearCarrier: (itemId: string, carrierId: string | undefined) => void;
  setGearBackpack: (itemId: string, backpackId: string | undefined) => void;
  toggleGearShared: (itemId: string) => void;
  toggleKeepDuplicate: (itemId: string) => void;
  
  toggleCheckMode: () => void;
  setCheckItem: (itemId: string, checked: boolean) => void;
  resetCheckProgress: () => void;
  cleanupCheckProgress: () => void;
  
  ignoreTip: (tipId: string) => void;
  unignoreTip: (tipId: string) => void;
  
  setActiveCategory: (category: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createDefaultPlan = (name: string): Plan => {
  const defaultMember: CrewMember = {
    id: generateId(),
    name: '我',
    maxWeight: 15000,
    avatarColor: AVATAR_COLORS[0],
  };

  const defaultBackpack: Backpack = {
    id: generateId(),
    name: '主背包',
    ownerId: defaultMember.id,
    maxWeight: 15000,
    color: BACKPACK_COLORS[0],
  };

  return {
    id: generateId(),
    name,
    createdAt: Date.now(),
    destination: {
      season: 'spring',
      days: 2,
      weather: 'sunny',
      campType: 'campground',
    },
    crew: [defaultMember],
    backpacks: [defaultBackpack],
    gearList: [],
    checkProgress: {},
    ignoredTips: [],
  };
};

const migratePlan = (plan: Plan): Plan => {
  return {
    ...plan,
    backpacks: plan.backpacks || [],
    ignoredTips: plan.ignoredTips || [],
    checkProgress: plan.checkProgress || {},
    gearList: plan.gearList.map(item => ({
      ...item,
      keepDuplicate: item.keepDuplicate ?? false,
    })),
  };
};

const initializeFromStorage = (): { plans: Plan[]; currentPlanId: string | null } => {
  const savedPlans = loadPlans();
  const savedCurrentId = loadCurrentPlanId();

  if (savedPlans.length > 0) {
    const migratedPlans = savedPlans.map(migratePlan);
    const currentId = savedCurrentId && migratedPlans.some(p => p.id === savedCurrentId)
      ? savedCurrentId
      : migratedPlans[0].id;
    return { plans: migratedPlans, currentPlanId: currentId };
  }

  const defaultPlan = createDefaultPlan('周末露营');
  return { plans: [defaultPlan], currentPlanId: defaultPlan.id };
};

export const useGearStore = create<GearState>((set, get) => {
  const initial = initializeFromStorage();

  const updateCurrentPlan = (updater: (plan: Plan) => Plan) => {
    set(state => {
      const newPlans = state.plans.map(p =>
        p.id === state.currentPlanId ? updater(p) : p
      );
      savePlans(newPlans);
      return { plans: newPlans };
    });
  };

  return {
    plans: initial.plans,
    currentPlanId: initial.currentPlanId,
    checkMode: false,
    activeCategory: 'all',

    getCurrentPlan: () => {
      const { plans, currentPlanId } = get();
      return plans.find(p => p.id === currentPlanId) || null;
    },

    createNewPlan: (name: string) => {
      const newPlan = createDefaultPlan(name);
      set(state => {
        const newPlans = [...state.plans, newPlan];
        savePlans(newPlans);
        saveCurrentPlanId(newPlan.id);
        return { plans: newPlans, currentPlanId: newPlan.id, checkMode: false };
      });
    },

    deletePlan: (planId: string) => {
      set(state => {
        const newPlans = state.plans.filter(p => p.id !== planId);
        let newCurrentId = state.currentPlanId;
        
        if (state.currentPlanId === planId) {
          newCurrentId = newPlans.length > 0 ? newPlans[0].id : null;
          if (newCurrentId) {
            saveCurrentPlanId(newCurrentId);
          }
        }
        
        savePlans(newPlans);
        return { plans: newPlans, currentPlanId: newCurrentId, checkMode: false };
      });
    },

    switchPlan: (planId: string) => {
      set({ currentPlanId: planId, checkMode: false });
      saveCurrentPlanId(planId);
      setTimeout(() => get().cleanupCheckProgress(), 0);
    },

    updatePlanName: (planId: string, name: string) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === planId ? { ...p, name } : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    setSeason: (season: Season) => {
      updateCurrentPlan(plan => ({
        ...plan,
        destination: { ...plan.destination, season },
      }));
    },

    setDays: (days: number) => {
      updateCurrentPlan(plan => ({
        ...plan,
        destination: { ...plan.destination, days: Math.max(1, Math.min(30, days)) },
      }));
    },

    setWeather: (weather: Weather) => {
      updateCurrentPlan(plan => ({
        ...plan,
        destination: { ...plan.destination, weather },
      }));
    },

    setCampType: (campType: CampType) => {
      updateCurrentPlan(plan => ({
        ...plan,
        destination: { ...plan.destination, campType },
      }));
    },

    addCrewMember: (name: string, maxWeight: number) => {
      set(state => {
        const currentPlan = state.plans.find(p => p.id === state.currentPlanId);
        if (!currentPlan) return state;

        const colorIndex = currentPlan.crew.length % AVATAR_COLORS.length;
        const newMember: CrewMember = {
          id: generateId(),
          name,
          maxWeight,
          avatarColor: AVATAR_COLORS[colorIndex],
        };

        const backpackColorIndex = currentPlan.backpacks.length % BACKPACK_COLORS.length;
        const newBackpack: Backpack = {
          id: generateId(),
          name: `${name}的背包`,
          ownerId: newMember.id,
          maxWeight: maxWeight,
          color: BACKPACK_COLORS[backpackColorIndex],
        };

        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { 
                ...p, 
                crew: [...p.crew, newMember],
                backpacks: [...p.backpacks, newBackpack],
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    removeCrewMember: (memberId: string) => {
      set(state => {
        const currentPlan = state.plans.find(p => p.id === state.currentPlanId);
        if (!currentPlan || currentPlan.crew.length <= 1) return state;

        const backpackIdsToRemove = currentPlan.backpacks
          .filter(b => b.ownerId === memberId)
          .map(b => b.id);

        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                crew: p.crew.filter(m => m.id !== memberId),
                backpacks: p.backpacks.filter(b => b.ownerId !== memberId),
                gearList: p.gearList.map(item =>
                  item.carrierId === memberId
                    ? { ...item, carrierId: undefined, backpackId: undefined }
                    : backpackIdsToRemove.includes(item.backpackId || '')
                      ? { ...item, backpackId: undefined }
                      : item
                ),
                checkProgress: Object.fromEntries(
                  Object.entries(p.checkProgress).filter(([id]) => 
                    p.gearList.some(g => g.id === id)
                  )
                ),
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    updateCrewMember: (memberId: string, updates: Partial<CrewMember>) => {
      updateCurrentPlan(plan => ({
        ...plan,
        crew: plan.crew.map(m =>
          m.id === memberId ? { ...m, ...updates } : m
        ),
      }));
    },

    addBackpack: (name: string, ownerId: string, maxWeight: number) => {
      set(state => {
        const currentPlan = state.plans.find(p => p.id === state.currentPlanId);
        if (!currentPlan) return state;

        const colorIndex = currentPlan.backpacks.length % BACKPACK_COLORS.length;
        const newBackpack: Backpack = {
          id: generateId(),
          name,
          ownerId,
          maxWeight,
          color: BACKPACK_COLORS[colorIndex],
        };

        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, backpacks: [...p.backpacks, newBackpack] }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    removeBackpack: (backpackId: string) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                backpacks: p.backpacks.filter(b => b.id !== backpackId),
                gearList: p.gearList.map(item =>
                  item.backpackId === backpackId
                    ? { ...item, backpackId: undefined }
                    : item
                ),
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    updateBackpack: (backpackId: string, updates: Partial<Backpack>) => {
      updateCurrentPlan(plan => ({
        ...plan,
        backpacks: plan.backpacks.map(b =>
          b.id === backpackId ? { ...b, ...updates } : b
        ),
      }));
    },

    addGearItem: (gearItem: GearItem, quantity: number = 1, carrierId?: string, backpackId?: string) => {
      set(state => {
        const currentPlan = state.plans.find(p => p.id === state.currentPlanId);
        if (!currentPlan) return state;

        const existingItem = currentPlan.gearList.find(i => i.id === gearItem.id);
        let newGearList: ListItem[];

        if (existingItem) {
          newGearList = currentPlan.gearList.map(i =>
            i.id === gearItem.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          const newItem: ListItem = {
            ...gearItem,
            quantity,
            carrierId,
            backpackId,
            keepDuplicate: false,
          };
          newGearList = [...currentPlan.gearList, newItem];
        }

        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, gearList: newGearList }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    removeGearItem: (itemId: string) => {
      set(state => {
        const newPlans = state.plans.map(p => {
          if (p.id !== state.currentPlanId) return p;
          
          const newCheckProgress = { ...p.checkProgress };
          delete newCheckProgress[itemId];
          
          return {
            ...p,
            gearList: p.gearList.filter(i => i.id !== itemId),
            checkProgress: newCheckProgress,
          };
        });
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    updateGearQuantity: (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        get().removeGearItem(itemId);
        return;
      }
      updateCurrentPlan(plan => ({
        ...plan,
        gearList: plan.gearList.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      }));
    },

    setGearCarrier: (itemId: string, carrierId: string | undefined) => {
      updateCurrentPlan(plan => ({
        ...plan,
        gearList: plan.gearList.map(i =>
          i.id === itemId ? { ...i, carrierId } : i
        ),
      }));
    },

    setGearBackpack: (itemId: string, backpackId: string | undefined) => {
      updateCurrentPlan(plan => ({
        ...plan,
        gearList: plan.gearList.map(i =>
          i.id === itemId ? { ...i, backpackId } : i
        ),
      }));
    },

    toggleGearShared: (itemId: string) => {
      updateCurrentPlan(plan => ({
        ...plan,
        gearList: plan.gearList.map(i =>
          i.id === itemId
            ? { 
                ...i, 
                isShared: !i.isShared, 
                carrierId: !i.isShared ? undefined : i.carrierId,
                backpackId: !i.isShared ? undefined : i.backpackId,
              }
            : i
        ),
      }));
    },

    toggleKeepDuplicate: (itemId: string) => {
      updateCurrentPlan(plan => ({
        ...plan,
        gearList: plan.gearList.map(i =>
          i.id === itemId ? { ...i, keepDuplicate: !i.keepDuplicate } : i
        ),
      }));
    },

    toggleCheckMode: () => {
      set(state => ({ checkMode: !state.checkMode }));
    },

    setCheckItem: (itemId: string, checked: boolean) => {
      updateCurrentPlan(plan => ({
        ...plan,
        checkProgress: { ...plan.checkProgress, [itemId]: checked },
      }));
    },

    resetCheckProgress: () => {
      updateCurrentPlan(plan => ({
        ...plan,
        checkProgress: {},
      }));
    },

    cleanupCheckProgress: () => {
      const plan = get().getCurrentPlan();
      if (!plan) return;
      
      const validItemIds = new Set(plan.gearList.map(i => i.id));
      const cleanedProgress: Record<string, boolean> = {};
      
      Object.entries(plan.checkProgress).forEach(([id, checked]) => {
        if (validItemIds.has(id)) {
          cleanedProgress[id] = checked;
        }
      });
      
      updateCurrentPlan(p => ({
        ...p,
        checkProgress: cleanedProgress,
      }));
    },

    ignoreTip: (tipId: string) => {
      updateCurrentPlan(plan => ({
        ...plan,
        ignoredTips: [...plan.ignoredTips, tipId],
      }));
    },

    unignoreTip: (tipId: string) => {
      updateCurrentPlan(plan => ({
        ...plan,
        ignoredTips: plan.ignoredTips.filter(id => id !== tipId),
      }));
    },

    setActiveCategory: (category: string) => {
      set({ activeCategory: category });
    },
  };
});

export { gearLibrary };
