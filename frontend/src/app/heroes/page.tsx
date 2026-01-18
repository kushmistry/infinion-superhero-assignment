'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { superheroAPI, favoritesAPI, Superhero } from '@/lib/api';
import toast from 'react-hot-toast';
import { StandaloneSelect } from '@/components/common/FormSelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart } from 'lucide-react';

export default function HeroesPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [superheroes, setSuperheroes] = useState<Superhero[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [alignment, setAlignment] = useState<string>('');
  const [favoriteLoading, setFavoriteLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        fetchSuperheroes();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [page, alignment, search, isAuthenticated]);

  const fetchSuperheroes = async () => {
    try {
      setLoading(true);
      const params: any = { page, page_size: 20 };
      if (search) params.search = search;
      if (alignment) params.alignment = alignment;

      const response = await superheroAPI.getAll(params);
      if (response.data.status === 'success' && response.data.data) {
        const heroes = response.data.data.items || [];
        setSuperheroes(heroes);
        setTotalPages(response.data.data.pages || 1);
      }
    } catch (error: any) {
      toast.error('Failed to load superheroes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, heroId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setFavoriteLoading(prev => ({ ...prev, [heroId]: true }));
      const hero = superheroes.find(h => h.id === heroId);
      const isFavorite = hero?.is_favorite || false;
      
      if (isFavorite) {
        await favoritesAPI.remove(heroId);
        // Update the hero in the list
        setSuperheroes(prev => prev.map(h => 
          h.id === heroId ? { ...h, is_favorite: false } : h
        ));
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.add(heroId);
        // Update the hero in the list
        setSuperheroes(prev => prev.map(h => 
          h.id === heroId ? { ...h, is_favorite: true } : h
        ));
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [heroId]: false }));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleAlignmentChange = (value: string) => {
    setAlignment(value);
    setPage(1);
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-purple-200">Explore the complete superhero database</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, publisher..."
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <StandaloneSelect
              value={alignment}
              onChange={(e) => handleAlignmentChange(e.target.value)}
              options={[
                { value: 'good', label: 'Good' },
                { value: 'bad', label: 'Bad' },
                { value: 'neutral', label: 'Neutral' },
              ]}
              placeholder="All Alignments"
            />
          </div>
        </div>

        {/* Superheroes Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : superheroes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No superheroes found</p>
          </div>
        ) : (
          <>
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {superheroes.map((hero) => (
                  <Link
                    key={hero.id}
                    href={`/heroes/${hero.id}`}
                    className="relative bg-gray-800 hover:bg-gray-700 rounded-lg border border-purple-500/30 overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="h-64 bg-gray-700 flex items-center justify-center relative">
                      {hero.image_url ? (
                        <img src={hero.image_url} alt={hero.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400 text-4xl">🦸</div>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={(e) => handleToggleFavorite(e, hero.id)}
                            disabled={favoriteLoading[hero.id]}
                            variant="ghost"
                            size="icon"
                            className={`absolute top-2 right-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full ${
                              hero.is_favorite ? 'text-red-400 hover:text-red-300' : 'text-white hover:text-gray-200'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${hero.is_favorite ? 'fill-current' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{hero.is_favorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">{hero.name}</h3>
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
                </Link>
              ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </TooltipProvider>
          </>
        )}
      </div>
    </div>
  );
}
