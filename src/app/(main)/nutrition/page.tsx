import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Apple, Heart, Carrot, Utensils, Award } from 'lucide-react';
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
    <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-green-700">
          <Clock className="h-5 w-5" /> Historial de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-gray-500 italic p-3 rounded-md bg-gray-50/70 text-center">
            Aún no hay comidas registradas.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center p-3 rounded-xl border border-gray-200 bg-white/90 hover:bg-green-50/80 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{emojiFor(entry.meal_type)}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm capitalize">{entry.meal_type}</p>
                    <p className="text-xs text-gray-500">{entry.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(entry.created_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {entry.is_healthy && (
                    <Badge className="mt-1 bg-green-100 text-green-700 text-xs">Saludable</Badge>
                  )}
                </div>
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
  const goal = progress.goal > 0 ? progress.goal : 3;
  const progressPercentage = Math.min(100, (current / goal) * 100);

  return (
    <Card className="shadow-lg border border-green-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
          <Award className="h-5 w-5" /> Progreso Diario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-green-900">{current}</span>
            <span className="text-sm font-normal text-green-700">
              / {goal} comidas
            </span>
          </div>
          <div className="text-right p-2 rounded-lg bg-white border border-orange-200">
            <p className="text-xs font-medium text-orange-600">Racha</p>
            <span className="text-lg font-bold text-orange-700">{progress.streak} días</span>
          </div>
        </div>
        <Progress
          value={progressPercentage}
          className="w-full h-2 rounded-full bg-green-200 [&>*]:bg-green-600"
        />
        <p className="text-sm text-green-600 text-center">
          {current >= goal
            ? '¡Meta alcanzada! 🎉'
            : `Faltan ${goal - current} comidas saludables`}
        </p>
      </CardContent>
    </Card>
  );
};

const NutritionStats = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-b from-green-400 to-green-600 backdrop-blur-sm border border-gray-200 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Apple className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">Comidas Saludables</span>
          </div>
          <p className="text-3xl font-bold">5</p>
          <p className="text-xs text-green-100 mt-1">Esta semana</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-t from-yellow-400 to-orange-500 backdrop-blur-sm border border-gray-200 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Carrot className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">Verduras Consumidas</span>
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-orange-100 mt-1">Porciones hoy</p>
        </CardContent>
      </Card>
    </div>
  );
};

const NutritionTips = () => {
  const tips = [
    { 
      title: "Hidratación Adecuada", 
      description: "Bebe 2L de agua al día", 
      emoji: "💧",
      benefit: "Mejora digestión"
    },
    { 
      title: "Proteína Magra", 
      description: "Incluye en cada comida", 
      emoji: "🍗",
      benefit: "Músculos sanos"
    },
    { 
      title: "Fibra Diaria", 
      description: "Frutos secos y verduras", 
      emoji: "🌰",
      benefit: "Sistema digestivo"
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Consejos de Nutrición</CardTitle>
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
            <Badge className="bg-green-100 text-green-700 text-xs">
              {tip.benefit}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default async function NutritionPage() {
  const [data, goals] = await Promise.all([getNutritionDashboardData(), getUserNutritionGoals()]);

  if (!data || !goals) return <div className="p-8">Error al cargar los datos</div>;

  const { progress, history } = data;

  const initialGoals = {
    mealsPerDay: goals.meals_per_day ?? 3,
  };

  return (
    <div className="space-y-6">
      {/* Header con saludo */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[48px] font-bold text-gray-900">Dashboard de Nutrición</h1>
          <p className="text-gray-600 mt-1">Allive - Tracker</p>
        </div>
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg w-90 h-30">
          <CardContent className="p-4 grid grid-cols-3 justify-items-center items-center gap-4">
            <div><Apple className='w-12 h-12'/></div>
            <div className="flex items-center justify-between col-span-2">
              <div>
                <h3 className="font-bold text-lg">Come Saludable!</h3>
                <p className="text-sm opacity-90">Tu cuerpo te lo agradecerá</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - más ancha */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progreso y estadísticas de nutrición */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressDisplay progress={progress} />
            <NutritionStats />
          </div>

          {/* Formulario para agregar comida */}
          <AddMealForm />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consejos de nutrición */}
            <NutritionTips />
            
            {/* Formulario para establecer metas */}
            <NutritionGoalsForm initial={initialGoals.mealsPerDay} />
          </div>
        </div>

        {/* Columna derecha - más estrecha */}
        <div className="space-y-6">
          <HistorialComidas entries={history} />
        </div>
      </div>
    </div>
  );
}