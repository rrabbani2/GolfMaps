'use client';

import { useEffect, useState } from 'react';
import { Course, Profile, WeatherData, BusynessScore } from '@/lib/types';
import LoadingSpinner from './LoadingSpinner';
import GroupModal from './GroupModal';
import { useFavorites } from '@/hooks/useFavorites';
import styles from '@/styles/course-card.module.scss';

interface CourseCardProps {
  course: Course;
  profile?: Profile;
}

export default function CourseCard({ course, profile }: CourseCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [busyness, setBusyness] = useState<BusynessScore | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingBusyness, setLoadingBusyness] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const favorite = isFavorite(course.id);
  
  // Debug logging
  useEffect(() => {
    if (busyness) {
      console.log('[CourseCard] Busyness state:', busyness);
    }
  }, [busyness]);

  useEffect(() => {
    // Fetch weather
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const response = await fetch(`/api/weather?courseId=${course.id}`);
        if (response.ok) {
          const data = await response.json();
          setWeather(data);
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoadingWeather(false);
      }
    };

    // Fetch busyness
    const fetchBusyness = async () => {
      setLoadingBusyness(true);
      try {
        const response = await fetch(`/api/busyness?courseId=${course.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('[CourseCard] Busyness data received:', data);
          setBusyness(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('[CourseCard] Busyness API error:', response.status, errorData);
        }
      } catch (error) {
        console.error('[CourseCard] Failed to fetch busyness:', error);
      } finally {
        setLoadingBusyness(false);
      }
    };

    fetchWeather();
    fetchBusyness();
  }, [course.id]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>{course.name}</h2>
          <button
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(course.id);
            }}
            className={`${styles.favoriteButton} ${favorite ? styles.favoriteButtonActive : ''}`}
          >
            {favorite ? '❤️' : '🤍'}
          </button>
        </div>
        {course.image_url && (
          <img
            src={course.image_url}
            alt={course.name}
            className={styles.image}
          />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Location</h3>
          <p className={styles.text}>
            {course.address && <>{course.address}<br /></>}
            {course.city && course.state && (
              <>{course.city}, {course.state}</>
            )}
          </p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Course Stats</h3>
          <div className={styles.statsGrid}>
            {course.yardage && (
              <div>
                <span className={styles.statLabel}>Yardage:</span>
                <span className={styles.statValue}>{course.yardage.toLocaleString()}</span>
              </div>
            )}
            {course.slope_rating && (
              <div>
                <span className={styles.statLabel}>Slope:</span>
                <span className={styles.statValue}>{course.slope_rating}</span>
              </div>
            )}
            {course.course_rating && (
              <div>
                <span className={styles.statLabel}>Rating:</span>
                <span className={styles.statValue}>{course.course_rating}</span>
              </div>
            )}
          </div>
          {course.fitScore != null && (
            <div className={styles.fitScoreContainer}>
              <div className={styles.fitScoreLabel}>Course Fit Score:</div>
              <div 
                className={styles.fitScoreValue}
                style={{
                  color: course.fitScore >= 70 ? '#10b981' : course.fitScore >= 40 ? '#f59e0b' : '#ef4444'
                }}
              >
                {course.fitScore}/100
              </div>
            </div>
          )}
          {loadingBusyness ? (
            <div className={styles.fitScoreContainer}>
              <div className={styles.fitScoreLabel}>Busyness Score:</div>
              <LoadingSpinner />
            </div>
          ) : busyness ? (
            <div className={styles.fitScoreContainer}>
              <div className={styles.fitScoreLabel}>Busyness Score:</div>
              <div 
                className={styles.fitScoreValue}
                style={{
                  color: busyness.score >= 75 ? '#ef4444' : busyness.score >= 50 ? '#f59e0b' : busyness.score >= 25 ? '#fbbf24' : '#10b981'
                }}
              >
                {busyness.score}/100
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Weather</h3>
          {loadingWeather ? (
            <LoadingSpinner />
          ) : weather ? (
            <div className={styles.weather}>
              <div className={styles.weatherMain}>
                <span className={styles.temperature}>{weather.temperature}°F</span>
                {weather.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className={styles.weatherIcon}
                  />
                )}
              </div>
              <p className={styles.weatherDesc}>{weather.description}</p>
              <p className={styles.weatherWind}>Wind: {weather.windSpeed} mph</p>
              {weather.conditionScore != null && (
                <div className={styles.conditionScoreContainer}>
                  <div className={styles.conditionScoreLabel}>Course Condition:</div>
                  <div
                    className={styles.conditionScoreValue}
                    style={{
                      color: weather.conditionScore >= 70 ? '#10b981' : weather.conditionScore >= 40 ? '#f59e0b' : '#ef4444'
                    }}
                    title="Based on current weather conditions (rain, wind, temperature)"
                  >
                    {weather.conditionScore}/100
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className={styles.text}>Weather data unavailable</p>
          )}
        </div>

        <div className={styles.section}>
          <button
            onClick={() => setShowGroupModal(true)}
            className={styles.groupButton}
          >
            Play with Others (Groups)
          </button>
        </div>
      </div>

      <GroupModal
        course={course}
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />
    </div>
  );
}

