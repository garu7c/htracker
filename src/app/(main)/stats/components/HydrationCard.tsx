'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplets } from 'lucide-react';

interface HydrationStats {
  current: number;
  goal: number;
  streak: number;
}

export default function HydrationCard({ userId }: { userId: string }) {
  const supabase = createClient();
  const [stats, setStats] = useState<HydrationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Obtener cantidad de agua de hoy
        const { data: todayData } = await supabase
          .from('hydration_entries')
          .select('quantity')
          .eq('user_id', userId)
          .eq('entry_date', today);

        const totalToday = (todayData || []).reduce((sum, e) => sum + e.quantity, 0);

        // Obtener meta
        const { data: goalData } = await supabase
          .from('hydration_goals')
          .select('cups_per_day')
          .eq('user_id', userId)
          .single();

        // Calcular racha
        let streak = 0;
        if (totalToday >= (goalData?.cups_per_day || 8)) {
          streak = 1;
          const dayMs = 24 * 60 * 60 * 1000;
          let checkDate = new Date(today);

          for (let i = 1; i <= 30; i++) {
            checkDate.setTime(checkDate.getTime() - dayMs);
            const dateStr = checkDate.toISOString().split('T')[0];

            const { data } = await supabase
              .from('hydration_entries')
              .select('quantity')
              .eq('user_id', userId)
              .eq('entry_date', dateStr);

            const dayTotal = (data || []).reduce((sum, e) => sum + e.quantity, 0);
            if (dayTotal >= (goalData?.cups_per_day || 8)) {
              streak++;
            } else {
              break;
            }
          }
        }

        setStats({
          current: totalToday,
          goal: goalData?.cups_per_day || 8,
          streak,
        });
      } catch (err) {
        console.error('Error loading hydration stats:', err);
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
          <CardTitle>Hidratación</CardTitle>
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
          <CardTitle>Hidratación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = (stats.current / stats.goal) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-600" />
              Hidratación
            </CardTitle>
            <CardDescription>Vasos de agua</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-cyan-600">{Math.round(progressPercent)}%</p>
            <p className="text-xs text-gray-500">completado</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{stats.current} / {stats.goal} vasos</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyan-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Racha</p>
            <p className="text-2xl font-bold text-cyan-600">{stats.streak}</p>
            <p className="text-xs text-gray-500">días</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Faltante</p>
            <p className="text-2xl font-bold text-cyan-600">{Math.max(0, stats.goal - stats.current)}</p>
            <p className="text-xs text-gray-500">vasos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
