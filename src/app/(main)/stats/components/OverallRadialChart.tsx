'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

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

        const sleepHours = sleepData?.total_hours ? parseFloat(sleepData.total_hours) : 0;
        const sleepPercent = Math.min(
          (sleepHours / (sleepGoal?.target_hours || 8)) * 100,
          100
        );

        // Nutrición - CORREGIDO
        const { data: nutritionData } = await supabase
          .from('nutrition_entries')
          .select('is_healthy')
          .eq('user_id', userId)
          .eq('entry_date', today);

        const { data: nutritionGoal } = await supabase
          .from('nutrition_goals')
          .select('nutrition_goal_meals')
          .eq('user_id', userId)
          .single();

        const healthyMeals = (nutritionData || []).filter((m) => m.is_healthy).length;
        const goalMeals = nutritionGoal?.nutrition_goal_meals || 3;
        const nutritionPercent = Math.min((healthyMeals / goalMeals) * 100, 100);

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

  const categories = [
    { name: 'Ejercicio', value: stats.exercise, color: '#3730a3' },
    { name: 'Hidratación', value: stats.hydration, color: '#1d4ed8' },
    { name: 'Sueño', value: stats.sleep, color: '#6b21a8' },
    { name: 'Nutrición', value: stats.nutrition, color: '#166534' },
  ];

  const averageScore = Math.round(
    categories.reduce((sum, cat) => sum + cat.value, 0) / categories.length
  );

  // Calcular puntos para el polígono del radar
  const calculatePoint = (index: number, value: number, maxRadius: number) => {
    const angle = (index * 90 * Math.PI) / 180; // 4 categorías = 90° cada una
    const radius = (value / 100) * maxRadius;
    return {
      x: 100 + radius * Math.cos(angle),
      y: 100 + radius * Math.sin(angle)
    };
  };

  const maxRadius = 80;

  return (
    <Card>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg">Progreso Diario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          {/* Radar Chart Container */}
          <div className="relative w-64 h-64 mx-auto">
            <svg width="256" height="256" viewBox="0 0 200 200" className="absolute inset-0">
              {/* Grid Circles */}
              <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              <circle cx="100" cy="100" r="20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Category Lines */}
              {categories.map((_, index) => {
                const angle = (index * 90 * Math.PI) / 180;
                const x = 100 + 60 * Math.cos(angle);
                const y = 100 + 60 * Math.sin(angle);
                return (
                  <line
                    key={index}
                    x1="100"
                    y1="100"
                    x2={x}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Radar Area */}
              <polygon
                points={categories.map((cat, index) => {
                  const point = calculatePoint(index, cat.value, maxRadius);
                  return `${point.x},${point.y}`;
                }).join(' ')}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* Data Points */}
              {categories.map((cat, index) => {
                const point = calculatePoint(index, cat.value, maxRadius);
                return (
                  <g key={cat.name}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={cat.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={point.x}
                      y={point.y - 8}
                      textAnchor="middle"
                      className="text-xs font-bold"
                      fill="#374151"
                    >
                      {/*{cat.value}%*/}
                    </text>
                  </g>
                );
              })}

              {/* Category Labels */}
              {categories.map((cat, index) => {
                const angle = (index * 90 * Math.PI) / 180;
                const radius = 75;
                const x = 100 + radius * Math.cos(angle);
                const y = 100 + radius * Math.sin(angle);
                
                // Determinar textAnchor basado en la posición
                let textAnchor: "start" | "middle" | "end" = "middle";
                if (index === 1) textAnchor = "start";
                if (index === 3) textAnchor = "end";

                // Ajustar posición vertical
                let dy = 0;
                if (index === 0) dy = -8;
                if (index === 2) dy = 12;

                return (
                  <text
                    key={cat.name}
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dy={dy}
                    className="text-xs font-medium"
                    fill="#4b5563"
                  >
                    {cat.name}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Trend Information */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              Vista general de rendimiento
            </div>
            <p className="text-xs text-gray-500">
              Secciones de salud y bienestar evaluadas hoy
            </p>
          </div>

          {/* Average Score */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
            <p className="text-xs text-gray-500">En relacion a tus metas</p>
          </div>

          {/* Mini Legend */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-gray-600">{cat.name}</span>
                <span className="font-bold text-gray-900 ml-auto">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}