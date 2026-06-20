import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import ForecastList from './components/ForecastList';
import MapComponent from './components/MapComponent';
import { fetchWeatherByCity, fetchForecastByCity, fetchWeatherByCoords, fetchForecastByCoords } from './services/api';
import type { WeatherData, ForecastData } from './services/api';

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<Record<string, ForecastData[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherData = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, forecastData] = await Promise.all([
        fetchWeatherByCity(city),
        fetchForecastByCity(city)
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherDataByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, forecastData] = await Promise.all([
        fetchWeatherByCoords(lat, lon),
        fetchForecastByCoords(lat, lon)
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err: any) {
      setError(err.message || '지도 위치의 날씨를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load with default city
    loadWeatherData('Seoul');
  }, []);

  // Change background based on weather condition
  useEffect(() => {
    if (weather) {
      const condition = weather.condition.toLowerCase();
      let gradientVar = 'var(--bg-gradient-clear)';
      
      if (condition === 'night') gradientVar = 'var(--bg-gradient-night)';
      else if (condition === 'clouds' || condition === 'mist') gradientVar = 'var(--bg-gradient-clouds)';
      else if (condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') gradientVar = 'var(--bg-gradient-rain)';
      else if (condition === 'snow') gradientVar = 'var(--bg-gradient-snow)';
      
      document.body.style.background = gradientVar;
    }
  }, [weather]);

  return (
    <div className="app-container">
      <SearchBar onSearch={loadWeatherData} />
      
      {error && (
        <div style={styles.errorContainer}>
          <p>{error}</p>
        </div>
      )}

      {weather && !error && (
        <>
          <WeatherCard data={weather} loading={loading} />
          <MapComponent key={`${weather.lat}-${weather.lon}-${Date.now()}`} lat={weather.lat} lon={weather.lon} city={weather.city} onMapClick={loadWeatherDataByCoords} />
          <ForecastList groupedData={forecast} loading={loading} />
        </>
      )}
    </div>
  );
}

const styles = {
  errorContainer: {
    background: 'rgba(255, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    borderRadius: '16px',
    padding: '1rem 2rem',
    color: 'white',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  }
};

export default App;
