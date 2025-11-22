'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { DailyProgress } from '@/types/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface ExerciseStats {
  progress: DailyProgress;
  weekTotal: number;
  averagePerSession: number;
}

export default function ExercisesCard({ userId }: { userId: string }) {
  const supabase = createClient();
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Obtener progreso de hoy
        const { data: todayData } = await supabase
          .from('exercise_entries')
          .select('duration_minutes')
          .eq('user_id', userId)
          .eq('entry_date', today);

        const totalToday = (todayData || []).reduce((sum, e) => sum + e.duration_minutes, 0);

        // Obtener datos de la semana
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const { data: weekData } = await supabase
          .from('exercise_entries')
          .select('duration_minutes')
          .eq('user_id', userId)
          .gte('entry_date', weekAgo);

        const weekTotal = (weekData || []).reduce((sum, e) => sum + e.duration_minutes, 0);
        const avgPerSession = weekData && weekData.length > 0 ? Math.round(weekTotal / weekData.length) : 0;

        // Obtener meta del usuario
        const { data: goalData } = await supabase
          .from('user_exercise_goals')
          .select('exercise_goal_duration, current_streak_exercise')
          .eq('user_id', userId)
          .single();

        setStats({
          progress: {
            current: totalToday,
            goal: goalData?.exercise_goal_duration || 30,
            streak: goalData?.current_streak_exercise || 0,
          },
          weekTotal,
          averagePerSession: avgPerSession,
        });
      } catch (err) {
        console.error('Error loading exercise stats:', err);
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
          <CardTitle>Ejercicio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ejercicio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = (stats.progress.current / stats.progress.goal) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Ejercicio
            </CardTitle>
            <CardDescription>Progreso de hoy</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{Math.round(progressPercent)}%</p>
            <p className="text-xs text-gray-500">completado</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{stats.progress.current} / {stats.progress.goal} min</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Racha</p>
            <p className="text-2xl font-bold text-blue-600">{stats.progress.streak}</p>
            <p className="text-xs text-gray-500">días</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Promedio semanal</p>
            <p className="text-2xl font-bold text-blue-600">{stats.averagePerSession}</p>
            <p className="text-xs text-gray-500">min/sesión</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
