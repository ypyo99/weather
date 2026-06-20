import React from 'react';
import { Droplets, Wind, Thermometer, Sun, Moon } from 'lucide-react';
import type { WeatherData } from '../services/api';

interface WeatherCardProps {
  data: WeatherData;
  loading: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel" style={{...styles.card, ...styles.loading}}>
        <div style={styles.spinner}></div>
        <p>날씨 정보를 불러오는 중...</p>
      </div>
    );
  }

  // City's current local time
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityLocalTime = new Date(utc + data.timezone * 1000);

  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(cityLocalTime);

  const formattedTime = new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(cityLocalTime);

  const isNight = data.icon.includes('n');

  const getBackgroundImage = () => {
    if (data.condition === 'Clouds' || data.condition === 'Mist') {
      return `url('/cloudy_sky_bg.png')`;
    }
    if (['Rain', 'Drizzle', 'Thunderstorm'].includes(data.condition)) {
      return `url('/rainy_sky_bg.png')`;
    }
    // Default day background for Clear, Snow (or we can add snowy later)
    return `url('/day_sky_bg.png')`;
  };

  const cardStyle = {
    ...styles.card,
    ...(!isNight ? {
      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5)), ${getBackgroundImage()}`,
      backgroundSize: '200% 200%',
      border: 'none',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      textShadow: '0 2px 5px rgba(0,0,0,0.3)',
      animation: 'fadeIn 0.6s ease forwards, flowBackground 60s linear infinite',
    } : {})
  };

  return (
    <div className={!isNight ? "glass-panel" : "glass-panel animate-fade-in"} style={cardStyle}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.city}>
            {data.city}, {data.country}
            <img 
              src={`https://flagcdn.com/w40/${data.country.toLowerCase()}.png`} 
              alt={`${data.country} flag`}
              style={styles.flag}
            />
          </h2>
          <div style={styles.dateContainer}>
            <p style={styles.date}>{formattedDate} · {formattedTime}</p>
            <div style={{...styles.dayNightBadge, background: isNight ? 'rgba(0,0,0,0.4)' : 'rgba(255,215,0,0.3)'}}>
              {isNight ? <Moon size={14} color="#8ab4f8" /> : <Sun size={14} color="#FFD700" />}
              <span style={{marginLeft: '4px', color: isNight ? '#8ab4f8' : '#FFD700'}}>{isNight ? '밤' : '낮'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainInfo}>
        <img 
          src={`https://openweathermap.org/img/wn/${data.icon}@4x.png`} 
          alt={data.description} 
          style={styles.icon}
        />
        <div style={styles.tempContainer}>
          <h1 style={styles.temp}>{data.temp}°</h1>
          <p style={styles.description}>{data.description}</p>
        </div>
      </div>

      <div style={styles.details}>
        <div style={styles.detailItem}>
          <Thermometer size={24} style={styles.detailIcon} />
          <p style={styles.detailLabel}>체감 온도</p>
          <p style={styles.detailValue}>{data.feels_like}°</p>
        </div>
        <div style={styles.divider}></div>
        <div style={styles.detailItem}>
          <Droplets size={24} style={styles.detailIcon} />
          <p style={styles.detailLabel}>습도</p>
          <p style={styles.detailValue}>{data.humidity}%</p>
        </div>
        <div style={styles.divider}></div>
        <div style={styles.detailItem}>
          <Wind size={24} style={styles.detailIcon} />
          <p style={styles.detailLabel}>풍속</p>
          <p style={styles.detailValue}>{data.wind_speed} m/s</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 2rem',
    color: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  city: {
    fontSize: '2rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
  },
  flag: {
    marginLeft: '12px',
    borderRadius: '4px',
    height: '24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  dateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '0.25rem',
  },
  date: {
    fontSize: '1rem',
    opacity: 0.9,
  },
  dayNightBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 600,
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  mainInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  icon: {
    width: '120px',
    height: '120px',
    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
    animation: 'float 3s ease-in-out infinite',
  },
  tempContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  temp: {
    fontSize: '5rem',
    fontWeight: 700,
    lineHeight: 1,
    textShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  description: {
    fontSize: '1.25rem',
    textTransform: 'capitalize' as const,
    marginTop: '0.5rem',
    fontWeight: 500,
  },
  details: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
  },
  detailIcon: {
    opacity: 0.8,
  },
  detailLabel: {
    fontSize: '0.875rem',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: '1.125rem',
    fontWeight: 600,
  },
  divider: {
    width: '1px',
    background: 'rgba(255,255,255,0.2)',
  }
};

export default WeatherCard;
