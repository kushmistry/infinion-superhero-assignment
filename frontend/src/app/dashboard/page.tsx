'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-purple-200">Superhero Hub Dashboard</p>
          </div>
          <button
            onClick={() => logout()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/superheroes" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg border border-purple-500 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Browse Heroes</h3>
                <p className="text-gray-300 text-sm">Explore the hero database</p>
              </div>
            </div>
          </Link>

          <Link href="/teams" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg border border-purple-500 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">My Teams</h3>
                <p className="text-gray-300 text-sm">Build and manage teams</p>
              </div>
            </div>
          </Link>

          <Link href="/favorites" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg border border-purple-500 transition-colors">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Favorites</h3>
                <p className="text-gray-300 text-sm">Your saved heroes</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg border border-purple-500 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Your Stats</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">0</div>
              <div className="text-sm text-gray-300">Heroes Favorited</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">0</div>
              <div className="text-sm text-gray-300">Teams Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-400 capitalize">{user?.role || 'User'}</div>
              <div className="text-sm text-gray-300">Account Type</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}