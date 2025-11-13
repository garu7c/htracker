import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Zap } from 'lucide-react';
import { getExerciseDashboardData } from './actions';
import AddExerciseForm from './components/AddExerciseForm';
import ExerciseGoalsForm from './components/ExerciseGoalsForm';
import { DailyProgress, ExerciseEntry } from '@/types/db'; 

interface Entry extends ExerciseEntry {}

const HistorialReciente = ({ entries }: { entries: Entry[] }) => {
  const getEmoji = (type: string) => {
    type = type.toLowerCase();
    if (type.includes('cardio') || type.includes('correr')) return '🏃';
    if (type.includes('fuerza') || type.includes('pesas')) return '🏋️';
    if (type.includes('yoga') || type.includes('pilates')) return '🧘';
    if (type.includes('natacion')) return '🏊';
    if (type.includes('ciclismo') || type.includes('bici')) return '🚴';
    return '💪';
  };

  return (
    <Card className="shadow-lg border-2 border-gray-100">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-700">
          <Clock className="h-6 w-6" /> Historial Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-gray-500 italic p-2 rounded-md bg-gray-50">
            Aún no hay ejercicios registrados. ¡Empieza ahora!
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between items-center p-4 rounded-xl border border-gray-200 bg-white hover:bg-indigo-50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getEmoji(entry.exercise_type)}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{entry.exercise_type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.entry_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-xl text-indigo-600">
                    {entry.duration_minutes}m
                  </p>
                  <Badge
                    variant="default"
                    className={`text-xs capitalize font-medium mt-1 ${
                      entry.intensity === 'alta'
                        ? 'bg-red-500 text-white'
                        : entry.intensity === 'moderada'
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {entry.intensity}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const ProgressDisplay = ({ progress }: { progress: DailyProgress }) => {
  const current = progress.current;
  const goal = progress.goal > 0 ? progress.goal : 30;
  const progressPercentage = Math.min(100, (current / goal) * 100);

  return (
    <Card className="shadow-lg border-2 border-indigo-100 bg-indigo-50 h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-indigo-800 flex items-center gap-2">
          <Target className="h-5 w-5" /> Progreso Diario
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-4 space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-indigo-900">{current}</span>
            <span className="text-base font-normal text-indigo-700">
              de {progress.goal} min.
            </span>
          </div>
          <div className="text-right p-2 rounded-lg bg-white border border-red-200">
            <p className="text-sm font-medium text-red-600">Racha</p>
            <span className="text-xl font-bold text-red-700">{progress.streak} días</span>
          </div>
        </div>
        <Progress
          value={progressPercentage}
          className="w-full h-4 rounded-full bg-indigo-200 [&>*]:bg-indigo-600"
        />
        <p className="text-sm text-indigo-600">
          {current >= progress.goal
            ? '¡Meta diaria alcanzada! Eres una máquina. 💪'
            : `Faltan ${Math.max(0, progress.goal - current)} minutos para completar tu objetivo.`}
        </p>
      </CardContent>
    </Card>
  );
};

export default async function ExercisesPage() {
  const { progress, history } = await getExerciseDashboardData();

  const initialGoals = {
    durationGoal: progress.goal,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
        <Zap className="h-7 w-7 text-yellow-500 fill-yellow-500" /> Dashboard de Ejercicio
      </h1>

      {/* 1. Progreso Diario */}
      <ProgressDisplay progress={progress} />

      {/* 2. Agregar Ejercicio y Historial en disposición vertical */}
      <div className="space-y-6">
        <AddExerciseForm />
        <HistorialReciente entries={history as Entry[]} />
      </div>

      {/* 3. Establecer Metas */}
      <div className="w-full">
        <ExerciseGoalsForm initialGoals={initialGoals} />
      </div>
    </div>
  );
}