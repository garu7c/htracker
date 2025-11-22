'use client';

import { useState, useTransition } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Save } from 'lucide-react';
import { saveUserSleepGoals } from '@/app/(main)/sleep/actions';
import { useRouter } from 'next/navigation';

interface GoalsProps {
    sleepGoalHours: number;
    idealSleepTime: string;
    idealWakeTime: string;
}

const SleepGoalsForm = ({ initialGoals }: { initialGoals: GoalsProps }) => {
  const router = useRouter(); 
  const [isPending, startTransition] = useTransition();
  
  const [hoursGoalInput, setHoursGoalInput] = useState(String(initialGoals.sleepGoalHours || 8));
  const [idealSleepTime, setIdealSleepTime] = useState(initialGoals.idealSleepTime || '22:30');
  const [idealWakeTime, setIdealWakeTime] = useState(initialGoals.idealWakeTime || '06:30');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setMessage(null);
    const hoursGoal = parseInt(hoursGoalInput, 10);

    if (isNaN(hoursGoal) || hoursGoal <= 0) {
      setMessage({ type: 'error', text: 'Por favor ingresa una meta de horas válida.' });
      return;
    }

    startTransition(async () => {
      const result = await saveUserSleepGoals({
        sleepGoalHours: hoursGoal,
        idealSleepTime, 
        idealWakeTime,  
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Metas de sueño guardadas exitosamente.' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.message || 'Error desconocido al guardar metas.' });
      }
    });
  };

  return (
    <Card className="shadow-md border-2 border-purple-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
          <Target className="h-5 w-5" /> Configurar Metas de Sueño
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full space-y-4">
        <div className="space-y-4">
            
            {/* Campo para Horas de Sueño Objetivo */}
            <div className="space-y-2">
              <Label htmlFor="horasMeta"className='text-purple-800'>Horas de sueño objetivo (diario)</Label>
              <Input 
                id="horasMeta"
                type="number" 
                value={hoursGoalInput} 
                onChange={(e) => setHoursGoalInput(e.target.value)}
                placeholder="Ej: 8"
                required
                min="1"
              />
              <p className="text-xs text-gray-500">Columna `sleep_goal_hours`</p>
            </div>

            {/* Hora Ideal para Dormir */}
            <div className="space-y-2">
              <Label htmlFor="horaDormir"className='text-purple-800'>Hora ideal para dormir</Label>
              <Input 
                id="horaDormir"
                type="time" 
                value={idealSleepTime} 
                onChange={(e) => setIdealSleepTime(e.target.value)}
              />
              <p className="text-xs text-gray-500">Columna `sleep_ideal_bed_time`</p>
            </div>

            {/* Hora Ideal para Despertar */}
            <div className="space-y-2">
              <Label htmlFor="horaDespertar"className='text-purple-800'>Hora ideal para despertar</Label>
              <Input 
                id="horaDespertar"
                type="time" 
                value={idealWakeTime} 
                onChange={(e) => setIdealWakeTime(e.target.value)}
              />
              <p className="text-xs text-gray-500">Columna `sleep_ideal_wake_time`</p>
            </div>
            
            {/* Mensajes de feedback */}
            {message && (
              <p className={`text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {message.text}
              </p>
            )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending || parseInt(hoursGoalInput, 10) <= 0}
          className="w-32 bg-purple-600 hover:bg-purple-700 cursor-pointer"
        >
          {isPending ? (
            <>Guardando...</>
          ) : (
            <><Save className="h-4 w-4" /> Guardar Metas</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SleepGoalsForm;