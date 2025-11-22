import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplets, Target, Clock, GlassWater, Waves, Sparkles, Goal, Award, Lightbulb } from 'lucide-react';
import { getHydrationDashboardData, getUserHydrationGoals } from './actions';
import HydrationGoalsForm from './components/HydrationGoalsForm';
import AddHydrationForm from './components/AddHydrationForm';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const HydrationHistory = ({ entries }: { entries: any[] }) => {
  return (
    <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700">
          <Clock className="h-5 w-5" /> Historial de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(!entries || entries.length === 0) ? (
          <p className="text-gray-500 italic p-3 rounded-md bg-gray-50/70 text-center">
            Aún no hay registros de hidratación hoy.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.slice(0, 5).map((entry, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-3 rounded-xl border border-gray-200 bg-white/90 hover:bg-blue-50/80 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{entry.amount} ml</p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {entry.type || 'Agua'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

const ProgressDisplay = ({ progress }: { progress: any }) => {
  const current = progress.current;
  const goal = progress.goal > 0 ? progress.goal : 8;
  const progressPercentage = Math.min(100, (current / goal) * 100);

  return (
    <Card className="shadow-lg border border-blue-200 bg-white/80 backdrop-blur-sm h-54">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <Award className="h-5 w-5" /> Progreso de Hidratación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-blue-900">{current}</span>
            <span className="text-sm font-normal text-blue-700">
              / {goal} vasos
            </span>
          </div>
          <div className="text-right p-2 rounded-lg bg-white border border-cyan-200">
            <p className="text-xs font-medium text-cyan-600">Hoy</p>
            <span className="text-lg font-bold text-cyan-700">{progress.streak || 0}</span>
          </div>
        </div>
        <Progress
          value={progressPercentage}
          className="w-full h-2 rounded-full bg-blue-200 [&>*]:bg-blue-600"
        />
        <p className="text-sm text-blue-600 text-center">
          {current >= goal
            ? '¡Meta alcanzada! 💧'
            : `Faltan ${goal - current} vasos`}
        </p>
      </CardContent>
    </Card>
  );
};

const HydrationStats = ({ progress }: { progress: any }) => {
  const currentLiters = (progress.current * 0.25).toFixed(1);
  const goalLiters = (progress.goal * 0.25).toFixed(1);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-b from-blue-400 to-blue-600 backdrop-blur-sm border border-gray-200 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <GlassWater className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">Agua Consumida</span>
          </div>
          <p className="text-3xl font-bold">{currentLiters}L</p>
          <p className="text-xs text-blue-100 mt-1">De {goalLiters}L objetivo</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-t from-cyan-500 to-blue-500 backdrop-blur-sm border border-gray-200 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">Porcentaje</span>
          </div>
          <p className="text-3xl font-bold">{Math.round((progress.current / progress.goal) * 100)}%</p>
          <p className="text-xs text-cyan-100 mt-1">Del objetivo diario</p>
        </CardContent>
      </Card>
    </div>
  );
};

const HydrationTips = () => {
  const tips = [
    { 
      title: "Agua al Despertar", 
      description: "1-2 vasos en ayunas", 
      emoji: "🌅",
      benefit: "Activa metabolismo"
    },
    { 
      title: "Antes de Comidas", 
      description: "1 vaso 30min antes", 
      emoji: "🍽️",
      benefit: "Digestión"
    },
    { 
      title: "Durante Ejercicio", 
      description: "Sips cada 15min", 
      emoji: "🏃",
      benefit: "Hidratación constante"
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-700 flex items-center gap-2">
          <Lightbulb className='w-5 h-5'/>Consejos de Hidratación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <span className="text-xl">{tip.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{tip.title}</p>
                <p className="text-xs text-gray-500">{tip.description}</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700 text-xs">
              {tip.benefit}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default async function HydrationPage() {
  const [data, goals] = await Promise.all([getHydrationDashboardData(), getUserHydrationGoals()]);

  if (!data || !goals) return <div className="p-8">Error al cargar los datos</div>;

  const { progress, history } = data;

  const initialGoals = {
    cupsPerDay: goals.cups_per_day ?? 8,
  };

  return (
    <div className="space-y-6">
      {/* Hero Section para hidratación */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-white relative overflow-visible max-h-[350px] flex items-center">
        <div className="relative z-10 w-full">
          <div className="flex justify-between items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-white" />
                <span className="text-sm font-semibold text-cyan-100">HydroTracker</span>
              </div>
              
              <h1 className="text-4xl text-cyan-200 md:text-5xl font-bold mb-4 leading-tight">
                Manten Tu Cuerpo
                <span className="block text-white">Hidratado</span>
              </h1>
              <p className='text-cyan-100 text-sm'>
                La hidratación adecuada es esencial para todas las funciones corporales. 
                Mejora la digestión, regula la temperatura corporal, lubrica las articulaciones y ayuda a transportar nutrientes.
              </p>
            </div>
            
            {/* Imagen más grande que sobresale del hero */}
            <div className="hidden lg:block relative">
              <div className="w-[500px] h-[450px] relative -top-8 -right-10">
                {/* Efecto de brillo detrás de la imagen */}
                <div className="absolute -inset-4 bg-yellow-200/20 rounded-full blur-xl"></div>
                
                {/* Contenedor de la imagen con animación de entrada desde abajo */}
                <div className="relative w-full h-full rounded-2xl p-4 animate-slide-up">
                  <Image
                    src="/hero-hy.png" // Cambia por tu imagen de hidratación
                    alt="Persona hidratándose saludablemente"
                    width={700}
                    height={600}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
                
                {/* Elementos decorativos flotantes */}
                <div className="absolute top-20 right-8 w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="absolute top-32 right-16 w-4 h-4 bg-cyan-300 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-24 left-10 w-5 h-5 bg-blue-400 rounded-full animate-pulse delay-500"></div>
                <div className="absolute bottom-24 -left-2 w-4 h-4 bg-blue-300 rounded-full animate-pulse delay-700"></div>
                <div className="absolute bottom-32 left-4 w-3 h-3 bg-gray-300 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - más ancha */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progreso y estadísticas de hidratación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressDisplay progress={progress} />
            <HydrationStats progress={progress} />
          </div>

          {/* Formulario para agregar hidratación */}
          <AddHydrationForm />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consejos de hidratación */}
            <HydrationTips />
            
            {/* Formulario para establecer metas */}
            <HydrationGoalsForm initial={initialGoals.cupsPerDay} />
          </div>
        </div>

        {/* Columna derecha - más estrecha */}
        <div className="space-y-6">
          <HydrationHistory entries={history || []} />
        </div>
      </div>
    </div>
  );
}