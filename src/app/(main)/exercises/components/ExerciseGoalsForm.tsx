'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveUserExerciseGoals } from '@/app/(main)/exercises/actions';

const ExerciseGoalsForm = ({ dailyGoal, durationGoal }: { dailyGoal: number; durationGoal: number }) => {
  const [dailySessions, setDailySessions] = useState(String(dailyGoal));
  const [minDuration, setMinDuration] = useState(String(durationGoal));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const sessions = parseInt(dailySessions);
    const duration = parseInt(minDuration);

    if (isNaN(sessions) || isNaN(duration) || sessions <= 0 || duration <= 0) {
      alert('Por favor, introduce valores válidos.');
      setLoading(false);
      return;
    }

    const result = await saveUserExerciseGoals({
      daily_sessions_goal: sessions,
      min_duration_goal: duration,
    });

    if (result.success) {
      alert('Metas guardadas correctamente.');
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
          <div>
            <Label htmlFor="sesiones">Sesiones por día</Label>
            <Select value={dailySessions} onValueChange={setDailySessions}>
              <SelectTrigger id="sesiones" className="mt-1">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} sesión{n > 1 ? 'es' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duracionMinima">Duración mínima (minutos)</Label>
            <Select value={minDuration} onValueChange={setMinDuration}>
              <SelectTrigger id="duracionMinima" className="mt-1">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60, 90].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} minutos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-6 bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Guardando...' : 'Guardar Metas'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExerciseGoalsForm;
