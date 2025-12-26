'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Helper function to convert username to internal email format for Supabase
// Supabase requires an email, so we use a format that passes validation
// Using a format that Supabase accepts: username@example.com (example.com is reserved for documentation)
const usernameToEmail = (username: string): string => {
  // Using example.com which is a reserved domain for documentation/examples
  // This format should pass Supabase's email validation
  return `${username.toLowerCase().trim()}@example.com`;
};

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Convert username to email format for Supabase
        const internalEmail = usernameToEmail(username);

        // Check if username already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username.toLowerCase().trim())
          .single();

        if (existingProfile) {
          setError('Username already taken');
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: {
            // Disable email confirmation requirement
            emailRedirectTo: undefined,
          },
        });

        if (signUpError) {
          // Provide more helpful error messages
          if (signUpError.message.includes('email') || signUpError.message.includes('invalid')) {
            throw new Error('Username format is invalid. Please use only letters, numbers, and underscores.');
          }
          throw signUpError;
        }

        if (data.user) {
          // Create profile entry with username
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username.toLowerCase().trim(),
              display_name: username,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // If profile creation fails, try to clean up the auth user
            // (Note: This might not work if RLS prevents it)
            throw new Error('Failed to create profile. Please try again.');
          }

          // Always redirect to profile creation after sign up
          router.push('/profile');
        }
      } else {
        // For sign in, we need to find the user by username
        // First, get the profile to find the user ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase().trim())
          .single();

        if (!profile) {
          setError('Invalid username or password');
          setLoading(false);
          return;
        }

        // Get the user's email from auth.users (we stored it as username@golfmaps.app)
        const internalEmail = usernameToEmail(username);

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password,
        });

        if (signInError) {
          setError('Invalid username or password');
          setLoading(false);
          return;
        }

        // After sign in, always redirect to profile creation page
        // The profile form will check if profile is complete
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="3-20 characters, letters, numbers, and underscores only"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Username must be 3-20 characters (letters, numbers, and underscores only)
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}

