'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Droplets, Moon, Utensils } from 'lucide-react';

interface DayActivity {
  exercise: Array<{ type: string; duration: number; intensity: string }>;
  hydration: Array<{ quantity: number }>;
  sleep: { hours: number; quality: string } | null;
  nutrition: Array<{ description: string; healthy: boolean }>;
}

interface DayActivitiesProps {
  userId: string;
  selectedDate: string;
}

export default function DayActivities({ userId, selectedDate }: DayActivitiesProps) {
  const supabase = createClient();
  const [activities, setActivities] = useState<DayActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      setLoading(true);
      try {
        // Ejercicios
        const { data: exerciseData } = await supabase
          .from('exercise_entries')
          .select('exercise_type, duration_minutes, intensity')
          .eq('user_id', userId)
          .eq('entry_date', selectedDate);

        // Hidratación
        const { data: hydrationData } = await supabase
          .from('hydration_entries')
          .select('quantity')
          .eq('user_id', userId)
          .eq('entry_date', selectedDate);

        // Sueño
        const { data: sleepData } = await supabase
          .from('sleep_entries')
          .select('total_hours, quality')
          .eq('user_id', userId)
          .eq('sleep_date', selectedDate)
          .single();

        // Nutrición
        const { data: nutritionData } = await supabase
          .from('nutrition_entries')
          .select('description, is_healthy')
          .eq('user_id', userId)
          .eq('entry_date', selectedDate);

        setActivities({
          exercise: (exerciseData || []).map((e) => ({
            type: e.exercise_type,
            duration: e.duration_minutes,
            intensity: e.intensity,
          })),
          hydration: (hydrationData || []).map((h) => ({
            quantity: h.quantity,
          })),
          sleep: sleepData ? {
            hours: sleepData.total_hours,
            quality: sleepData.quality,
          } : null,
          nutrition: (nutritionData || []).map((n) => ({
            description: n.description,
            healthy: n.is_healthy,
          })),
        });
      } catch (err) {
        console.error('Error loading day activities:', err);
        setActivities({
          exercise: [],
          hydration: [],
          sleep: null,
          nutrition: [],
        });
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, [userId, selectedDate, supabase]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!activities) {
    return null;
  }

  const hasAnyActivity =
    activities.exercise.length > 0 ||
    activities.hydration.length > 0 ||
    activities.sleep ||
    activities.nutrition.length > 0;

  const selectedDateObj = new Date(selectedDate);
  const formattedDate = selectedDateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividades</CardTitle>
        <CardDescription className="capitalize">{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAnyActivity ? (
          <p className="text-sm text-gray-500 text-center py-4">No hay actividades registradas para este día</p>
        ) : (
          <div className="space-y-4">
            {/* Ejercicio */}
            {activities.exercise.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Dumbbell className="h-4 w-4 text-blue-600" />
                  Ejercicio ({activities.exercise.length})
                </div>
                <div className="space-y-1 ml-6">
                  {activities.exercise.map((ex, idx) => (
                    <div key={idx} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                      <p className="font-medium">{ex.type}</p>
                      <p className="text-xs text-gray-600">{ex.duration}m - {ex.intensity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hidratación */}
            {activities.hydration.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Droplets className="h-4 w-4 text-cyan-600" />
                  Hidratación
                </div>
                <div className="text-sm text-gray-700 bg-cyan-50 p-2 rounded ml-6">
                  <p className="font-medium">{activities.hydration.length} vasos</p>
                </div>
              </div>
            )}

            {/* Sueño */}
            {activities.sleep && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Moon className="h-4 w-4 text-purple-600" />
                  Sueño
                </div>
                <div className="text-sm text-gray-700 bg-purple-50 p-2 rounded ml-6">
                  <p className="font-medium">{activities.sleep.hours.toFixed(1)} horas</p>
                  <p className="text-xs text-gray-600 capitalize">Calidad: {activities.sleep.quality}</p>
                </div>
              </div>
            )}

            {/* Nutrición */}
            {activities.nutrition.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Utensils className="h-4 w-4 text-amber-600" />
                  Nutrición ({activities.nutrition.length})
                </div>
                <div className="space-y-1 ml-6">
                  {activities.nutrition.map((nut, idx) => (
                    <div
                      key={idx}
                      className={`text-sm p-2 rounded ${
                        nut.healthy ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      <p className="text-xs">{nut.description}</p>
                      <p className="text-xs font-medium">{nut.healthy ? '✓ Saludable' : '⚠ Regular'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
