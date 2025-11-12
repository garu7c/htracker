// src/app/main/exercises/page.tsx
/*
//import { getExerciseDashboardData, getUserExerciseGoals, saveUserExerciseGoals } from './actions'; // Importar acciones
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge'; // Necesario para el historial
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Plus, Clock, Flame, Target } from 'lucide-react'; // Íconos del mockup
//import { RegistrarEjercicioForm } from '@app/components/exercises/RegistrarEjercicioForm'; // Componente de Cliente

// --- Componente de Cliente para Configurar Metas (Actualizado con lógica de guardado) ---
// NOTA: Este componente debe estar en un archivo separado si quieres mantener el Server Component de page.tsx limpio.
// Si lo mantienes aquí, debe tener la directiva 'use client'; en la parte superior del archivo.
const ConfigurarMetas = ({ dailyGoal, durationGoal }: { dailyGoal: number, durationGoal: number }) => {
    'use client'; // Necesario si manejas estado e interacción aquí

    const [dailySessions, setDailySessions] = useState(String(dailyGoal));
    const [minDuration, setMinDuration] = useState(String(durationGoal));
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        const sessions = parseInt(dailySessions);
        const duration = parseInt(minDuration);

        if (isNaN(sessions) || isNaN(duration) || sessions <= 0 || duration <= 0) {
            alert("Por favor, introduce valores válidos.");
            setLoading(false);
            return;
        }

        // Llama a la Server Action de guardado
        const result = await saveUserExerciseGoals({
            daily_sessions_goal: sessions,
            min_duration_goal: duration
        });

        if (result.success) {
            alert('Metas guardadas correctamente. Actualizando página...');
        } else {
            alert(`Error al guardar metas: ${result.error}`);
        }
        setLoading(false);
    };

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" /> Configurar Metas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sesiones por día *}
                    <div>
                        <Label htmlFor="sesiones">Sesiones por día</Label>
                        <Select value={dailySessions} onValueChange={setDailySessions}>
                            <SelectTrigger id="sesiones" className="mt-1">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <SelectItem key={n} value={String(n)}>{n} sesión{n > 1 ? 'es' : ''}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Duración mínima *}
                    <div>
                        <Label htmlFor="duracionMinima">Duración mínima (minutos)</Label>
                        <Select value={minDuration} onValueChange={setMinDuration}>
                            <SelectTrigger id="duracionMinima" className="mt-1">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                {[15, 30, 45, 60, 90].map(n => (
                                    <SelectItem key={n} value={String(n)}>{n} minutos</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={loading} className="w-full mt-6 bg-green-600 hover:bg-green-700">
                    {loading ? 'Guardando...' : 'Guardar Metas'}
                </Button>
            </CardContent>
        </Card>
    );
};

// Componente de Cliente para el Historial (Ajustado con íconos y Badge)
const HistorialReciente = ({ entries }: { entries: any[] }) => {
    // Función de ayuda para obtener el emoji
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
                        <div key={index} className="flex justify-between items-center border-b pb-3 last:border-b-0 last:pb-0">
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
}

// Componente principal de la página (Server Component)
export default async function ExercisesPage() {
    // 1. Obtener los datos del servidor
    const [data, goals] = await Promise.all([
        getExerciseDashboardData(),
        getUserExerciseGoals(),
    ]);

    const { recentEntries, sessionsCompletedToday } = data;
    const { daily_sessions_goal, min_duration_goal } = goals;

    // Cálculo del progreso para la barra
    const progressValue = (sessionsCompletedToday / daily_sessions_goal) * 100;
    const progressDisplay = Math.min(progressValue, 100);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">
                <span className="mr-2 text-blue-600">&#9889;</span> Seguimiento de Ejercicio
            </h1>
            <p className="text-gray-500">Registra y monitorea tu actividad física diaria.</p>

            {/* 1. Progreso de Hoy (Estilos del Mockup) *}
            <Card className="bg-orange-50 border-orange-200 shadow-sm">
                <CardHeader className="pt-4 pb-2">
                    <CardTitle className="text-base font-semibold text-orange-700 flex items-center gap-2">
                        <Target className="h-4 w-4" /> Progreso de Hoy
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 pb-4 space-y-3">
                    <div className="flex justify-between items-end">
                        <div className='flex items-baseline gap-1'>
                            <span className="text-3xl font-bold text-orange-800">
                                {sessionsCompletedToday}/{daily_sessions_goal}
                            </span>
                            <span className="text-base font-normal text-orange-600">
                                sesiones completadas
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-orange-600">Racha actual</p>
                            <span className="text-xl font-bold text-red-600">5 días</span> {/* Hardcodeado temporalmente *}
                        </div>
                    </div>
                    <Progress value={progressDisplay} className="w-full h-3 [&>*]:bg-orange-500" />
                    {/* Botones de + y - del mockup, si fueran necesarios para la interacción manual simple *}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="w-8 h-8 p-0">-</Button>
                        <Button variant="outline" size="sm" className="w-8 h-8 p-0"><Plus className="h-4 w-4" /></Button>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Registrar Ejercicio (Client Component) *}
            <RegistrarEjercicioForm />

            {/* 3. Historial Reciente (Client Component con Server Data) *}
            <HistorialReciente entries={recentEntries} />

            {/* 4. Configurar Metas (Client Component con Server Data) *}
            <ConfigurarMetas
                dailyGoal={daily_sessions_goal}
                durationGoal={min_duration_goal}
            />
        </div>
    );
}*/