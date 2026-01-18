'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-600 to-purple-400 animate-pulse">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-3">
            Hero Not Found
          </h2>
          <p className="text-gray-400 text-lg mb-2">
            Oops! The superhero you're looking for has vanished into another dimension.
          </p>
          <p className="text-gray-500 text-sm">
            The page you requested doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/heroes" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Heroes
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
            <Link href="/teams" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              View Teams
            </Link>
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2 opacity-20">
          <span className="text-4xl">🦸</span>
          <span className="text-4xl">🦸‍♂️</span>
          <span className="text-4xl">🦸‍♀️</span>
        </div>
      </div>
    </div>
  );
}
