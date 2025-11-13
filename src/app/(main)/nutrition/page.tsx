import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Clock, Plus, Target } from 'lucide-react';
import { getNutritionDashboardData, getUserNutritionGoals } from './actions';
import AddMealForm from './components/AddMealForm';
import NutritionGoalsForm from './components/NutritionGoalsForm';

const HistorialComidas = ({ entries }: { entries: any[] }) => {
  const emojiFor = (meal: string) => {
    const m = String(meal).toLowerCase();
    if (m.includes('desay')) return '🍳';
    if (m.includes('alm')) return '🥗';
    if (m.includes('cen')) return '🍽️';
    if (m.includes('snack')) return '🍎';
    return '🍽️';
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" /> Historial de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-500">Aún no hay comidas registradas.</p>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} className="flex justify-between items-start border-b pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{emojiFor(entry.meal_type)}</span>
                <div>
                  <p className="font-semibold capitalize">{entry.meal_type}</p>
                  <p className="text-sm text-gray-500">{entry.description}</p>
                </div>
              </div>
              <div className="text-sm text-right">
                <div className="text-gray-500">{new Date(entry.created_at).toLocaleString()}</div>
                {entry.is_healthy && (
                  <Badge className="mt-2 bg-green-100 text-green-700">Saludable</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default async function NutritionPage() {
  const [data, goals] = await Promise.all([getNutritionDashboardData(), getUserNutritionGoals()]);

  if (!data || !goals) return <div className="p-8">Error al cargar los datos</div>;

  const { progress, history } = data;

  const progressValue = progress.goal ? (progress.current / progress.goal) * 100 : 0;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        <span className="mr-2 text-green-600">🍏</span> Seguimiento Nutricional
      </h1>
      <p className="text-gray-500">Registra y monitorea tus comidas saludables.</p>

      <Card className="bg-green-50 border-green-200 shadow-sm">
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-base font-semibold text-green-700 flex items-center gap-2">
            <Target className="h-4 w-4" /> Progreso Diario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-4 space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-green-800">
                {progress.current}/{progress.goal}
              </span>
              <span className="text-base font-normal text-green-600">comidas saludables</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-600">Racha actual</p>
              <span className="text-xl font-bold text-green-700">{progress.streak} días</span>
            </div>
          </div>
          <Progress value={Math.min(progressValue, 100)} className="w-full h-3 [&>*]:bg-green-500" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">
              -
            </Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <AddMealForm />
      </div>

      <HistorialComidas entries={history} />

      <NutritionGoalsForm initial={goals.meals_per_day ?? 3} />
    </div>
  );
}
