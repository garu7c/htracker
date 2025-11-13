import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ExerciseGoalsForm from './components/ExerciseGoalsForm';
import { Plus, Clock, Flame, Target } from 'lucide-react';
import { getExerciseDashboardData, getUserExerciseGoals, saveUserExerciseGoals } from './actions';
import AddExerciseForm from './components/AddExerciseForm';

// Exercise goals form is a client component in ./components/ExerciseGoalsForm

const HistorialReciente = ({ entries }: { entries: any[] }) => {
  const getEmoji = (type: string) => {
    type = type.toLowerCase();
    if (type.includes('cardio') || type.includes('correr')) return '🏃';
    if (type.includes('fuerza')) return '🏋️';
    if (type.includes('yoga')) return '🧘';
    if (type.includes('natacion')) return '🏊';
    if (type.includes('ciclismo')) return '🚴';
    return '💪';
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" /> Historial Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-500">Aún no hay ejercicios registrados.</p>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getEmoji(entry.exercise_type)}</span>
                <div>
                  <p className="font-semibold">{entry.exercise_type}</p>
                  <p className="text-sm text-gray-500">{entry.entry_date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {entry.duration_minutes} min
                </Badge>
                {entry.intensity && (
                  <Badge className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-100">
                    <Flame className="h-3 w-3" />
                    {entry.intensity}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default async function ExercisesPage() {
  const [data, goals] = await Promise.all([getExerciseDashboardData(), getUserExerciseGoals()]);

  if (!data || !goals) {
    return <div className="p-8">Error al cargar los datos</div>;
  }

  const { progress, history } = data;
  const { daily_sessions_goal, min_duration_goal } = goals;

  const progressValue = (progress.current / progress.goal) * 100;
  const progressDisplay = Math.min(progressValue, 100);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        <span className="mr-2 text-blue-600">&#9889;</span> Seguimiento de Ejercicio
      </h1>
      <p className="text-gray-500">Registra y monitorea tu actividad física diaria.</p>

      <Card className="bg-orange-50 border-orange-200 shadow-sm">
        <CardHeader className="pt-4 pb-2">
          <CardTitle className="text-base font-semibold text-orange-700 flex items-center gap-2">
            <Target className="h-4 w-4" /> Progreso de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-4 space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-orange-800">
                {progress.current}/{progress.goal}
              </span>
              <span className="text-base font-normal text-orange-600">sesiones completadas</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-orange-600">Racha actual</p>
              <span className="text-xl font-bold text-red-600">{progress.streak} días</span>
            </div>
          </div>
          <Progress value={progressDisplay} className="w-full h-3 [&>*]:bg-orange-500" />
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

      <AddExerciseForm />

      <HistorialReciente entries={history} />

      <ExerciseGoalsForm dailyGoal={daily_sessions_goal} durationGoal={min_duration_goal} />
    </div>
  );
}
