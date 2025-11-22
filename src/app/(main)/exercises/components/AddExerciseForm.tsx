'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addExerciseEntry } from '@/app/(main)/exercises/actions';

export default function AddExerciseForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exerciseType, setExerciseType] = useState('');
  const [intensity, setIntensity] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);

    formData.append('exerciseType', exerciseType);
    formData.append('intensity', intensity);

    startTransition(async () => {
      const result = await addExerciseEntry(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: '¡Ejercicio registrado exitosamente!' });
        setExerciseType('');
        setIntensity('');
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.message || 'Error desconocido al registrar.' });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-bold text-indigo-800 gap-2">
          <Plus className="h-6 w-6" />
          Registrar Ejercicio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exercise-type"className="text-sm text-indigo-800">Tipo de Ejercicio</Label>
              <Select value={exerciseType} onValueChange={setExerciseType} name="exerciseType">
                <SelectTrigger id="exercise-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="fuerza">Fuerza</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="natacion">Natación</SelectItem>
                  <SelectItem value="ciclismo">Ciclismo</SelectItem>
                  <SelectItem value="correr">Correr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pr-28">
              <Label htmlFor="duration"className='text-sm text-indigo-800'>Duración (minutos)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                placeholder="30"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity"className='text-sm text-indigo-800'>Intensidad</Label>
              <Select value={intensity} onValueChange={setIntensity} name="intensity">
                <SelectTrigger id="intensity">
                  <SelectValue placeholder="Seleccionar intensidad"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {message && (
            <p className={`text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" className="bg-blue-700 cursor-pointer" disabled={isPending || !exerciseType || !intensity}>
            {isPending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ejercicio
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}