import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  condition: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle' | 'Mist' | 'Night';
  timestamp: number;
  lat: number;
  lon: number;
  timezone: number;
}

export interface ForecastData {
  time: string;
  temp: number;
  icon: string;
}

const mapCondition = (main: string, iconId: string): WeatherData['condition'] => {
  if (iconId.includes('n')) return 'Night'; // Night time
  switch (main) {
    case 'Clear': return 'Clear';
    case 'Clouds': return 'Clouds';
    case 'Rain': return 'Rain';
    case 'Snow': return 'Snow';
    case 'Thunderstorm': return 'Thunderstorm';
    case 'Drizzle': return 'Drizzle';
    default: return 'Mist';
  }
}

export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return getMockData(city);
  }

  try {
    // 1. Geocode city name
    const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
    if (geoResponse.data.length === 0) {
      throw new Error('해당 도시를 찾을 수 없습니다. 도시 이름을 다시 확인해 주세요.');
    }
    const { lat, lon, name, local_names } = geoResponse.data[0];
    const koreanName = local_names?.ko || name;

    // 2. Fetch weather by coordinates
    const weatherData = await fetchWeatherByCoords(lat, lon);
    
    // Override city name with Korean name
    return {
      ...weatherData,
      city: koreanName
    };
  } catch (error: any) {
    console.error("Error fetching weather data:", error);
    if (error.response?.status === 401) {
      console.warn('API 키가 아직 활성화되지 않았습니다. 임시 데이터를 반환합니다.');
      return getMockData(city);
    }
    if (error.response?.status === 404 || error.message.includes('해당 도시를')) {
      throw new Error('해당 도시를 찾을 수 없습니다. 도시 이름을 확인해 주세요.');
    }
    throw new Error('날씨 정보를 불러오는데 실패했습니다.');
  }
};

export const fetchForecastByCity = async (city: string): Promise<Record<string, ForecastData[]>> => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return getMockForecast();
  }

  try {
    // 1. Geocode city name
    const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
    if (geoResponse.data.length === 0) {
      throw new Error('해당 도시를 찾을 수 없습니다.');
    }
    const { lat, lon } = geoResponse.data[0];

    // 2. Fetch forecast by coordinates
    return await fetchForecastByCoords(lat, lon);
  } catch (error: any) {
    console.error("Error fetching forecast data:", error);
    if (error.response?.status === 401) {
      console.warn('API 키가 아직 활성화되지 않았습니다. 임시 데이터를 반환합니다.');
      return getMockForecast();
    }
    if (error.response?.status === 404 || error.message.includes('해당 도시를')) {
      throw new Error('해당 도시를 찾을 수 없습니다. 도시 이름을 확인해 주세요.');
    }
    throw new Error('예보 정보를 불러오는데 실패했습니다.');
  }
};

export const fetchWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData> => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return getMockData('선택된 지역');
  }

  try {
    const response = await axios.get(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=kr`);
    const data = response.data;
    
    // Try reverse geocoding to get Korean city name
    let cityName = data.name;
    try {
      const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
      if (geoResponse.data.length > 0) {
        cityName = geoResponse.data[0].local_names?.ko || geoResponse.data[0].name || cityName;
      }
    } catch (e) {
      // Ignore geocoding errors
    }
    
    return {
      city: cityName || '알 수 없는 지역',
      country: data.sys.country || '알 수 없음',
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      condition: mapCondition(data.weather[0].main, data.weather[0].icon),
      timestamp: data.dt,
      lat: data.coord.lat,
      lon: data.coord.lon,
      timezone: data.timezone,
    };
  } catch (error: any) {
    console.error("Error fetching weather data by coords:", error);
    if (error.response?.status === 401) {
      console.warn('API 키가 아직 활성화되지 않았습니다. 임시 데이터를 반환합니다.');
      return getMockData('선택된 지역');
    }
    throw new Error('좌표로 날씨 정보를 불러오는데 실패했습니다.');
  }
};

export const fetchForecastByCoords = async (lat: number, lon: number): Promise<Record<string, ForecastData[]>> => {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return getMockForecast();
  }

  try {
    const response = await axios.get(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=kr`);
    const data = response.data;
    
    const groupedForecast: Record<string, ForecastData[]> = {};

    data.list.forEach((item: any) => {
      // Calculate local time for grouping using city timezone
      const utc = item.dt * 1000 + new Date().getTimezoneOffset() * 60000;
      const localDate = new Date(utc + data.city.timezone * 1000);
      
      const dateKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      const hours = localDate.getHours();
      const timeString = `${hours >= 12 ? '오후' : '오전'} ${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours}시`;
      
      if (!groupedForecast[dateKey]) {
        groupedForecast[dateKey] = [];
      }
      
      groupedForecast[dateKey].push({
        time: timeString,
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon
      });
    });

    return groupedForecast;
  } catch (error: any) {
    console.error("Error fetching forecast data by coords:", error);
    if (error.response?.status === 401) {
      console.warn('API 키가 아직 활성화되지 않았습니다. 임시 예보 데이터를 반환합니다.');
      return getMockForecast();
    }
    throw new Error('좌표로 예보 정보를 불러오는데 실패했습니다.');
  }
}

// Mock data for development when API key is not provided
const getMockData = (city: string): WeatherData => {
  return {
    city: city || '서울',
    country: 'KR',
    temp: 24,
    feels_like: 26,
    humidity: 60,
    wind_speed: 3.5,
    description: '약간 흐림',
    icon: '02d',
    condition: 'Clouds',
    timestamp: Date.now() / 1000,
    lat: 37.5665,
    lon: 126.9780,
    timezone: 32400
  };
}

const getMockForecast = (): Record<string, ForecastData[]> => {
  const today = new Date();
  const tmrw = new Date(today.getTime() + 86400000);
  const day3 = new Date(today.getTime() + 86400000 * 2);

  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return {
    [formatDate(today)]: [
      { time: '오후 3시', temp: 25, icon: '02d' },
      { time: '오후 6시', temp: 23, icon: '03d' },
      { time: '오후 9시', temp: 20, icon: '04n' },
    ],
    [formatDate(tmrw)]: [
      { time: '오전 12시', temp: 18, icon: '10n' },
      { time: '오전 3시', temp: 17, icon: '10n' },
      { time: '오전 6시', temp: 17, icon: '01d' },
      { time: '오전 9시', temp: 21, icon: '01d' },
      { time: '오후 12시', temp: 24, icon: '01d' },
      { time: '오후 3시', temp: 26, icon: '01d' },
      { time: '오후 6시', temp: 24, icon: '02d' },
      { time: '오후 9시', temp: 22, icon: '03n' },
    ],
    [formatDate(day3)]: [
      { time: '오전 12시', temp: 20, icon: '04n' },
      { time: '오전 3시', temp: 19, icon: '04n' },
      { time: '오전 6시', temp: 19, icon: '04d' },
      { time: '오전 9시', temp: 22, icon: '04d' },
      { time: '오후 12시', temp: 25, icon: '10d' },
    ]
  };
}
