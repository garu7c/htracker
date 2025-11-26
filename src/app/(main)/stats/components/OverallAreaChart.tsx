'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { getTexts } from '@/lib/i18n';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Estructura de datos para un día
interface DailyStats {
  date: string;
  day: string;
  exercise_minutes: number;
  nutrition_healthy_meals: number; // Nueva métrica: # de comidas saludables
  sleep_hours: number;
  hydration_quantity: number; // Nueva métrica: cantidad de bebida (vasos/ml)
}

// Colores basados en tu solicitud
const COLORS = {
  exercise: '#3730a3', // indigo-800
  nutrition: '#14532d', // green-800
  sleep: '#581c87', // purple-800
  hydration: '#1d4ed8', // blue-700
};

export default function OverallAreaChart({ userId }: { userId: string }) {
  const t = getTexts();
  const supabase = createClient();
  const [data, setData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeeklyData() {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // ------------------------------------------------------------------
        // 1. Ejercicio (OK: entry_date, duration_minutes)
        // ------------------------------------------------------------------
        const { data: exerciseEntries } = await supabase
          .from('exercise_entries')
          .select('entry_date, duration_minutes')
          .eq('user_id', userId)
          .gte('entry_date', weekAgo);

        // ------------------------------------------------------------------
        // 2. Nutrición (Ajuste: entry_date, is_healthy)
        // ------------------------------------------------------------------
        const { data: nutritionEntries } = await supabase
          .from('nutrition_entries') 
          .select('entry_date, is_healthy') 
          .eq('user_id', userId)
          .gte('entry_date', weekAgo);
        
        // ------------------------------------------------------------------
        // 3. Sueño (Ajuste: sleep_date, total_hours)
        // ------------------------------------------------------------------
        const { data: sleepEntries } = await supabase
          .from('sleep_entries')
          .select('sleep_date, total_hours') // Usar 'sleep_date' y 'total_hours'
          .eq('user_id', userId)
          .gte('sleep_date', weekAgo);

        // ------------------------------------------------------------------
        // 4. Hidratación (Ajuste: entry_date, quantity)
        // ------------------------------------------------------------------
        const { data: hydrationEntries } = await supabase
          .from('hydration_entries')
          .select('entry_date, quantity') // Usar 'quantity'
          .eq('user_id', userId)
          .gte('entry_date', weekAgo);

        // Agrupar y combinar todos los datos por fecha
        const combinedData: Record<string, DailyStats> = {};
        
        // Inicializar datos para los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const day = date.toLocaleDateString('es-ES', { weekday: 'short' });
            
            combinedData[dateStr] = {
                date: dateStr,
                day: day.charAt(0).toUpperCase() + day.slice(1),
                exercise_minutes: 0,
                nutrition_healthy_meals: 0,
                sleep_hours: 0,
                hydration_quantity: 0,
            };
        }

        // Mapear Ejercicio
        (exerciseEntries || []).forEach((entry) => {
            combinedData[entry.entry_date].exercise_minutes += entry.duration_minutes;
        });
        
        // Mapear Nutrición (Contar comidas saludables)
        (nutritionEntries || []).forEach((entry) => {
            if (entry.is_healthy) { // Solo si 'is_healthy' es true
                 combinedData[entry.entry_date].nutrition_healthy_meals += 1;
            }
        });

        // Mapear Sueño (Usar sleep_date)
        (sleepEntries || []).forEach((entry) => {
             // Usar 'sleep_date' para mapear los datos de sueño
            combinedData[entry.sleep_date].sleep_hours += entry.total_hours; 
        });

        // Mapear Hidratación
        (hydrationEntries || []).forEach((entry) => {
            combinedData[entry.entry_date].hydration_quantity += entry.quantity;
        });
        

        setData(Object.values(combinedData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

      } catch (err) {
        console.error('Error loading weekly data:', err);
        // Si hay errores 406, podrías verlos aquí
      } finally {
        setLoading(false);
      }
    }

    loadWeeklyData();
  }, [userId, supabase]);

  // ... (El resto del código de Recharts, Tooltip y renderizado permanece igual)
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Cargando datos de actividad...</p>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (data.every(d => d.exercise_minutes === 0 && d.nutrition_healthy_meals === 0 && d.sleep_hours === 0 && d.hydration_quantity === 0)) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Progreso Semanal</CardTitle>
          <CardDescription>Gráfico de áreas del progreso de las actividades realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">No hay datos de actividad para la última semana.</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progreso Semanal de Hábitos</CardTitle>
        <CardDescription className="text-sm">Gráfico de áreas del progreso de las actividades realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Día: ${label}`}
              />
              <Legend />

              {/* Ejercicio: indigo-800 */}
              <Area 
                type="monotone" 
                dataKey="exercise_minutes" 
                stackId="1"
                stroke={COLORS.exercise} 
                fill={COLORS.exercise} 
                name="Ejercicio (min)"
                unit=" min"
              />

              {/* Alimentación: green-800 */}
              <Area 
                type="monotone" 
                dataKey="nutrition_healthy_meals" // Actualizado
                stackId="1" 
                stroke={COLORS.nutrition} 
                fill={COLORS.nutrition} 
                name="Alimentación (# comidas)"
                unit=" comidas"
              />

              {/* Sueño: purple-800 */}
              <Area 
                type="monotone" 
                dataKey="sleep_hours" // Actualizado
                stackId="1" 
                stroke={COLORS.sleep} 
                fill={COLORS.sleep} 
                name="Sueño (horas)"
                unit=" h"
              />
              
              {/* Hidratación: blue-700 */}
              <Area 
                type="monotone" 
                dataKey="hydration_quantity" // Actualizado
                stackId="1" 
                stroke={COLORS.hydration} 
                fill={COLORS.hydration} 
                name="Hidratación (cantidad)"
                unit=" cant."
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}