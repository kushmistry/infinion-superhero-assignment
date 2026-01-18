'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { superheroAPI, Superhero } from '@/lib/api';
import toast from 'react-hot-toast';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import FormSelect from '@/components/common/FormSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { BackButton } from '@/components/common/BackButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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

export default function EditSuperheroPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [superhero, setSuperhero] = useState<Superhero | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const superheroId = parseInt(params.id as string);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        toast.error('Only admins can edit superheroes');
        router.push(`/heroes/${superheroId}`);
      }
    }
  }, [isAuthenticated, isLoading, user, router, superheroId]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && superheroId) {
      fetchSuperhero();
    }
  }, [isAuthenticated, user, superheroId]);

  const fetchSuperhero = async () => {
    try {
      setLoading(true);
      const response = await superheroAPI.getById(superheroId);
      if (response.data.status === 'success' && response.data.data) {
        setSuperhero(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load superhero details');
      router.push(`/heroes/${superheroId}`);
    } finally {
      setLoading(false);
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
        router.push(`/heroes/${superheroId}`);
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

  if (!isAuthenticated || user?.role !== 'admin' || !superhero) {
    return null;
  }

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
      <div className="max-w-4xl mx-auto">
        <BackButton href={`/heroes/${superheroId}`} label="Back to Superhero Details" />

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
                  <Link href={`/heroes/${superheroId}`}>
                    <Button
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </Link>
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
      </div>
    </div>
  );
}
