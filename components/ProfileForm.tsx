'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Profile, SkillLevel } from '@/lib/types';

export default function ProfileForm() {
  const [profile, setProfile] = useState<Partial<Profile>>({
    display_name: '',
    skill_level: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
      } else if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    try {
      // Validate required fields
      if (!profile.skill_level) {
        setError('Please select your playing level');
        setSaving(false);
        return;
      }

      // Ensure we have username - get it from existing profile or fetch from auth
      let username = profile.username;
      if (!username) {
        // If username is not in profile, fetch it from the database
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        username = existingProfile?.username;
      }

      // If still no username, this shouldn't happen but handle it
      if (!username) {
        setError('Username not found. Please contact support.');
        setSaving(false);
        return;
      }

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username, // Ensure username is included
          display_name: profile.display_name || username,
          skill_level: profile.skill_level,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Complete Your Profile
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Select your playing level to get personalized course recommendations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Display Name (Optional)
          </label>
          <input
            id="display_name"
            type="text"
            value={profile.display_name || ''}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={profile.username || 'Your name'}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This is how your name will appear to others (defaults to your username)
          </p>
        </div>

        <div>
          <label htmlFor="skill_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Playing Level *
          </label>
          <select
            id="skill_level"
            value={profile.skill_level || ''}
            onChange={(e) => setProfile({ ...profile, skill_level: e.target.value as SkillLevel })}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select your playing level</option>
            <option value="Beginner">Beginner (handicap 28+, or avg round &gt;100)</option>
            <option value="Intermediate">Intermediate (handicap 17-27, or avg round 89-99)</option>
            <option value="Advanced">Advanced (handicap 7-16, or avg round 79-88)</option>
            <option value="Expert">Expert (handicap 0-6, or avg round 72-78)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select the level that best matches your golfing ability
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

