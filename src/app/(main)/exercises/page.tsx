import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Zap, Heart, Droplets, Flame, Award } from 'lucide-react';
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
    <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-indigo-700">
          <Clock className="h-5 w-5" /> Historial Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-gray-500 italic p-3 rounded-md bg-gray-50/70 text-center">
            Aún no hay ejercicios registrados. ¡Empieza ahora!
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.slice(0, 5).map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between items-center p-3 rounded-xl border border-gray-200 bg-white/90 hover:bg-indigo-50/80 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getEmoji(entry.exercise_type)}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{entry.exercise_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.entry_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-indigo-600">
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
    <Card className="shadow-lg border border-indigo-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-indigo-800 flex items-center gap-2">
          <Award className="h-5 w-5" /> Progreso Diario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-indigo-900">{current}</span>
            <span className="text-sm font-normal text-indigo-700">
              / {goal} min
            </span>
          </div>
          <div className="text-right p-2 rounded-lg bg-white border border-red-200">
            <p className="text-xs font-medium text-red-600">Racha</p>
            <span className="text-lg font-bold text-red-700">{progress.streak} días</span>
          </div>
        </div>
        <Progress
          value={progressPercentage}
          className="w-full h-2 rounded-full bg-indigo-200 [&>*]:bg-indigo-600"
        />
        <p className="text-sm text-indigo-600 text-center">
          {current >= goal
            ? '¡Meta alcanzada! 🎉'
            : `Faltan ${goal - current} minutos`}
        </p>
      </CardContent>
    </Card>
  );
};

const HealthStats = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-b from-gray-300 to-indigo-600 backdrop-blur-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Cardio</span>
          </div>
          <p className="text-7xl font-bold">X</p>
          <p className="text-xs text-gray-100 mt-1">Cantidad de sesiones</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-t from-indigo-600 to-pink-600 backdrop-blur-sm border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Fuerza</span>
          </div>
          <p className="text-7xl font-bold">X</p>
          <p className="text-xs text-gray-100 mt-1">Cantidad de sesiones</p>
        </CardContent>
      </Card>
    </div>
  );
};

const QuickExercises = () => {
  const exercises = [
    { name: "Pull up", duration: "5 mins", level: "Beginner", emoji: "💪" },
    { name: "Push up", duration: "5 mins", level: "Beginner", emoji: "🦾" },
    { name: "Squat", duration: "4 mins", level: "Advanced", emoji: "🦵" }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Aprende ejercicios nuevos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {exercises.map((exercise, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <span className="text-xl">{exercise.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{exercise.name}</p>
                <p className="text-xs text-gray-500">{exercise.duration} • {exercise.level}</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
              Ver
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default async function ExercisesPage() {
  const { progress, history } = await getExerciseDashboardData();

  const initialGoals = {
    durationGoal: progress.goal,
  };
//Usando tailwind, que valor debo añadirle al contenedor principal para que ocupe todo el ancho disponible?
//D
  return (
    <div className="space-y-4">
      {/* Header con saludo */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[48px] font-bold text-gray-900">Dashboard de Ejercicios</h1>
          <p className="text-gray-600 mt-1">Allive - Tracker</p>
        </div>
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-lg w-90 h-30">
          <CardContent className="p-4 grid grid-cols-3 justify-items-center items-center gap-4">
            <div > <Zap className='w-12 h-12'/></div>
            <div className="flex items-center justify-between col-span-2">
              <div >
                <h3 className="font-bold text-lg">Hora de Entrenar!</h3>
                <p className="text-sm opacity-90">Lo estas haciendo muy bien</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - más ancha */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progreso y estadísticas de salud */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressDisplay progress={progress} />
            <HealthStats />
          </div>

          {/* Formulario para agregar ejercicio */}
          <AddExerciseForm />
          <div className="grid grid-cols-2 gap-6">

            {/* Ejercicios rápidos */}
            <QuickExercises />
              
            {/* Formulario para establecer metas */}
            <ExerciseGoalsForm initialGoals={initialGoals} />
          </div>
        </div>

        {/* Columna derecha - más estrecha */}
        <div className="space-y-6">
          <HistorialReciente entries={history as Entry[]} />
        </div>
      </div>
    </div>
  );
}