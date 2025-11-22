'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OverallStats {
  exercise: number;
  hydration: number;
  sleep: number;
  nutrition: number;
}

export default function OverallRadialChart({ userId }: { userId: string }) {
  const supabase = createClient();
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Ejercicio
        const { data: exerciseData } = await supabase
          .from('exercise_entries')
          .select('duration_minutes')
          .eq('user_id', userId)
          .eq('entry_date', today);

        const { data: exerciseGoal } = await supabase
          .from('user_exercise_goals')
          .select('exercise_goal_duration')
          .eq('user_id', userId)
          .single();

        const exerciseMin = (exerciseData || []).reduce((sum, e) => sum + e.duration_minutes, 0);
        const exercisePercent = Math.min(
          (exerciseMin / (exerciseGoal?.exercise_goal_duration || 30)) * 100,
          100
        );

        // Hidratación
        const { data: hydrationData } = await supabase
          .from('hydration_entries')
          .select('quantity')
          .eq('user_id', userId)
          .eq('entry_date', today);

        const { data: hydrationGoal } = await supabase
          .from('hydration_goals')
          .select('cups_per_day')
          .eq('user_id', userId)
          .single();

        const hydrationTotal = (hydrationData || []).reduce((sum, e) => sum + e.quantity, 0);
        const hydrationPercent = Math.min(
          (hydrationTotal / (hydrationGoal?.cups_per_day || 8)) * 100,
          100
        );

        // Sueño
        const { data: sleepData } = await supabase
          .from('sleep_entries')
          .select('total_hours')
          .eq('user_id', userId)
          .eq('sleep_date', today)
          .single();

        const { data: sleepGoal } = await supabase
          .from('sleep_goals')
          .select('target_hours')
          .eq('user_id', userId)
          .single();

        const sleepPercent = Math.min(
          ((sleepData?.total_hours || 0) / (sleepGoal?.target_hours || 8)) * 100,
          100
        );

        // Nutrición
        const { data: nutritionData } = await supabase
          .from('nutrition_entries')
          .select('is_healthy')
          .eq('user_id', userId)
          .eq('entry_date', today);

        const totalMeals = nutritionData?.length || 0;
        const healthyMeals = (nutritionData || []).filter((m) => m.is_healthy).length;
        const nutritionPercent = totalMeals > 0 ? (healthyMeals / totalMeals) * 100 : 0;

        setStats({
          exercise: Math.round(exercisePercent),
          hydration: Math.round(hydrationPercent),
          sleep: Math.round(sleepPercent),
          nutrition: Math.round(nutritionPercent),
        });
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [userId, supabase]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen General</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const sections = [
    { label: 'Ejercicio', value: stats.exercise, color: '#3b82f6', startAngle: 0 },
    { label: 'Hidratación', value: stats.hydration, color: '#06b6d4', startAngle: 90 },
    { label: 'Sueño', value: stats.sleep, color: '#a855f7', startAngle: 180 },
    { label: 'Nutrición', value: stats.nutrition, color: '#f59e0b', startAngle: 270 },
  ];

  const totalValue = 100;
  const circumference = 2 * Math.PI * 45;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen General</CardTitle>
        <CardDescription>Progreso de hoy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          {/* Donut Chart */}
          <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
            <circle cx="100" cy="100" r="45" fill="none" stroke="#f3f4f6" strokeWidth="12" />

            {/* Ejercicio */}
            <circle
              cx="100"
              cy="100"
              r="35"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray={`${(stats.exercise / 100) * circumference} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />

            {/* Hidratación */}
            <circle
              cx="100"
              cy="100"
              r="35"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="8"
              strokeDasharray={`${(stats.hydration / 100) * circumference} ${circumference}`}
              strokeDashoffset={`-${(stats.exercise / 100) * circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />

            {/* Sueño */}
            <circle
              cx="100"
              cy="100"
              r="35"
              fill="none"
              stroke="#a855f7"
              strokeWidth="8"
              strokeDasharray={`${(stats.sleep / 100) * circumference} ${circumference}`}
              strokeDashoffset={`-${((stats.exercise + stats.hydration) / 100) * circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />

            {/* Nutrición */}
            <circle
              cx="100"
              cy="100"
              r="35"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeDasharray={`${(stats.nutrition / 100) * circumference} ${circumference}`}
              strokeDashoffset={`-${((stats.exercise + stats.hydration + stats.sleep) / 100) * circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />

            {/* Centro del donut */}
            <circle cx="100" cy="100" r="22" fill="white" />
            <text x="100" y="100" textAnchor="middle" dy="0.3em" className="text-xs font-bold fill-gray-900">
              {Math.round((stats.exercise + stats.hydration + stats.sleep + stats.nutrition) / 4)}%
            </text>
          </svg>

          {/* Leyenda */}
          <div className="w-full space-y-1">
            {sections.map((section) => (
              <div key={section.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: section.color }}
                  />
                  <span className="text-gray-700">{section.label}</span>
                </div>
                <span className="font-bold text-gray-900">{section.value}%</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">Promedio general: {Math.round((stats.exercise + stats.hydration + stats.sleep + stats.nutrition) / 4)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
