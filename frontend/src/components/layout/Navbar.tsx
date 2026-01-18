'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="font-bold text-lg text-gray-900">
            Superhero Hub
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 text-sm">
                Dashboard
              </Link>
              <Link href="/superheroes" className="text-gray-700 hover:text-blue-600 text-sm">
                Heroes
              </Link>
              <Link href="/teams" className="text-gray-700 hover:text-blue-600 text-sm">
                Teams
              </Link>
              <Link href="/favorites" className="text-gray-700 hover:text-blue-600 text-sm">
                Favorites
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Hi, {user?.first_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 text-sm">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}