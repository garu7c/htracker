import React from 'react';
import { getHydrationDashboardData, getUserHydrationGoals } from './actions'
import HydrationGoalsForm from './components/HydrationGoalsForm';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Droplets } from 'lucide-react';

export default async function HydrationPage() {
  const [data, goals] = await Promise.all([getHydrationDashboardData(), getUserHydrationGoals()]);

  if (!data || !goals) return <div className="p-8">Error al cargar los datos</div>;

  const { progress } = data;
  const progressValue = progress.goal ? (progress.current / progress.goal) * 100 : 0;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        <span className="mr-2 text-blue-600">💧</span> Hidratación
      </h1>

      <Card className="bg-sky-50 border-sky-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-700">
            <Droplets className="h-4 w-4" /> Progreso de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-3xl font-bold text-sky-800">{progress.current}/{progress.goal}</div>
              <div className="text-sm text-sky-600">vasos aproximados</div>
            </div>
          </div>
          <Progress value={Math.min(progressValue, 100)} className="w-full h-3 [&>*]:bg-sky-500 mt-3" />
        </CardContent>
      </Card>

      <HydrationGoalsForm initial={goals.ml_per_day ?? 2000} />
    </div>
  );
}