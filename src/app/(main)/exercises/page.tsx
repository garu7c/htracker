import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Zap, Heart, Droplets, Flame, Award, Sparkles, Lightbulb } from 'lucide-react';
import { getExerciseDashboardData } from './actions';
import AddExerciseForm from './components/AddExerciseForm';
import ExerciseGoalsForm from './components/ExerciseGoalsForm';
import { DailyProgress, ExerciseEntry } from '@/types/db'; 
import Image from 'next/image';

export const dynamic = 'force-dynamic';

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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-700">
          <Clock className="h-4 w-4" /> Historial Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-gray-500 italic p-2 rounded-md bg-gray-50/70 text-center text-xs">
            Aún no hay ejercicios registrados. ¡Empieza ahora!
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.slice(0, 5).map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between items-center p-2 rounded-lg border border-gray-200 bg-white/90 hover:bg-indigo-50/80 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEmoji(entry.exercise_type)}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">{entry.exercise_type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.entry_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-indigo-600">
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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-indigo-800 flex items-center gap-2">
          <Award className="h-4 w-4" /> Progreso Diario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-indigo-900">{current}</span>
            <span className="text-xs font-normal text-indigo-700">
              / {goal} min
            </span>
          </div>
          <div className="text-right p-1 rounded-lg bg-white border border-red-200">
            <p className="text-xs font-medium text-red-600">Racha</p>
            <span className="text-sm font-bold text-red-700">{progress.streak} días</span>
          </div>
        </div>
        <Progress
          value={progressPercentage}
          className="w-full h-2 rounded-full bg-indigo-200 [&>*]:bg-indigo-600"
        />
        <p className="text-xs text-indigo-600 text-center">
          {current >= goal
            ? '¡Meta alcanzada! 🎉'
            : `Faltan ${goal - current} minutos`}
        </p>
      </CardContent>
    </Card>
  );
};

const HealthStats = ({ cardioSessions, strengthSessions }: { 
  cardioSessions: number; 
  strengthSessions: number; 
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="bg-gradient-to-b from-gray-300 to-indigo-600 backdrop-blur-sm border border-gray-200 text-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-3 w-3 text-red-400" />
            <span className="text-xs font-medium">Cardio</span>
          </div>
          <p className="text-2xl font-bold">{cardioSessions}</p>
          <p className="text-xs text-indigo-100 mt-1">Sesiones esta semana</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-t from-indigo-600 to-pink-600 backdrop-blur-sm border border-gray-200 text-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-3 w-3 text-orange-400" />
            <span className="text-xs font-medium">Fuerza</span>
          </div>
          <p className="text-2xl font-bold">{strengthSessions}</p>
          <p className="text-xs text-pink-100 mt-1">Sesiones esta semana</p>
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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-indigo-800 flex items-center gap-2">
          <Lightbulb className='h-4 w-4'/>Aprende ejercicios nuevos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {exercises.map((exercise, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <span className="text-lg">{exercise.emoji}</span>
              <div>
                <p className="font-semibold text-xs">{exercise.name}</p>
                <p className="text-xs text-gray-500">{exercise.duration} • {exercise.level}</p>
              </div>
            </div>
            <button className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors">
              Ver
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default async function ExercisesPage() {
  const { progress, history, stats } = await getExerciseDashboardData();

  const initialGoals = {
    durationGoal: progress.goal,
  };

  return (
    <div className="space-y-4">
      {/* Hero Section para ejercicios */}
      <div className="bg-gradient-to-r from-pink-700 to-indigo-700 rounded-2xl p-5 text-white relative overflow-visible max-h-[240px] flex items-center">
        <div className="relative z-10 w-full">
          <div className="flex justify-between items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-indigo-300" />
                <span className="text-xs font-semibold text-blue-100">FitTracker</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
                Transforma Tu 
                <span className="block text-indigo-300">Cuerpo</span>
              </h1>
              <p className='text-white text-xs'>
                El ejercicio regular fortalece tu corazón, mejora la circulación y aumenta la resistencia. 
                Además, libera endorfinas que mejoran tu estado de ánimo y reducen el estrés.
              </p>
            </div>
            
            {/* Imagen más grande que sobresale del hero */}
            <div className="hidden lg:block relative">
              <div className="w-[280px] h-[280px] relative -top-4">
                {/* Efecto de brillo detrás de la imagen */}
                <div className="absolute -inset-4 rounded-full blur-xl"></div>
                
                {/* Contenedor de la imagen con animación de entrada desde abajo */}
                <div className="relative w-full h-full rounded-2xl p-4 animate-slide-up">
                  <Image
                    src="/hero-exr.png"
                    alt="Pesas Romanas"
                    width={560}
                    height={480}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-10 right-2 w-5 h-5 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="absolute top-14 right-6 w-3 h-3 bg-blue-300 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute bottom-12 right-2 w-4 h-4 bg-red-400 rounded-full animate-pulse delay-500"></div>
                <div className="absolute bottom-12 -left-2 w-3 h-3 bg-pink-600 rounded-full animate-pulse delay-700"></div>
                <div className="absolute bottom-16 -left-4 w-2 h-2 bg-red-300 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna izquierda - más ancha */}
        <div className="lg:col-span-2 space-y-4">
          {/* Progreso y estadísticas de salud */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressDisplay progress={progress} />
            <HealthStats 
              cardioSessions={stats?.cardioSessions || 0} 
              strengthSessions={stats?.strengthSessions || 0} 
            />
          </div>

          {/* Formulario para agregar ejercicio */}
          <AddExerciseForm />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ejercicios rápidos */}
            <QuickExercises />
              
            {/* Formulario para establecer metas */}
            <ExerciseGoalsForm initialGoals={initialGoals} />
          </div>
        </div>

        {/* Columna derecha - más estrecha */}
        <div className="space-y-4">
          <HistorialReciente entries={history as Entry[]} />
        </div>
      </div>
    </div>
  );
}