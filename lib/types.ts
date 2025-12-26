export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  username: string;
  display_name?: string;
  skill_level?: SkillLevel;
  // Legacy fields - kept for backward compatibility but not required
  handicap?: number;
  years_of_experience?: number;
}

export interface Course {
  id: string;
  created_at: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  yardage?: number;
  slope_rating?: number;
  course_rating?: number;
  condition_score?: number;
  google_place_id?: string;
  image_url?: string;
  fitScore?: number; // Course fit score (0-100) based on slope and yardage
  distanceFromOrigin?: number | null; // Distance in miles from the origin/reference location
}

export interface CourseStats {
  course_id: string;
  peak_hours?: {
    weekday?: string[];
    weekend?: string[];
  };
  holiday_factor?: number;
  base_popularity?: number;
}

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  windSpeed: number;
  conditionScore: number; // Course condition score (0-100) based on weather playability
}

export interface BusynessScore {
  score: number;
  label: string;
}

export interface FitRating {
  score: number;
  label: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  name: string;
  contact?: string;
  created_at: string;
}

export interface Group {
  id: string;
  course_id: string;
  created_at: string;
  status: 'open' | 'full' | 'closed';
  tee_time?: string;
  note?: string;
  member_count?: number;
  members?: GroupMember[];
}

