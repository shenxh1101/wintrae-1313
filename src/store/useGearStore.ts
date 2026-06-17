import { create } from 'zustand';
import {
  Plan,
  ListItem,
  CrewMember,
  Season,
  Weather,
  CampType,
  GearItem,
  AVATAR_COLORS,
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
  
  addGearItem: (gearItem: GearItem, quantity?: number, carrierId?: string) => void;
  removeGearItem: (itemId: string) => void;
  updateGearQuantity: (itemId: string, quantity: number) => void;
  setGearCarrier: (itemId: string, carrierId: string | undefined) => void;
  toggleGearShared: (itemId: string) => void;
  
  toggleCheckMode: () => void;
  setCheckItem: (itemId: string, checked: boolean) => void;
  resetCheckProgress: () => void;
  
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
    gearList: [],
    checkProgress: {},
  };
};

const initializeFromStorage = (): { plans: Plan[]; currentPlanId: string | null } => {
  const savedPlans = loadPlans();
  const savedCurrentId = loadCurrentPlanId();

  if (savedPlans.length > 0) {
    const currentId = savedCurrentId && savedPlans.some(p => p.id === savedCurrentId)
      ? savedCurrentId
      : savedPlans[0].id;
    return { plans: savedPlans, currentPlanId: currentId };
  }

  const defaultPlan = createDefaultPlan('周末露营');
  return { plans: [defaultPlan], currentPlanId: defaultPlan.id };
};

export const useGearStore = create<GearState>((set, get) => {
  const initial = initializeFromStorage();

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
        return { plans: newPlans, currentPlanId: newPlan.id };
      });
    },

    deletePlan: (planId: string) => {
      set(state => {
        const newPlans = state.plans.filter(p => p.id !== planId);
        let newCurrentId = state.currentPlanId;
        
        if (state.currentPlanId === planId) {
          newCurrentId = newPlans.length > 0 ? newPlans[0].id : null;
        }
        
        savePlans(newPlans);
        if (newCurrentId) {
          saveCurrentPlanId(newCurrentId);
        }
        
        return { plans: newPlans, currentPlanId: newCurrentId };
      });
    },

    switchPlan: (planId: string) => {
      set({ currentPlanId: planId, checkMode: false });
      saveCurrentPlanId(planId);
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
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, destination: { ...p.destination, season } }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    setDays: (days: number) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, destination: { ...p.destination, days: Math.max(1, Math.min(30, days)) } }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    setWeather: (weather: Weather) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, destination: { ...p.destination, weather } }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    setCampType: (campType: CampType) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, destination: { ...p.destination, campType } }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
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

        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, crew: [...p.crew, newMember] }
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

        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                crew: p.crew.filter(m => m.id !== memberId),
                gearList: p.gearList.map(item =>
                  item.carrierId === memberId
                    ? { ...item, carrierId: undefined }
                    : item
                ),
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    updateCrewMember: (memberId: string, updates: Partial<CrewMember>) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                crew: p.crew.map(m =>
                  m.id === memberId ? { ...m, ...updates } : m
                ),
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    addGearItem: (gearItem: GearItem, quantity: number = 1, carrierId?: string) => {
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
            checked: false,
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
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, gearList: p.gearList.filter(i => i.id !== itemId) }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    updateGearQuantity: (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        get().removeGearItem(itemId);
        return;
      }
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                gearList: p.gearList.map(i =>
                  i.id === itemId ? { ...i, quantity } : i
                ),
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    setGearCarrier: (itemId: string, carrierId: string | undefined) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                gearList: p.gearList.map(i =>
                  i.id === itemId ? { ...i, carrierId } : i
                ),
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    toggleGearShared: (itemId: string) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                gearList: p.gearList.map(i =>
                  i.id === itemId
                    ? { ...i, isShared: !i.isShared, carrierId: !i.isShared ? undefined : i.carrierId }
                    : i
                ),
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    toggleCheckMode: () => {
      set(state => ({ checkMode: !state.checkMode }));
    },

    setCheckItem: (itemId: string, checked: boolean) => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? {
                ...p,
                checkProgress: { ...p.checkProgress, [itemId]: checked },
              }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    resetCheckProgress: () => {
      set(state => {
        const newPlans = state.plans.map(p =>
          p.id === state.currentPlanId
            ? { ...p, checkProgress: {} }
            : p
        );
        savePlans(newPlans);
        return { plans: newPlans };
      });
    },

    setActiveCategory: (category: string) => {
      set({ activeCategory: category });
    },
  };
});

export { gearLibrary };
