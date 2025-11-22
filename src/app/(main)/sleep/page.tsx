import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Moon, Star, Bed, Zap, Sparkles, CircleCheckBig } from 'lucide-react';
import { getSleepDashboardData } from './actions';
import { SleepEntry, DailySleepProgress } from '@/types/db';
import AddSleepForm from './components/AddSleepForm';
import SleepGoalsForm from './components/SleepGoalsForm'; 
import SleepTips from './components/SleepTips';
import Image from 'next/image';

const SleepHistory = ({ entries }: { entries: SleepEntry[] }) => {
  const getQualityColor = (quality: string) => {
    const q = quality.toLowerCase();
    if (q === 'excelente') return 'bg-green-500 text-white';
    if (q === 'buena') return 'bg-blue-500 text-white';
    if (q === 'regular') return 'bg-yellow-500 text-gray-900';
    return 'bg-red-500 text-white';
  };

  const todayString = new Date().toISOString().split('T')[0];

  return (
    <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-700">
          <Clock className="h-5 w-5" /> Historial de Sueño
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-gray-500 italic p-3 rounded-md bg-gray-50/70 text-center">
            Aún no hay períodos de sueño registrados.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between items-center p-3 rounded-xl border border-gray-200 bg-white/90 hover:bg-purple-50/80 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {entry.sleep_date === todayString ? 'Hoy' : new Date(entry.sleep_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.time_sleep} - {entry.time_wake}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-sm font-medium text-gray-600">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="font-bold">{entry.total_hours}h</span>
                  </div>
                  <Badge
                    variant="default"
                    className={`text-xs capitalize font-medium ${getQualityColor(entry.quality)}`}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {entry.quality}
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

const ProgressDisplay = ({ progress }: { progress: DailySleepProgress }) => {
  const currentHours = progress.current;
  const goalHours = progress.goal > 0 ? progress.goal : 8;
  const progressPercentage = Math.min(100, (currentHours / goalHours) * 100);

  return (
    <Card className="h-54 shadow-lg border border-purple-200 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
          <Target className="h-5 w-5" /> Progreso del Sueño
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-purple-900">{currentHours}</span>
            <span className="text-sm font-normal text-purple-700">
              / {goalHours} horas
            </span>
          </div>
          <div className="text-right p-2 rounded-lg bg-white border border-orange-200">
            <p className="text-xs font-medium text-orange-600">Racha</p>
            <span className="text-lg font-bold text-orange-700">{progress.streak} días</span>
          </div>
        </div>
        <Progress
          value={progressPercentage}
          className="w-full h-2 rounded-full bg-purple-200 [&>*]:bg-purple-600"
        />
        <p className="text-sm text-purple-600 text-center">
          {currentHours >= goalHours
            ? '¡Meta alcanzada! 🌙'
            : `Faltan ${(goalHours - currentHours).toFixed(1)} horas`}
        </p>
      </CardContent>
    </Card>
  );
};

const SleepStats = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="bg-gradient-to-b from-purple-400 to-purple-600 backdrop-blur-sm border border-gray-200 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bed className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">Sueño Profundo</span>
          </div>
          <p className="text-3xl font-bold">2.5h</p>
          <p className="text-xs text-purple-100 mt-1">Promedio diario</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-t from-indigo-500 to-purple-500 backdrop-blur-sm border border-gray-200 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">Calidad</span>
          </div>
          <p className="text-3xl font-bold">85%</p>
          <p className="text-xs text-purple-100 mt-1">Esta semana</p>
        </CardContent>
      </Card>
    </div>
  );
};

const SleepRoutines = () => {
  const routines = [
    { 
      name: "Meditación Nocturna", 
      duration: "10 mins", 
      level: "Relajante", 
      emoji: "🧘",
      benefit: "Calma mental"
    },
    { 
      name: "Lectura Ligera", 
      duration: "15 mins", 
      level: "Tranquilo", 
      emoji: "📖",
      benefit: "Reduce estrés"
    },
    { 
      name: "Estiramientos Suaves", 
      duration: "5 mins", 
      level: "Relajante", 
      emoji: "🤸",
      benefit: "Relaja músculos"
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
          <CircleCheckBig className='h-5 w-5'/>Rutinas para Dormir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {routines.map((routine, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <span className="text-xl">{routine.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{routine.name}</p>
                <p className="text-xs text-gray-500">{routine.duration} • {routine.level}</p>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700 text-xs">
              {routine.benefit}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default async function SleepPage() {
  const { progress, history, goals } = await getSleepDashboardData();

  const initialGoals = {
    sleepGoalHours: goals.target_hours,
    idealSleepTime: goals.bedtime_goal,
    idealWakeTime: goals.wakeup_goal,
  };

  return (
    <div className="space-y-6">
      {/* Hero Section para sueño */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-700 rounded-3xl p-8 text-white relative overflow-visible max-h-[350px] flex items-center">
        <div className="relative z-10 w-full">
          <div className="flex justify-between items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-100">SleepTracker</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Duerme Lo 
                <span className="block text-indigo-500">Suficiente</span>
              </h1>
              <p className='text-white text-sm'>
                Un sueño de calidad es fundamental para la salud física y mental. 
                Mejora la memoria, fortalece el sistema inmunológico y renueva tu energía para el día siguiente.
              </p>
            </div>
            
            {/* Imagen más grande que sobresale del hero */}
            <div className="hidden lg:block relative">
              <div className="w-[580px] h-[600px] relative -top-12 -right-10">
                {/* Efecto de brillo detrás de la imagen */}
                <div className="absolute -inset-4 rounded-full blur-xl"></div>
                
                {/* Contenedor de la imagen con animación de entrada desde abajo */}
                <div className="relative w-full h-full rounded-2xl p-4 animate-slide-up">
                  <Image
                    src="/hero-sleep.png" // Cambia por tu imagen de sueño
                    alt="Persona durmiendo tranquilamente"
                    width={700}
                    height={600}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-40 right-16 w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="absolute top-44 right-12 w-4 h-4 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute bottom-40 left-14 w-4 h-4 bg-indigo-300 rounded-full animate-pulse delay-700"></div>
                <div className="absolute bottom-44 left-8 w-3 h-3 bg-gray-300 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - más ancha */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progreso y estadísticas de sueño */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressDisplay progress={progress} />
            <SleepStats />
          </div>

          {/* Formulario para agregar sueño */}
          <AddSleepForm />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rutinas para dormir */}
            <SleepRoutines />
            
            {/* Consejos de sueño */}
            <SleepTips />
          </div>

          {/* Formulario para establecer metas */}
          <SleepGoalsForm initialGoals={initialGoals} />
        </div>

        {/* Columna derecha - más estrecha */}
        <div className="space-y-6">
          <SleepHistory entries={history} />
        </div>
      </div>
    </div>
  );
}