'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { getTexts } from '@/lib/i18n';
import ExercisesCard from './components/ExercisesCard';
import HydrationCard from './components/HydrationCard';
import SleepCard from './components/SleepCard';
import NutritionCard from './components/NutritionCard';

export default function StatsPage() {
  const t = getTexts();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          console.error('Failed to get user:', error);
          setUserId(null);
        } else {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error('Error getting user:', err);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8">
        <p className="text-red-600">
          Error: Could not load user. Please log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{t.pages.stats.title}</h1>
        <p className="mt-2 text-gray-600">{t.pages.stats.description}</p>
      </div>

      {/* Stats Grid - Distribución como en la referencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda - Ejercicio (más grande) */}
        <div className="md:col-span-2 lg:col-span-1">
          <ExercisesCard userId={userId} />
        </div>

        {/* Columna derecha superior - Hidratación */}
        <div>
          <HydrationCard userId={userId} />
        </div>

        {/* Fila inferior - Sueño y Nutrición */}
        <div>
          <SleepCard userId={userId} />
        </div>

        <div>
          <NutritionCard userId={userId} />
        </div>
      </div>
    </div>
  );
}