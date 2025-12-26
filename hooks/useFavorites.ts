'use client';

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'golfmaps:favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Load favorites from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setFavorites(new Set(parsed));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    try {
      const favoritesArray = Array.from(favorites);
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favorites, isHydrated]);

  const isFavorite = useCallback(
    (courseId: string): boolean => {
      return favorites.has(courseId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((courseId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: favorites.size,
    isHydrated,
  };
}

