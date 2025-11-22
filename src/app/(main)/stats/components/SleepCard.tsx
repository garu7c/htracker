'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Moon } from 'lucide-react';

interface SleepStats {
  current: number;
  goal: number;
  streak: number;
  quality: string;
}

export default function SleepCard({ userId }: { userId: string }) {
  const supabase = createClient();
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Obtener entrada de sueño de hoy
        const { data: todayData } = await supabase
          .from('sleep_entries')
          .select('total_hours, quality')
          .eq('user_id', userId)
          .eq('sleep_date', today)
          .single();

        // Obtener meta
        const { data: goalData } = await supabase
          .from('sleep_goals')
          .select('target_hours')
          .eq('user_id', userId)
          .single();

        // Calcular racha
        let streak = 0;
        if (todayData?.total_hours) {
          const targetHours = goalData?.target_hours || 8;
          if (todayData.total_hours >= targetHours) {
            streak = 1;
            const dayMs = 24 * 60 * 60 * 1000;
            let checkDate = new Date(today);

            for (let i = 1; i <= 30; i++) {
              checkDate.setTime(checkDate.getTime() - dayMs);
              const dateStr = checkDate.toISOString().split('T')[0];

              const { data } = await supabase
                .from('sleep_entries')
                .select('total_hours')
                .eq('user_id', userId)
                .eq('sleep_date', dateStr)
                .single();

              if (data?.total_hours && data.total_hours >= targetHours) {
                streak++;
              } else {
                break;
              }
            }
          }
        }

        const currentHours = todayData?.total_hours || 0;
        const goalHours = goalData?.target_hours || 8;

        setStats({
          current: currentHours,
          goal: goalHours,
          streak,
          quality: todayData?.quality || 'N/A',
        });
      } catch (err) {
        console.error('Error loading sleep stats:', err);
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
          <CardTitle>Sueño</CardTitle>
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
          <CardTitle>Sueño</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = (stats.current / stats.goal) * 100;

  const qualityColor = {
    excelente: 'text-green-600 bg-green-50',
    buena: 'text-blue-600 bg-blue-50',
    regular: 'text-yellow-600 bg-yellow-50',
    mala: 'text-red-600 bg-red-50',
    'N/A': 'text-gray-600 bg-gray-50',
  }[stats.quality] || 'text-gray-600 bg-gray-50';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Moon className="h-4 w-4 text-purple-600" />
              Sueño
            </CardTitle>
            <CardDescription className="text-xs">Horas de sueño</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">{Math.round(progressPercent)}%</p>
            <p className="text-xs text-gray-500">completado</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{stats.current.toFixed(1)} / {stats.goal} h</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 p-2 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Racha</p>
            <p className="text-lg font-bold text-purple-600">{stats.streak}</p>
            <p className="text-xs text-gray-500">días</p>
          </div>
          <div className={`p-2 rounded-lg ${qualityColor}`}>
            <p className="text-xs text-gray-600 mb-1">Calidad</p>
            <p className="text-sm font-bold capitalize">{stats.quality}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
