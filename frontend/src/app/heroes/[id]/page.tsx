'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { superheroAPI, favoritesAPI, Superhero } from '@/lib/api';
import toast from 'react-hot-toast';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { BackButton } from '@/components/common/BackButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormSelect from '@/components/common/FormSelect';
import { Heart } from 'lucide-react';

const editSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  intelligence: Yup.number().min(0).max(100).nullable(),
  strength: Yup.number().min(0).max(100).nullable(),
  speed: Yup.number().min(0).max(100).nullable(),
  durability: Yup.number().min(0).max(100).nullable(),
  power: Yup.number().min(0).max(100).nullable(),
  combat: Yup.number().min(0).max(100).nullable(),
  full_name: Yup.string().nullable(),
  publisher: Yup.string().nullable(),
  alignment: Yup.string().oneOf(['good', 'bad', 'neutral', null, '']).nullable(),
  gender: Yup.string().nullable(),
  race: Yup.string().nullable(),
  occupation: Yup.string().nullable(),
  base: Yup.string().nullable(),
  image_url: Yup.string().url('Must be a valid URL').nullable(),
});

export default function SuperheroDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [superhero, setSuperhero] = useState<Superhero | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const superheroId = parseInt(params.id as string);
  const isValidId = !isNaN(superheroId) && superheroId > 0;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    // If invalid ID, redirect to heroes page
    if (!isLoading && isAuthenticated && !isValidId) {
      toast.error('Invalid hero ID');
      router.push('/heroes');
    }
  }, [isAuthenticated, isLoading, router, isValidId]);

  useEffect(() => {
    if (isAuthenticated && isValidId) {
      fetchSuperhero();
      checkFavorite();
    }
  }, [isAuthenticated, isValidId]);

  const fetchSuperhero = async () => {
    try {
      setLoading(true);
      const response = await superheroAPI.getById(superheroId);
      if (response.data.status === 'success' && response.data.data) {
        setSuperhero(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load superhero details');
      router.push('/heroes');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoritesAPI.check(superheroId);
      if (response.data.status === 'success' && response.data.data) {
        setIsFavorite(response.data.data.is_favorite);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await favoritesAPI.remove(superheroId);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.add(superheroId);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleSubmit = async (values: Partial<Superhero>) => {
    try {
      setSubmitting(true);
      // Remove null/undefined values and empty strings
      const updateData: any = {};
      Object.keys(values).forEach(key => {
        const value = (values as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          updateData[key] = value;
        }
      });

      const response = await superheroAPI.update(superheroId, updateData);
      if (response.data.status === 'success') {
        toast.success('Superhero updated successfully!');
        setIsEditing(false);
        fetchSuperhero(); // Refresh the data
      } else {
        toast.error(response.data.message || 'Failed to update superhero');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update superhero');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !isValidId || !superhero) {
    return null;
  }

  const powerStats = [
    { label: 'Intelligence', value: superhero.intelligence || 0 },
    { label: 'Strength', value: superhero.strength || 0 },
    { label: 'Speed', value: superhero.speed || 0 },
    { label: 'Durability', value: superhero.durability || 0 },
    { label: 'Power', value: superhero.power || 0 },
    { label: 'Combat', value: superhero.combat || 0 },
  ];

  const initialValues: Partial<Superhero> = {
    name: superhero.name || '',
    intelligence: superhero.intelligence ?? undefined,
    strength: superhero.strength ?? undefined,
    speed: superhero.speed ?? undefined,
    durability: superhero.durability ?? undefined,
    power: superhero.power ?? undefined,
    combat: superhero.combat ?? undefined,
    full_name: superhero.full_name || '',
    publisher: superhero.publisher || '',
    alignment: superhero.alignment || '',
    gender: superhero.gender || '',
    race: superhero.race || '',
    occupation: superhero.occupation || '',
    base: superhero.base || '',
    image_url: superhero.image_url || '',
  };

  return (
    <div className="bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex justify-between items-center mb-3">
          <BackButton href="/heroes" label="Back to Heroes" />
          {user?.role === 'admin' && !isEditing && (
            <PrimaryButton onClick={() => setIsEditing(true)}>
              Edit Superhero
            </PrimaryButton>
          )}
        </div>

        {isEditing ? (
          <div className="bg-gray-800 rounded-lg border border-purple-500/30 p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Edit Superhero</h1>
            <p className="text-purple-200 mb-6">Admin: Update superhero information</p>

            <Formik
              initialValues={initialValues}
              validationSchema={editSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2">Name <span className="text-red-500">*</span></Label>
                      <Field
                        as={Input}
                        name="name"
                        type="text"
                        className="w-full bg-gray-700"
                      />
                      <ErrorMessage name="name" component="div" className="text-red-400 text-sm mt-1" />
                    </div>

                    <div>
                      <Label className="mb-2">Full Name</Label>
                      <Field
                        as={Input}
                        name="full_name"
                        type="text"
                        className="w-full bg-gray-700"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Publisher</Label>
                      <Field
                        as={Input}
                        name="publisher"
                        type="text"
                        className="w-full bg-gray-700"
                      />
                    </div>

                    <FormSelect
                      id="alignment"
                      name="alignment"
                      label="Alignment"
                      placeholder="None"
                      options={[
                        { value: 'good', label: 'Good' },
                        { value: 'bad', label: 'Bad' },
                        { value: 'neutral', label: 'Neutral' },
                      ]}
                      className="bg-gray-700"
                    />

                    <div>
                      <Label className="mb-2">Gender</Label>
                      <Field
                        as={Input}
                        name="gender"
                        type="text"
                        className="w-full bg-gray-700"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Race</Label>
                      <Field
                        as={Input}
                        name="race"
                        type="text"
                        className="w-full bg-gray-700"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Occupation</Label>
                      <Field
                        as={Input}
                        name="occupation"
                        type="text"
                        className="w-full bg-gray-700"
                      />
                    </div>

                    <div>
                      <Label className="mb-2">Base</Label>
                      <Field
                        as={Input}
                        name="base"
                        type="text"
                        className="w-full bg-gray-700"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label className="mb-2">Image URL</Label>
                      <Field
                        as={Input}
                        name="image_url"
                        type="url"
                        className="w-full bg-gray-700"
                      />
                      <ErrorMessage name="image_url" component="div" className="text-red-400 text-sm mt-1" />
                    </div>
                  </div>

                  {/* Power Stats */}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Power Stats (0-100)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'].map((stat) => (
                        <div key={stat}>
                          <Label className="mb-2 capitalize">{stat}</Label>
                          <Field
                            as={Input}
                            name={stat}
                            type="number"
                            min="0"
                            max="100"
                            className="w-full bg-gray-700"
                          />
                          <ErrorMessage name={stat} component="div" className="text-red-400 text-sm mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-4 pt-4 border-t border-purple-500/20">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <PrimaryButton
                      type="submit"
                      disabled={isSubmitting || submitting}
                    >
                      {isSubmitting || submitting ? 'Updating...' : 'Update Superhero'}
                    </PrimaryButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-purple-500/30 overflow-hidden">
          <div className="md:flex">
            {/* Image Section */}
            <div className="md:w-1/3 bg-gray-700 flex items-center justify-center min-h-[400px]">
              {superhero.image_url ? (
                <img src={superhero.image_url} alt={superhero.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-8xl">🦸</div>
              )}
            </div>

            {/* Details Section */}
            <div className="md:w-2/3 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{superhero.name}</h1>
                  {superhero.full_name && (
                    <p className="text-gray-400 text-lg">{superhero.full_name}</p>
                  )}
                </div>
                <Button
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  variant="ghost"
                  size="icon"
                  className={isFavorite ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-gray-300 hover:text-gray-200'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {superhero.alignment && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
                  superhero.alignment === 'good' ? 'bg-green-500/20 text-green-400' :
                  superhero.alignment === 'bad' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {superhero.alignment.charAt(0).toUpperCase() + superhero.alignment.slice(1)}
                </span>
              )}

              {/* Power Stats */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Power Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  {powerStats.map((stat) => (
                    <div key={stat.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 text-sm">{stat.label}</span>
                        <span className="text-white font-semibold">{stat.value}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${stat.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biography */}
              {(superhero.publisher || superhero.place_of_birth || superhero.first_appearance) && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-3">Biography</h2>
                  <div className="space-y-2 text-gray-300">
                    {superhero.publisher && (
                      <p><span className="text-gray-400">Publisher:</span> {superhero.publisher}</p>
                    )}
                    {superhero.place_of_birth && (
                      <p><span className="text-gray-400">Place of Birth:</span> {superhero.place_of_birth}</p>
                    )}
                    {superhero.first_appearance && (
                      <p><span className="text-gray-400">First Appearance:</span> {superhero.first_appearance}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Appearance */}
              {(superhero.gender || superhero.race || superhero.height_cm || superhero.weight_kg) && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-3">Appearance</h2>
                  <div className="grid grid-cols-2 gap-2 text-gray-300 text-sm">
                    {superhero.gender && <p><span className="text-gray-400">Gender:</span> {superhero.gender}</p>}
                    {superhero.race && <p><span className="text-gray-400">Race:</span> {superhero.race}</p>}
                    {superhero.height_cm && <p><span className="text-gray-400">Height:</span> {superhero.height_cm}</p>}
                    {superhero.weight_kg && <p><span className="text-gray-400">Weight:</span> {superhero.weight_kg}</p>}
                    {superhero.eye_color && <p><span className="text-gray-400">Eyes:</span> {superhero.eye_color}</p>}
                    {superhero.hair_color && <p><span className="text-gray-400">Hair:</span> {superhero.hair_color}</p>}
                  </div>
                </div>
              )}

              {/* Work */}
              {(superhero.occupation || superhero.base) && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Work</h2>
                  <div className="space-y-2 text-gray-300">
                    {superhero.occupation && (
                      <p><span className="text-gray-400">Occupation:</span> {superhero.occupation}</p>
                    )}
                    {superhero.base && (
                      <p><span className="text-gray-400">Base:</span> {superhero.base}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
