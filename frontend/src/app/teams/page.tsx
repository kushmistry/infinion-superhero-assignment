'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { teamsAPI, superheroAPI, Team, Superhero, TeamComparisonResult } from '@/lib/api';
import toast from 'react-hot-toast';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card } from '@/components/common/Card';
import { Trash2, Users, Sparkles, Zap, Shuffle, Plus, Search, Eye, Swords, X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const teamSchema = Yup.object().shape({
  name: Yup.string()
    .required('Team name is required')
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
});

export default function TeamsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedTeam1, setSelectedTeam1] = useState<Team | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<Team | null>(null);
  const [comparisonResult, setComparisonResult] = useState<TeamComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [recommendedHeroes, setRecommendedHeroes] = useState<Superhero[]>([]);
  const [recommendationType, setRecommendationType] = useState<'balanced' | 'random' | 'power' | null>(null);
  const [powerStatUsed, setPowerStatUsed] = useState<string | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [browsedHeroes, setBrowsedHeroes] = useState<Superhero[]>([]);
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseLoading, setBrowseLoading] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    superhero_ids: [] as number[],
  });

  const handleBrowseHeroes = async () => {
    try {
      setBrowseLoading(true);
      const response = await superheroAPI.getAll({ page: 1, page_size: 20, search: browseSearch || undefined });
      if (response.data.status === 'success' && response.data.data?.items) {
        setBrowsedHeroes(response.data.data.items);
      }
    } catch (error: any) {
      toast.error('Failed to browse superheroes');
    } finally {
      setBrowseLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Debounce search to avoid too many API calls
    if (browseSearch.trim()) {
      const timeoutId = setTimeout(() => {
        handleBrowseHeroes();
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      // Clear results if search is empty
      setBrowsedHeroes([]);
    }
  }, [browseSearch]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getAll();
      if (response.data.status === 'success' && response.data.data) {
        setTeams(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setNewTeam({ name: '', description: '', superhero_ids: [] });
    setRecommendedHeroes([]);
    setRecommendationType(null);
    setPowerStatUsed(null);
    setBrowsedHeroes([]);
    setBrowseSearch('');
    setOpenPopoverId(null);
    setShowCreateModal(true);
  };

  const handleCreateTeam = async (values: { name: string; description: string }, superheroIds: number[]) => {
    if (superheroIds.length < 2) {
      toast.error('Please select at least 2 superheroes for your team');
      return;
    }
    if (superheroIds.length > 5) {
      toast.error('A team can have a maximum of 5 superheroes');
      return;
    }

    try {
      setCreating(true);
      const response = await teamsAPI.create({
        name: values.name,
        description: values.description,
        superhero_ids: superheroIds,
      });
      if (response.data.status === 'success') {
        toast.success('Team created successfully');
        setShowCreateModal(false);
        setRecommendedHeroes([]);
        fetchTeams();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setShowDeleteModal(true);
  };

  const handleOpenCompareModal = () => {
    setShowCompareModal(true);
    setSelectedTeam1(null);
    setSelectedTeam2(null);
    setComparisonResult(null);
  };

  const handleSelectTeamForComparison = (team: Team) => {
    if (!selectedTeam1) {
      setSelectedTeam1(team);
    } else if (!selectedTeam2 && selectedTeam1.id !== team.id) {
      setSelectedTeam2(team);
    }
  };

  const handleCompareTeams = async () => {
    if (!selectedTeam1 || !selectedTeam2) return;

    setComparing(true);
    try {
      const response = await teamsAPI.compare(selectedTeam1.id, selectedTeam2.id);
      if (response.data.status === 'success' && response.data.data) {
        setComparisonResult(response.data.data);
        toast.success('Team comparison completed!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to compare teams');
    } finally {
      setComparing(false);
    }
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      setDeleting(true);
      await teamsAPI.delete(teamToDelete.id);
      toast.success('Team deleted successfully');
      setShowDeleteModal(false);
      setTeamToDelete(null);
      fetchTeams();
    } catch (error: any) {
      toast.error('Failed to delete team');
    } finally {
      setDeleting(false);
    }
  };

  const handleGetRecommendation = async (type: 'balanced' | 'random' | 'power') => {
    try {
      setRecommendationLoading(true);
      setRecommendationType(type);
      let response;
      if (type === 'balanced') {
        response = await teamsAPI.recommendBalanced(5);
        setPowerStatUsed(null);
      } else if (type === 'random') {
        response = await teamsAPI.recommendRandom(5);
        setPowerStatUsed(null);
      } else {
        response = await teamsAPI.recommendPower(50, 5);
        // Extract power stat from message: "Team recommended based on {power_stat}"
        const message = response.data.message || '';
        const match = message.match(/based on (\w+)/i);
        if (match && match[1]) {
          setPowerStatUsed(match[1]);
        }
      }

      if (response.data.status === 'success' && response.data.data) {
        setRecommendedHeroes(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to get recommendation');
    } finally {
      setRecommendationLoading(false);
    }
  };

  const toggleHeroSelection = (heroId: number) => {
    const isSelected = newTeam.superhero_ids.includes(heroId);

    // If deselecting, just remove it
    if (isSelected) {
      setNewTeam(prev => ({
        ...prev,
        superhero_ids: prev.superhero_ids.filter(id => id !== heroId),
      }));
      return;
    }

    // If selecting and already at max (5), show error and don't add
    if (newTeam.superhero_ids.length >= 5) {
      toast.error('Maximum of 5 superheroes allowed per team');
      return;
    }

    // Otherwise, add the hero
    setNewTeam(prev => ({
      ...prev,
      superhero_ids: [...prev.superhero_ids, heroId],
    }));
  };

  const renderPowerStats = (hero: Superhero) => {
    const stats = [
      { label: 'Intelligence', value: hero.intelligence },
      { label: 'Strength', value: hero.strength },
      { label: 'Speed', value: hero.speed },
      { label: 'Durability', value: hero.durability },
      { label: 'Power', value: hero.power },
      { label: 'Combat', value: hero.combat },
    ].filter(stat => stat.value !== undefined && stat.value !== null);

    if (stats.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-purple-400 mb-2">Power Stats</h4>
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-300">{stat.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${(stat.value || 0)}%` }}
                />
              </div>
              <span className="text-xs text-white w-8 text-right">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    );
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Teams</h1>
            <p className="text-purple-200">Build and manage your superhero teams</p>
          </div>
          <div className="flex gap-3">
            {teams.length >= 2 && (
              <Button
                variant="outline"
                onClick={handleOpenCompareModal}
                className="flex items-center gap-2"
              >
                <Swords className="w-4 h-4" />
                Compare Teams
              </Button>
            )}
            <Button
              onClick={handleOpenCreateModal}
            >
              Create Team
            </Button>
          </div>
        </div>

          {teams.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No teams yet</p>
              <p className="text-gray-500 text-sm">Create your first superhero team!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className="p-6 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 group w-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        <h3 className="text-white font-semibold text-xl truncate">{team.name}</h3>
                      </div>
                      {team.description && (
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{team.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTeam(team)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-semibold text-base">{team.superheroes?.length || 0}</span>
                      <span className="text-gray-400 text-sm">members</span>
                    </div>
                    {team.superheroes && team.superheroes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {team.superheroes.slice(0, 4).map((hero) => (
                          <span
                            key={hero.id}
                            className="text-gray-300 text-xs bg-gray-700/80 hover:bg-gray-600 px-3 py-1.5 rounded-full border border-gray-600/50 transition-colors"
                          >
                            {hero.name}
                          </span>
                        ))}
                        {team.superheroes.length > 4 && (
                          <span className="text-purple-400 text-xs bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/30">
                            +{team.superheroes.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Create Team Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg border border-purple-500/30 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                {/* Fixed Header */}
                <div className="p-6 pb-4 flex-shrink-0 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Plus className="w-6 h-6 text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Create New Team</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewTeam({ name: '', description: '', superhero_ids: [] });
                        setRecommendedHeroes([]);
                        setBrowsedHeroes([]);
                        setBrowseSearch('');
                        setRecommendationType(null);
                        setPowerStatUsed(null);
                      }}
                      className="rounded-full w-10 h-10 hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <Formik
                  key={showCreateModal ? 'create-form' : 'form-reset'}
                  initialValues={{
                    name: '',
                    description: '',
                  }}
                  enableReinitialize
                  validationSchema={teamSchema}
                  onSubmit={(values) => handleCreateTeam(values, newTeam.superhero_ids)}
                >
                  {({ isSubmitting, submitForm, resetForm }) => (
                    <>
                      {/* Scrollable Content */}
                      <div className="px-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-800 scrollbar-thumb-rounded">
                        <Form className="space-y-6 pb-4">
                          <div>
                            <Label className="mb-2 text-white">Team Name <span className="text-red-500">*</span></Label>
                            <Field
                              as={Input}
                              name="name"
                              type="text"
                              className="w-full bg-gray-700"
                              placeholder="Enter team name"
                            />
                            <ErrorMessage name="name" component="div" className="text-red-400 text-sm mt-1" />
                          </div>

                          <div>
                            <Label className="mb-2 text-white">Description (Optional)</Label>
                            <Field
                              as="textarea"
                              name="description"
                              rows={3}
                              className="w-full px-4 py-2 bg-gray-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                              placeholder="Enter team description"
                            />
                            <ErrorMessage name="description" component="div" className="text-red-400 text-sm mt-1" />
                          </div>

                          <div className="border-t border-gray-700 pt-4">
                            <Label className="mb-3 text-white">
                              Selected Heroes <span className="text-red-500">*</span>
                              <span className="text-gray-400 text-sm ml-2">({newTeam.superhero_ids.length}/5)</span>
                            </Label>
                            <p className="text-sm text-gray-400 mb-3">
                              {newTeam.superhero_ids.length === 0
                                ? 'No heroes selected. Select between 2-5 heroes for your team.'
                                : newTeam.superhero_ids.length < 2
                                  ? `Select ${2 - newTeam.superhero_ids.length} more hero${2 - newTeam.superhero_ids.length > 1 ? 'es' : ''} (minimum 2 required)`
                                  : newTeam.superhero_ids.length >= 5
                                    ? 'Maximum of 5 heroes reached'
                                    : `Select ${5 - newTeam.superhero_ids.length} more hero${5 - newTeam.superhero_ids.length > 1 ? 'es' : ''} (maximum 5 allowed)`}
                            </p>
                            {newTeam.superhero_ids.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 overflow-x-visible">
                                {Array.from(
                                  new Map([
                                    ...recommendedHeroes,
                                    ...browsedHeroes
                                  ].filter(hero => newTeam.superhero_ids.includes(hero.id))
                                    .map(hero => [hero.id, hero])).values()
                                ).map((hero) => (
                                  <div
                                    key={hero.id}
                                    className="p-3 rounded-lg border-2 border-purple-500 bg-purple-500/20 shadow-md shadow-purple-500/20 text-left cursor-pointer relative overflow-visible group"
                                  >
                                    <div
                                      onClick={() => toggleHeroSelection(hero.id)}
                                      className="w-full text-left pr-8"
                                    >
                                      <div className="text-white text-sm font-semibold mb-1">{hero.name}</div>
                                      {hero.alignment && (
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${hero.alignment === 'good' ? 'bg-green-500/20 text-green-400' :
                                            hero.alignment === 'bad' ? 'bg-red-500/20 text-red-400' :
                                              'bg-yellow-500/20 text-yellow-400'
                                          }`}>
                                          {hero.alignment.charAt(0).toUpperCase() + hero.alignment.slice(1)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-700 pt-4">
                            <Label className="mb-3 text-white flex items-center gap-2">
                              <Search className="w-4 h-4 text-purple-400" />
                              Browse & Select Superheroes
                            </Label>
                            <Input
                              type="text"
                              value={browseSearch}
                              onChange={(e) => setBrowseSearch(e.target.value)}
                              placeholder="Search superheroes by name..."
                              className="w-full bg-gray-700"
                            />
                            {browseLoading && (
                              <div className="flex justify-center items-center py-8">
                                <LoadingSpinner />
                              </div>
                            )}
                            {!browseLoading && browsedHeroes.length > 0 && (
                              <div className="border-t border-gray-700 pt-4">
                                <Label className="mb-3 text-white">Browse Results ({browsedHeroes.length})</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 overflow-x-visible">
                                  {browsedHeroes.map((hero) => (
                                    <div
                                      key={hero.id}
                                      className={`p-3 rounded-lg border-2 transition-all text-left relative overflow-visible group ${newTeam.superhero_ids.includes(hero.id)
                                          ? 'border-purple-500 bg-purple-500/20 shadow-md shadow-purple-500/20'
                                          : 'border-gray-700 bg-gray-700/50 hover:border-purple-500/50 hover:bg-gray-700'
                                        }`}
                                    >
                                      <div
                                        onClick={() => toggleHeroSelection(hero.id)}
                                        className="w-full text-left pr-8 cursor-pointer"
                                      >
                                        <div className="text-white text-sm font-semibold mb-1">{hero.name}</div>
                                        {hero.alignment && (
                                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${hero.alignment === 'good' ? 'bg-green-500/20 text-green-400' :
                                              hero.alignment === 'bad' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {hero.alignment.charAt(0).toUpperCase() + hero.alignment.slice(1)}
                                          </span>
                                        )}
                                      </div>
                                      {!newTeam.superhero_ids.includes(hero.id) && (
                                        <Popover
                                          open={openPopoverId === hero.id}
                                          onOpenChange={(open) => setOpenPopoverId(open ? hero.id : null)}
                                        >
                                          <PopoverTrigger asChild>
                                            <button
                                              type="button"
                                              onPointerDown={(e) => {
                                                e.stopPropagation();
                                              }}
                                              onMouseDown={(e) => {
                                                e.stopPropagation();
                                              }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                              }}
                                              className="absolute top-1 right-1 p-1.5 rounded hover:bg-gray-600/50 transition-colors cursor-pointer z-30"
                                              style={{ pointerEvents: 'auto' }}
                                            >
                                              <Eye className="w-4 h-4 text-purple-400" />
                                            </button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                            side="left"
                                            align="start"
                                            sideOffset={8}
                                          >
                                            <div className="space-y-2">
                                              <h3 className="text-base font-semibold text-white mb-2">{hero.name}</h3>
                                              {renderPowerStats(hero) || <p className="text-sm text-gray-400">No power stats available</p>}
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-700 pt-4">
                            <Label className="mb-3 text-white flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              Get Recommendations
                            </Label>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                type="button"
                                onClick={() => handleGetRecommendation('balanced')}
                                size="sm"
                                disabled={recommendationLoading}
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Sparkles className="w-4 h-4" />
                                {recommendationLoading && recommendationType === 'balanced' ? 'Loading...' : 'Balanced'}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleGetRecommendation('power')}
                                size="sm"
                                disabled={recommendationLoading}
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Zap className="w-4 h-4" />
                                {recommendationLoading && recommendationType === 'power' ? 'Loading...' : 'Power'}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleGetRecommendation('random')}
                                size="sm"
                                disabled={recommendationLoading}
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Shuffle className="w-4 h-4" />
                                {recommendationLoading && recommendationType === 'random' ? 'Loading...' : 'Random'}
                              </Button>
                            </div>
                          </div>

                          {recommendedHeroes.length > 0 && (
                            <div className="border-t border-gray-700 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Label className="text-white">Recommended Heroes ({recommendedHeroes.length})</Label>
                                  {recommendationType === 'power' && powerStatUsed && (
                                    <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                                      Based on {powerStatUsed.charAt(0).toUpperCase() + powerStatUsed.slice(1)}
                                    </span>
                                  )}
                                </div>
                                {(() => {
                                  const allRecommendedIds = recommendedHeroes.map(hero => hero.id);
                                  const allSelected = allRecommendedIds.length > 0 && allRecommendedIds.every(id => newTeam.superhero_ids.includes(id));

                                  return allSelected ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setNewTeam(prev => ({
                                          ...prev,
                                          superhero_ids: prev.superhero_ids.filter(id => !allRecommendedIds.includes(id))
                                        }));
                                      }}
                                      className="text-xs"
                                    >
                                      Deselect All
                                    </Button>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const availableSlots = 5 - newTeam.superhero_ids.length;
                                        if (availableSlots <= 0) {
                                          toast.error('Maximum of 5 superheroes allowed per team');
                                          return;
                                        }
                                        const idsToAdd = allRecommendedIds
                                          .filter(id => !newTeam.superhero_ids.includes(id))
                                          .slice(0, availableSlots);
                                        setNewTeam(prev => ({
                                          ...prev,
                                          superhero_ids: [...prev.superhero_ids, ...idsToAdd]
                                        }));
                                      }}
                                      className="text-xs"
                                    >
                                      Select All
                                    </Button>
                                  );
                                })()}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 overflow-x-visible">
                                {recommendedHeroes.map((hero) => (
                                  <div
                                    key={hero.id}
                                    className={`p-3 rounded-lg border-2 transition-all text-left relative overflow-visible group ${newTeam.superhero_ids.includes(hero.id)
                                        ? 'border-purple-500 bg-purple-500/20 shadow-md shadow-purple-500/20'
                                        : 'border-gray-700 bg-gray-700/50 hover:border-purple-500/50 hover:bg-gray-700'
                                      }`}
                                  >
                                    <div
                                      onClick={() => toggleHeroSelection(hero.id)}
                                      className="w-full text-left pr-8 cursor-pointer"
                                    >
                                      <div className="text-white text-sm font-semibold mb-1">{hero.name}</div>
                                      {hero.alignment && (
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${hero.alignment === 'good' ? 'bg-green-500/20 text-green-400' :
                                            hero.alignment === 'bad' ? 'bg-red-500/20 text-red-400' :
                                              'bg-yellow-500/20 text-yellow-400'
                                          }`}>
                                          {hero.alignment.charAt(0).toUpperCase() + hero.alignment.slice(1)}
                                        </span>
                                      )}
                                    </div>
                                    {!newTeam.superhero_ids.includes(hero.id) && (
                                      <Popover
                                        open={openPopoverId === hero.id}
                                        onOpenChange={(open) => setOpenPopoverId(open ? hero.id : null)}
                                      >
                                        <PopoverTrigger asChild>
                                          <button
                                            type="button"
                                            onPointerDown={(e) => {
                                              e.stopPropagation();
                                            }}
                                            onMouseDown={(e) => {
                                              e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                            }}
                                            className="absolute top-1 right-1 p-1.5 rounded hover:bg-gray-600/50 transition-colors cursor-pointer z-30"
                                            style={{ pointerEvents: 'auto' }}
                                          >
                                            <Eye className="w-4 h-4 text-purple-400" />
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          side="left"
                                          align="start"
                                          sideOffset={8}
                                        >
                                          <div className="space-y-2">
                                            <h3 className="text-base font-semibold text-white mb-2">{hero.name}</h3>
                                            {renderPowerStats(hero) || <p className="text-sm text-gray-400">No power stats available</p>}
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </Form>
                      </div>

                      {/* Fixed Footer */}
                      <div className="px-6 py-6 border-t border-purple-500/20 flex-shrink-0">
                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              resetForm();
                              setShowCreateModal(false);
                              setNewTeam({ name: '', description: '', superhero_ids: [] });
                              setRecommendedHeroes([]);
                              setBrowsedHeroes([]);
                              setBrowseSearch('');
                              setOpenPopoverId(null);
                            }}
                            disabled={creating || isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={submitForm}
                            disabled={creating || isSubmitting}
                            className="min-w-[120px]"
                          >
                            {creating || isSubmitting ? 'Creating...' : 'Create Team'}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </Formik>
              </div>
            </div>
          )}

          {/* Delete Team Modal */}
          {showDeleteModal && teamToDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg border border-purple-500/30 max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Delete Team</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setTeamToDelete(null);
                      }}
                      className="rounded-full w-10 h-10 hover:bg-gray-700"
                      disabled={deleting}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Are you sure you want to delete <span className="font-semibold text-white">{teamToDelete.name}</span>?
                    This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setTeamToDelete(null);
                      }}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmDeleteTeam}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete Team'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compare Teams Modal */}
          {showCompareModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-700 flex-shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Compare Teams</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowCompareModal(false);
                        setSelectedTeam1(null);
                        setSelectedTeam2(null);
                        setComparisonResult(null);
                      }}
                      className="rounded-full w-10 h-10 hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">Select two teams to compare their strengths</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {!comparisonResult ? (
                    <div className="space-y-6">
                      {/* Team Selection */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label className="text-white mb-3 block">Team 1</Label>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-800 scrollbar-thumb-rounded">
                            {teams.map((team) => (
                              <div
                                key={team.id}
                                onClick={() => handleSelectTeamForComparison(team)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTeam1?.id === team.id
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : selectedTeam2?.id === team.id
                                      ? 'border-gray-600 bg-gray-700/50 opacity-50 cursor-not-allowed'
                                      : 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-700/30'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-purple-400" />
                                  <span className="text-white font-semibold">{team.name}</span>
                                </div>
                                <span className="text-gray-400 text-sm">
                                  {team.superheroes?.length || 0} members
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-white mb-3 block">Team 2</Label>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-800 scrollbar-thumb-rounded">
                            {teams.map((team) => (
                              <div
                                key={team.id}
                                onClick={() => handleSelectTeamForComparison(team)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTeam2?.id === team.id
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : selectedTeam1?.id === team.id
                                      ? 'border-gray-600 bg-gray-700/50 opacity-50 cursor-not-allowed'
                                      : 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-700/30'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-purple-400" />
                                  <span className="text-white font-semibold">{team.name}</span>
                                </div>
                                <span className="text-gray-400 text-sm">
                                  {team.superheroes?.length || 0} members
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Compare Button */}
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={handleCompareTeams}
                          disabled={!selectedTeam1 || !selectedTeam2 || comparing}
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                        >
                          {comparing ? (
                            'Comparing...'
                          ) : (
                            <>
                              <Swords className="w-4 h-4 mr-2" />
                              Compare Teams
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Winner Banner */}
                      <div className={`p-6 rounded-lg border-2 ${comparisonResult.winner.team_id === comparisonResult.team1.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : comparisonResult.winner.team_id === comparisonResult.team2.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-600 bg-gray-700/30'
                        }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <Swords className="w-6 h-6 text-purple-400" />
                          <h3 className="text-2xl font-bold text-white">
                            {comparisonResult.winner.team_name}
                          </h3>
                        </div>
                        <p className="text-gray-300">{comparisonResult.explanation}</p>
                      </div>

                      {/* Stats Comparison */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Team 1 Stats */}
                        <div className="space-y-4">
                          <h4 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
                            {comparisonResult.team1.name}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Total Power</span>
                                <span className="text-white font-semibold">{comparisonResult.team1.stats.total_power}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, (comparisonResult.team1.stats.total_power / (comparisonResult.team1.stats.total_power + comparisonResult.team2.stats.total_power)) * 200)}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Average Power</span>
                                <span className="text-white font-semibold">{comparisonResult.team1.stats.average_power.toFixed(1)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Strength</span>
                                <span className="text-white font-semibold">{comparisonResult.team1.stats.total_strength}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Combat</span>
                                <span className="text-white font-semibold">{comparisonResult.team1.stats.total_combat}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Intelligence</span>
                                <span className="text-white font-semibold">{comparisonResult.team1.stats.total_intelligence}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Score</span>
                                <span className="text-purple-400 font-bold text-lg">{comparisonResult.team1.score}/100</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Team 2 Stats */}
                        <div className="space-y-4">
                          <h4 className="text-xl font-bold text-white border-b border-gray-700 pb-2">
                            {comparisonResult.team2.name}
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Total Power</span>
                                <span className="text-white font-semibold">{comparisonResult.team2.stats.total_power}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, (comparisonResult.team2.stats.total_power / (comparisonResult.team1.stats.total_power + comparisonResult.team2.stats.total_power)) * 200)}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Average Power</span>
                                <span className="text-white font-semibold">{comparisonResult.team2.stats.average_power.toFixed(1)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Strength</span>
                                <span className="text-white font-semibold">{comparisonResult.team2.stats.total_strength}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Combat</span>
                                <span className="text-white font-semibold">{comparisonResult.team2.stats.total_combat}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Intelligence</span>
                                <span className="text-white font-semibold">{comparisonResult.team2.stats.total_intelligence}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-400 text-sm">Score</span>
                                <span className="text-purple-400 font-bold text-lg">{comparisonResult.team2.score}/100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reasons */}
                      <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <h4 className="text-lg font-semibold text-white mb-3">Analysis</h4>
                        <ul className="space-y-2">
                          {comparisonResult.reasons.map((reason, index) => (
                            <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {comparisonResult && (
                  <div className="p-6 border-t border-gray-700 flex-shrink-0 flex justify-end">
                    <Button
                      onClick={() => {
                        setComparisonResult(null);
                        setSelectedTeam1(null);
                        setSelectedTeam2(null);
                      }}
                    >
                      Compare Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
}
