import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ForecastData } from '../services/api';

interface ForecastListProps {
  groupedData: Record<string, ForecastData[]>;
  loading: boolean;
}

const ForecastList: React.FC<ForecastListProps> = ({ groupedData, loading }) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const dates = Object.keys(groupedData).sort(); // Ensure dates are in order

  // Reset to the first day when new data is loaded
  useEffect(() => {
    setSelectedDateIndex(0);
  }, [groupedData]);

  if (loading || dates.length === 0) return null;

  const currentKey = dates[selectedDateIndex];
  const currentData = groupedData[currentKey];

  const handlePrev = () => {
    if (selectedDateIndex > 0) setSelectedDateIndex(selectedDateIndex - 1);
  };

  const handleNext = () => {
    if (selectedDateIndex < dates.length - 1) setSelectedDateIndex(selectedDateIndex + 1);
  };

  // Format date display (e.g., 2023-10-25 -> 10월 25일)
  const [, month, day] = currentKey.split('-');
  const displayDate = `${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;

  return (
    <div className="glass-panel animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <button 
          onClick={handlePrev} 
          disabled={selectedDateIndex === 0}
          style={{...styles.navBtn, opacity: selectedDateIndex === 0 ? 0.3 : 1, cursor: selectedDateIndex === 0 ? 'default' : 'pointer'}}
        >
          <ChevronLeft size={24} color="white" />
        </button>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <h3 style={styles.title}>{displayDate} 날씨 예보</h3>
          {selectedDateIndex > 0 && (
            <button 
              onClick={() => setSelectedDateIndex(0)}
              style={styles.todayBtn}
              title="오늘 날짜로 돌아가기"
            >
              오늘로
            </button>
          )}
        </div>

        <button 
          onClick={handleNext} 
          disabled={selectedDateIndex === dates.length - 1}
          style={{...styles.navBtn, opacity: selectedDateIndex === dates.length - 1 ? 0.3 : 1, cursor: selectedDateIndex === dates.length - 1 ? 'default' : 'pointer'}}
        >
          <ChevronRight size={24} color="white" />
        </button>
      </div>

      <div style={styles.listContainer}>
        {currentData.map((item, index) => (
          <div key={index} style={styles.forecastItem}>
            <p style={styles.time}>{item.time}</p>
            <img 
              src={`https://openweathermap.org/img/wn/${item.icon}.png`} 
              alt="weather icon" 
              style={styles.icon}
            />
            <p style={styles.temp}>{item.temp}°</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    opacity: 0.9,
    color: 'white',
    margin: 0,
  },
  todayBtn: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'white',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  navBtn: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s',
  },
  listContainer: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto' as const,
    paddingBottom: '0.5rem',
    /* Hide scrollbar for Chrome, Safari and Opera */
    msOverflowStyle: 'none' as any,  /* IE and Edge */
    scrollbarWidth: 'none' as const,  /* Firefox */
  },
  forecastItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: '60px',
    padding: '0.5rem',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.1)',
    transition: 'background 0.3s ease',
  },
  time: {
    fontSize: '0.85rem',
    opacity: 0.8,
    marginBottom: '0.5rem',
    whiteSpace: 'nowrap' as const,
    color: 'white',
  },
  icon: {
    width: '40px',
    height: '40px',
    marginBottom: '0.5rem',
  },
  temp: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'white',
  }
};

export default ForecastList;
