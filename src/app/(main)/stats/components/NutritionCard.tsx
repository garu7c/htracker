'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Utensils } from 'lucide-react';

interface NutritionStats {
  healthyMeals: number;
  totalMeals: number;
  streak: number;
}

export default function NutritionCard({ userId }: { userId: string }) {
  const supabase = createClient();
  const [stats, setStats] = useState<NutritionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Obtener comidas de hoy
        const { data: todayData } = await supabase
          .from('nutrition_entries')
          .select('is_healthy')
          .eq('user_id', userId)
          .eq('entry_date', today);

        const totalMeals = todayData?.length || 0;
        const healthyMeals = (todayData || []).filter((m) => m.is_healthy).length;

        // Calcular racha
        let streak = 0;
        if (healthyMeals > 0) {
          streak = 1;
          const dayMs = 24 * 60 * 60 * 1000;
          let checkDate = new Date(today);

          for (let i = 1; i <= 30; i++) {
            checkDate.setTime(checkDate.getTime() - dayMs);
            const dateStr = checkDate.toISOString().split('T')[0];

            const { data } = await supabase
              .from('nutrition_entries')
              .select('is_healthy')
              .eq('user_id', userId)
              .eq('entry_date', dateStr);

            const dayHealthyCount = (data || []).filter((m) => m.is_healthy).length;
            if (dayHealthyCount > 0) {
              streak++;
            } else {
              break;
            }
          }
        }

        setStats({
          healthyMeals,
          totalMeals,
          streak,
        });
      } catch (err) {
        console.error('Error loading nutrition stats:', err);
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
          <CardTitle>Nutrición</CardTitle>
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
          <CardTitle>Nutrición</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = stats.totalMeals > 0 ? (stats.healthyMeals / stats.totalMeals) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Utensils className="h-4 w-4 text-amber-600" />
              Nutrición
            </CardTitle>
            <CardDescription className="text-xs">Comidas saludables</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-600">{Math.round(progressPercent)}%</p>
            <p className="text-xs text-gray-500">completado</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{stats.healthyMeals} / {stats.totalMeals} comidas</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 p-2 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Racha</p>
            <p className="text-lg font-bold text-amber-600">{stats.streak}</p>
            <p className="text-xs text-gray-500">días</p>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Total comidas</p>
            <p className="text-lg font-bold text-amber-600">{stats.totalMeals}</p>
            <p className="text-xs text-gray-500">hoy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
