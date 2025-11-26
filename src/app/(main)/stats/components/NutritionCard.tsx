'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Utensils, TrendingUp } from 'lucide-react';
import { PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

interface NutritionStats {
  healthyMeals: number;
  totalMeals: number;
  goalMeals: number;
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

        // Obtener meta de nutrición (número de comidas saludables objetivo)
        const { data: goalData } = await supabase
          .from('nutrition_goals')
          .select('nutrition_goal_meals')
          .eq('user_id', userId)
          .single();

        // Meta por defecto: 3 comidas saludables
        const goalMeals = goalData?.nutrition_goal_meals || 3;

        setStats({
          healthyMeals,
          totalMeals,
          goalMeals,
        });
      } catch (err) {
        console.error('Error loading nutrition stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [userId]);

  if (loading) {
    return (
      <Card className="flex flex-col relative overflow-hidden">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2 text-xs text-green-800">
            <Utensils className="h-3 w-3" />
            Nutrición
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="flex flex-col relative overflow-hidden">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2 text-xs text-green-800">
            <Utensils className="h-3 w-3" />
            Nutrición
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular el progreso basado en el número de comidas saludables vs la meta
  const progressPercent = Math.min(100, Math.round((stats.healthyMeals / stats.goalMeals) * 100));

  const chartData = [
    { 
      name: 'Total', 
      current: Math.min(stats.healthyMeals, stats.goalMeals), 
      remaining: Math.max(0, stats.goalMeals - stats.healthyMeals),
      total: stats.goalMeals 
    },
  ];

  return (
    <Card className="flex flex-col relative overflow-hidden">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2 text-xs text-green-800">
          <Utensils className="h-3 w-3" />
          Nutrición
        </CardTitle>
        <CardDescription className="text-xs">
          {stats.healthyMeals}/{stats.totalMeals} comidas saludables
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-1 items-center justify-center pt-0 pb-12">
        <div className="mx-auto aspect-square w-full max-w-[160px]">
          <RadialBarChart
            width={160}
            height={160}
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
            <RadialBar
              dataKey="remaining"
              stackId="a"
              cornerRadius={5}
              fill="#dcfce7" // green-100
            />
            <RadialBar
              dataKey="current"
              stackId="a"
              cornerRadius={5}
              fill="#166534" // green-800
            />
            
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-bold"
              fill="#166534"
            >
              {progressPercent}%
            </text>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs"
              fill="#6b7280"
            >
              Completado
            </text>
          </RadialBarChart>
        </div>
      </CardContent>

      <CardFooter className="absolute bottom-0 left-0 right-0 flex-col gap-1 text-xs pb-3 bg-background">
        <div className="flex items-center gap-1 leading-none font-medium text-xs">
          Meta <TrendingUp className="h-3 w-3" />
        </div>
        <div className="text-muted-foreground leading-none text-xs">
          {stats.goalMeals} comidas saludables
        </div>
      </CardFooter>
    </Card>
  );
}