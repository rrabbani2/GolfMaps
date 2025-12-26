'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Course, Profile } from '@/lib/types';
import { useFavorites } from '@/hooks/useFavorites';
import Map from '@/components/Map';
import CourseCard from '@/components/CourseCard';
import CourseList, { TabKey } from '@/components/CourseList';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/layout.module.scss';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const { favorites, isHydrated } = useFavorites();

  useEffect(() => {
    // Fetch courses
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          console.log('Courses fetched:', data.length, 'courses');
          console.log('Course data:', data);
          setCourses(data);
          // Don't auto-select first course - let user select from filtered list
          if (data.length === 0) {
            console.warn('No courses found in database. Please run the seed script in Supabase.');
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch courses:', response.status, errorData);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user profile
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile(data);
        }
      }
    };

    fetchCourses();
    fetchProfile();
  }, []);

  // Filter courses based on active tab
  const visibleCourses = useMemo(() => {
    if (!isHydrated) return courses;
    
    if (activeTab === 'favorites') {
      return courses.filter((course) => favorites.has(course.id));
    }
    return courses;
  }, [courses, activeTab, favorites, isHydrated]);

  // Clear selected course if it's filtered out
  useEffect(() => {
    if (selectedCourseId && !visibleCourses.find(c => c.id === selectedCourseId)) {
      setSelectedCourseId(undefined);
    }
  }, [visibleCourses, selectedCourseId]);

  const selectedCourse = visibleCourses.find(c => c.id === selectedCourseId);

  if (loading) {
    return (
      <div className={styles.main}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.mapLayout}>
          <div className={styles.listSection}>
            <CourseList
              courses={courses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={setSelectedCourseId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          <div className={styles.mapSection}>
            <Map
              courses={visibleCourses}
              selectedCourseId={selectedCourseId}
              onSelectCourse={setSelectedCourseId}
            />
          </div>
          <div className={styles.cardSection}>
            {selectedCourse ? (
              <CourseCard course={selectedCourse} profile={profile || undefined} />
            ) : (
              <div className={styles.emptyState}>
                <h2 className={styles.emptyStateTitle}>No Course Selected</h2>
                <p className={styles.emptyStateText}>
                  Click on a course in the list or a marker on the map to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

