'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { favoritesAPI, Superhero } from '@/lib/api';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/common/Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart, Star } from 'lucide-react';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Superhero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesAPI.getAll();
      if (response.data.status === 'success' && response.data.data) {
        setFavorites(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (superheroId: number) => {
    try {
      await favoritesAPI.remove(superheroId);
      setFavorites(favorites.filter(f => f.id !== superheroId));
      toast.success('Removed from favorites');
    } catch (error: any) {
      toast.error('Failed to remove favorite');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
          <p className="text-purple-200">Your saved superheroes</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No favorites yet</p>
            <p className="text-gray-500 text-sm mb-6">Start adding superheroes to your favorites!</p>
            <Button asChild>
              <Link href="/heroes">Browse Superheroes</Link>
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((hero) => (
                <Card
                  key={hero.id}
                  className="overflow-hidden hover:bg-gray-700 transition-all group"
                >
                  <Link href={`/heroes/${hero.id}`}>
                    <div className="h-64 bg-gray-700 flex items-center justify-center cursor-pointer">
                      {hero.image_url ? (
                        <img src={hero.image_url} alt={hero.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="text-gray-400 text-4xl">🦸</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/heroes/${hero.id}`}>
                          <h3 className="text-white font-semibold text-lg mb-1 hover:text-purple-400 transition-colors">
                            {hero.name}
                          </h3>
                        </Link>
                        <p className="text-gray-400 text-sm mb-2 min-h-[20px]">
                          {hero.full_name || '\u00A0'}
                        </p>
                        {hero.alignment && (
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            hero.alignment === 'good' ? 'bg-green-500/20 text-green-400' :
                            hero.alignment === 'bad' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {hero.alignment.charAt(0).toUpperCase() + hero.alignment.slice(1)}
                          </span>
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFavorite(hero.id)}
                            className="ml-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove from favorites</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
