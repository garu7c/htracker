'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

interface DailyProgress {
  current: number;
  goal: number;
}

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
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Obtener datos de hoy
        const { data: todayData } = await supabase
          .from('exercise_entries')
          .select('duration_minutes')
          .eq('user_id', userId)
          .eq('entry_date', today);

        const totalToday = (todayData || []).reduce((sum, e) => sum + e.duration_minutes, 0);

        // Obtener datos de la semana
        const { data: weekData } = await supabase
          .from('exercise_entries')
          .select('duration_minutes')
          .eq('user_id', userId)
          .gte('entry_date', weekAgo);

        const weekTotal = (weekData || []).reduce((sum, e) => sum + e.duration_minutes, 0);
        const avgPerSession = weekData && weekData.length > 0 ? Math.round(weekTotal / weekData.length) : 0;

        // Obtener meta
        const { data: goalData } = await supabase
          .from('user_exercise_goals')
          .select('exercise_goal_duration')
          .eq('user_id', userId)
          .single();

        setStats({
          progress: {
            current: totalToday,
            goal: goalData?.exercise_goal_duration || 30,
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
  }, [userId]);

  if (loading) {
    return (
      <Card className="flex flex-col relative overflow-hidden">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2 text-xs text-indigo-800">
            <TrendingUp className="h-3 w-3" />
            Ejercicio
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
          <CardTitle className="flex items-center gap-2 text-xs text-indigo-800">
            <TrendingUp className="h-3 w-3" />
            Ejercicio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = Math.min(100, Math.round((stats.progress.current / stats.progress.goal) * 100));

  const chartData = [
    { 
      name: "Total", 
      current: Math.min(stats.progress.current, stats.progress.goal), 
      remaining: Math.max(0, stats.progress.goal - stats.progress.current),
      total: stats.progress.goal,
    }
  ];

  return (
    <Card className="flex flex-col relative overflow-hidden"> 
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2 text-xs text-indigo-800">
          <TrendingUp className="h-3 w-3" />
          Ejercicio
        </CardTitle>
        <CardDescription className="text-xs">
          Progreso de hoy: {stats.progress.current} min
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
              fill="#e0e7ff" // indigo-100
            />
            <RadialBar
              dataKey="current"
              stackId="a"
              cornerRadius={5}
              fill="#3730a3" // indigo-800
            />
            
            {/* Etiqueta del porcentaje */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-bold fill-indigo-800"
            >
              {progressPercent}%
            </text>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-500"
            >
              Completado
            </text>
          </RadialBarChart>
        </div>
      </CardContent>

      <CardFooter className="absolute bottom-0 left-0 right-0 flex-col gap-1 text-xs pb-3 bg-background">
        <div className="flex items-center gap-1 leading-none font-medium text-xs">
          Promedio Semanal <TrendingUp className="h-3 w-3" />
        </div>
        <div className="text-muted-foreground leading-none text-xs">
          {stats.averagePerSession} min/sesión
        </div>
      </CardFooter>
    </Card>
  );
}