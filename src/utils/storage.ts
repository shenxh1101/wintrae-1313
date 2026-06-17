import { Plan } from '@/types';

const STORAGE_KEY = 'camping-gear-planner-plans';
const CURRENT_PLAN_KEY = 'camping-gear-planner-current';

export const savePlans = (plans: Plan[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('保存方案失败:', e);
  }
};

export const loadPlans = (): Plan[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('加载方案失败:', e);
    return [];
  }
};

export const saveCurrentPlanId = (planId: string) => {
  try {
    localStorage.setItem(CURRENT_PLAN_KEY, planId);
  } catch (e) {
    console.error('保存当前方案ID失败:', e);
  }
};

export const loadCurrentPlanId = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_PLAN_KEY);
  } catch (e) {
    console.error('加载当前方案ID失败:', e);
    return null;
  }
};
