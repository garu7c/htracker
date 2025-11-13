'use client';

import { startTransition, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveUserExerciseGoals } from '@/app/(main)/exercises/actions';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { start } from 'repl';

const ExerciseGoalsForm = ({ initialGoals }: { initialGoals: {durationGoal: number} }) => {
  const router = useRouter(); 
  const [isPending, startTransition] = useTransition();
  
  const [durationInput, setDurationInput] = useState(String(initialGoals.durationGoal || 30));
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setMessage(null);
    const duration = parseInt(durationInput, 10);

    if (isNaN(duration) || duration <= 0) {
      setMessage({ type: 'error', text: 'Por favor ingresa una duración válida.' });
      return;
    }

    startTransition(async () => {
      const result = await saveUserExerciseGoals({
        durationGoal: duration,
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Metas guardadas exitosamente.' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.message || 'Error desconocido al guardar metas.' });
      }
    });
  };
      

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-green-700" /> Establecer Meta Diaria
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Campo para la Meta de Duración (Minutos) */}
          <div className="space-y-2">
            <Label htmlFor="duracionMeta">Minutos de Ejercicio por Día</Label>
            <Input 
              id="duracionMeta"
              type="number" 
              value={durationInput} 
              onChange={(e) => setDurationInput(e.target.value)}
              placeholder="Ej: 30"
              required
              min="1"
            />
            <p className="text-xs text-gray-500">Define cuántos minutos deseas ejercitarte diariamente.</p>
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
          disabled={isPending || parseInt(durationInput, 10) <= 0}
          className="w-full mt-auto bg-green-600 hover:bg-green-700"
        >
          {isPending ? (
            <>Guardando...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Guardar Meta</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExerciseGoalsForm;
