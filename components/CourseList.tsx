'use client';

import { useState } from 'react';
import { Course } from '@/lib/types';
import { useFavorites } from '@/hooks/useFavorites';
import styles from '@/styles/course-list.module.scss';

export type TabKey = 'all' | 'favorites';

interface CourseListProps {
  courses: Course[];
  selectedCourseId?: string;
  onSelectCourse: (courseId: string) => void;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function CourseList({ courses, selectedCourseId, onSelectCourse, activeTab, onTabChange }: CourseListProps) {
  const { favorites, isFavorite, toggleFavorite, isHydrated } = useFavorites();

  // Filter courses based on active tab
  const visibleCourses = activeTab === 'favorites'
    ? courses.filter((course) => favorites.has(course.id))
    : courses;

  const handleCourseClick = (courseId: string) => {
    onSelectCourse(courseId);
  };

  const handleFavoriteClick = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    toggleFavorite(courseId);
  };

  if (!isHydrated) {
    return (
      <div className={styles.container}>
        <div className={styles.tabs}>
          <button className={styles.tab} disabled>All</button>
          <button className={styles.tab} disabled>Favorites</button>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('all')}
        >
          All
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'favorites' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('favorites')}
        >
          Favorites {favorites.size > 0 && `(${favorites.size})`}
        </button>
      </div>

      <div className={styles.courseList}>
        {visibleCourses.length === 0 ? (
          <div className={styles.emptyState}>
            {activeTab === 'favorites' ? (
              <>
                <div className={styles.emptyIcon}>🤍</div>
                <h3 className={styles.emptyTitle}>No favorite courses yet</h3>
                <p className={styles.emptyText}>
                  Tap the heart on a course to add it to your favorites
                </p>
              </>
            ) : (
              <>
                <div className={styles.emptyIcon}>🏌️</div>
                <h3 className={styles.emptyTitle}>No courses found</h3>
                <p className={styles.emptyText}>
                  Try selecting a different tab
                </p>
              </>
            )}
          </div>
        ) : (
          visibleCourses.map((course) => {
            const isFav = isFavorite(course.id);
            const isSelected = course.id === selectedCourseId;

            return (
              <div
                key={course.id}
                className={`${styles.courseItem} ${isSelected ? styles.courseItemSelected : ''}`}
                onClick={() => handleCourseClick(course.id)}
              >
                <div className={styles.courseItemContent}>
                  <h3 className={styles.courseItemName}>{course.name}</h3>
                  {course.city && course.state && (
                    <p className={styles.courseItemLocation}>
                      {course.city}, {course.state}
                    </p>
                  )}
                  {course.fitScore != null && (
                    <div className={styles.courseItemScore}>
                      Fit: {course.fitScore}/100
                    </div>
                  )}
                </div>
                <button
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={(e) => handleFavoriteClick(e, course.id)}
                  className={`${styles.courseItemFavorite} ${isFav ? styles.courseItemFavoriteActive : ''}`}
                >
                  {isFav ? '❤️' : '🤍'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

