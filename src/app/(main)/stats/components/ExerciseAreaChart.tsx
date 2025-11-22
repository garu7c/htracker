'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyData {
  date: string;
  minutes: number;
  day: string;
}

export default function ExerciseAreaChart({ userId }: { userId: string }) {
  const supabase = createClient();
  const [data, setData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeeklyData() {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const { data: entries } = await supabase
          .from('exercise_entries')
          .select('entry_date, duration_minutes')
          .eq('user_id', userId)
          .gte('entry_date', weekAgo)
          .order('entry_date', { ascending: true });

        // Agrupar por fecha
        const grouped: Record<string, number> = {};
        (entries || []).forEach((entry) => {
          grouped[entry.entry_date] = (grouped[entry.entry_date] || 0) + entry.duration_minutes;
        });

        // Crear array de últimos 7 días
        const weekData: WeeklyData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          const day = date.toLocaleDateString('es-ES', { weekday: 'short' });
          
          weekData.push({
            date: dateStr,
            minutes: grouped[dateStr] || 0,
            day: day.charAt(0).toUpperCase() + day.slice(1),
          });
        }

        setData(weekData);
      } catch (err) {
        console.error('Error loading weekly data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWeeklyData();
  }, [userId, supabase]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ejercicio Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  const maxMinutes = Math.max(...data.map((d) => d.minutes), 30);
  const chartHeight = 200;

  // Calcular puntos para el SVG con mejor escalado
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.minutes / maxMinutes) * 85; // Dejar espacio arriba
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ejercicio Semanal</CardTitle>
        <CardDescription>Últimos 7 días</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div style={{ height: chartHeight }}>
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Área bajo la curva */}
              <path
                d={areaD}
                fill="url(#gradient)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Línea del gráfico */}
              <polyline
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
              />

              {/* Puntos */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="1.5"
                  fill="#3b82f6"
                />
              ))}
            </svg>
          </div>

          {/* Leyenda con valores */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {data.map((d, i) => (
              <div key={i} className="bg-blue-50 p-2 rounded">
                <p className="font-semibold text-gray-700">{d.day}</p>
                <p className="text-blue-600 font-bold">{d.minutes}m</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
