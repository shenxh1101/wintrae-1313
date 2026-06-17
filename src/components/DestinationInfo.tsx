import { Sun, CloudRain, Snowflake, Mountain, Waves, Home, Shield } from 'lucide-react';
import { useGearStore } from '@/store/useGearStore';
import { Season, Weather, CampType, SEASON_LABELS, WEATHER_LABELS, CAMPTYPE_LABELS } from '@/types';

const seasonIcons: Record<Season, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

const weatherIcons = {
  sunny: <Sun className="w-4 h-4" />,
  rainy: <CloudRain className="w-4 h-4" />,
  snowy: <Snowflake className="w-4 h-4" />,
};

const campTypeIcons = {
  mountain: <Mountain className="w-4 h-4" />,
  lake: <Waves className="w-4 h-4" />,
  campground: <Home className="w-4 h-4" />,
  desert: <Shield className="w-4 h-4" />,
};

const DestinationInfo = () => {
  const plan = useGearStore(state => state.getCurrentPlan());
  const setSeason = useGearStore(state => state.setSeason);
  const setDays = useGearStore(state => state.setDays);
  const setWeather = useGearStore(state => state.setWeather);
  const setCampType = useGearStore(state => state.setCampType);

  if (!plan) return null;

  const { destination } = plan;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
      <h2 className="text-lg font-bold text-forest-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">📍</span>
        目的地信息
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 季节选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-earth-700">季节</label>
          <div className="relative">
            <select
              value={destination.season}
              onChange={(e) => setSeason(e.target.value as Season)}
              className="w-full appearance-none bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 pr-10 text-forest-800 font-medium focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all cursor-pointer"
            >
              {(Object.keys(SEASON_LABELS) as Season[]).map(season => (
                <option key={season} value={season}>
                  {seasonIcons[season]} {SEASON_LABELS[season]}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-earth-500">
              ▼
            </div>
          </div>
        </div>

        {/* 天数选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-earth-700">天数</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDays(destination.days - 1)}
              className="w-10 h-10 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-700 font-bold transition-colors flex items-center justify-center"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-forest-800">{destination.days}</span>
              <span className="text-sm text-earth-500 ml-1">天</span>
            </div>
            <button
              onClick={() => setDays(destination.days + 1)}
              className="w-10 h-10 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-700 font-bold transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* 天气选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-earth-700">天气</label>
          <div className="flex gap-1 p-1 bg-cream-100 rounded-xl">
            {(Object.keys(WEATHER_LABELS) as Weather[]).map(weather => (
              <button
                key={weather}
                onClick={() => setWeather(weather)}
                className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  destination.weather === weather
                    ? 'bg-white text-forest-700 shadow-sm'
                    : 'text-earth-600 hover:text-earth-800'
                }`}
              >
                {weatherIcons[weather]}
                <span className="hidden sm:inline">{WEATHER_LABELS[weather]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 营地类型 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-earth-700">营地类型</label>
          <div className="relative">
            <select
              value={destination.campType}
              onChange={(e) => setCampType(e.target.value as CampType)}
              className="w-full appearance-none bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 pr-10 text-forest-800 font-medium focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all cursor-pointer"
            >
              {(Object.keys(CAMPTYPE_LABELS) as CampType[]).map(type => (
                <option key={type} value={type}>
                  {CAMPTYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-earth-500">
              ▼
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationInfo;
