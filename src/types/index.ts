export type GearCategory = 'tent' | 'cooking' | 'lighting' | 'firstaid' | 'clothing' | 'food' | 'other';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'sunny' | 'rainy' | 'snowy';
export type CampType = 'mountain' | 'lake' | 'campground' | 'desert';
export type TipType = 'warning' | 'info' | 'success' | 'error';
export type ConsumableType = 'water' | 'food' | 'fuel' | 'clothing' | 'other';

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  weight: number;
  isShared: boolean;
  isConsumable: boolean;
  consumableType?: ConsumableType;
  description?: string;
  recommendedPerDay?: number;
  recommendedPerPersonPerDay?: number;
}

export interface ItemAllocation {
  backpackId: string;
  quantity: number;
}

export interface ListItem extends GearItem {
  quantity: number;
  carrierId?: string;
  backpackId?: string;
  checked?: boolean;
  keepDuplicate?: boolean;
  allocations?: ItemAllocation[];
}

export interface CrewMember {
  id: string;
  name: string;
  maxWeight: number;
  avatarColor: string;
}

export interface Backpack {
  id: string;
  name: string;
  ownerId: string;
  maxWeight: number;
  color: string;
}

export interface Plan {
  id: string;
  name: string;
  createdAt: number;
  destination: {
    season: Season;
    days: number;
    weather: Weather;
    campType: CampType;
  };
  crew: CrewMember[];
  backpacks: Backpack[];
  gearList: ListItem[];
  checkProgress: Record<string, boolean>;
  ignoredTips: string[];
}

export interface SmartTip {
  id: string;
  type: TipType;
  title: string;
  description: string;
  category?: string;
  dismissible?: boolean;
}

export interface WeightBreakdown {
  total: number;
  perPerson: number;
  byCategory: Record<GearCategory, number>;
  byPerson: Record<string, number>;
  byBackpack: Record<string, number>;
  unassigned: number;
}

export interface ConsumableEstimate {
  itemId: string;
  itemName: string;
  category: GearCategory;
  currentQty: number;
  recommendedQty: number;
  diff: number;
  unitWeight: number;
  isShared: boolean;
  perPersonPerDay?: number;
  perDay?: number;
  consumableType?: ConsumableType;
  inList: boolean;
}

export interface DuplicateItem {
  category: GearCategory;
  itemName: string;
  count: number;
  totalCount: number;
  itemIds: string[];
  isSharedMixed: boolean;
  shouldWarn: boolean;
  reason?: string;
  distinctCarriers: number;
}

export const CATEGORY_LABELS: Record<GearCategory, string> = {
  tent: '帐篷与住宿',
  cooking: '炊具与餐具',
  lighting: '照明设备',
  firstaid: '急救与医药',
  clothing: '衣物装备',
  food: '食品与水',
  other: '其他装备',
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
};

export const WEATHER_LABELS: Record<Weather, string> = {
  sunny: '晴朗',
  rainy: '雨天',
  snowy: '雪天',
};

export const CAMPTYPE_LABELS: Record<CampType, string> = {
  mountain: '山野营地',
  lake: '湖边营地',
  campground: '成熟营地',
  desert: '沙漠营地',
};

export const CATEGORY_COLORS: Record<GearCategory, string> = {
  tent: '#417c2c',
  cooking: '#E67E22',
  lighting: '#F1C40F',
  firstaid: '#C0392B',
  clothing: '#2980B9',
  food: '#8E44AD',
  other: '#7F8C8D',
};

export const AVATAR_COLORS = [
  '#417c2c',
  '#E67E22',
  '#2980B9',
  '#8E44AD',
  '#C0392B',
  '#16A085',
  '#F39C12',
  '#2C3E50',
];

export const BACKPACK_COLORS = [
  '#417c2c',
  '#E67E22',
  '#2980B9',
  '#8E44AD',
  '#C0392B',
  '#16A085',
  '#7F8C8D',
  '#F39C12',
];

export const CONSUMABLE_TYPE_LABELS: Record<ConsumableType, string> = {
  water: '饮用水',
  food: '食品',
  fuel: '燃料',
  clothing: '衣物',
  other: '其他',
};
