/*'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // Esta importación es correcta
import { Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 🛑 CORRECCIÓN: Cambiamos la ruta relativa a una ruta absoluta con alias
import { addExerciseEntry } from '@/app/(main)/exercises/actions';

export default function AddExerciseForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Estado para el mensaje de éxito/error
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estados para los <Select> (ya que son componentes controlados)
  const [exerciseType, setExerciseType] = useState('');
  const [intensity, setIntensity] = useState('');

  // Manejador del formulario que llama a la Server Action
  const handleSubmit = async (formData: FormData) => {
    setMessage(null);

    // Añadimos los valores de los <Select> controlados al FormData
    formData.append('exerciseType', exerciseType);
    formData.append('intensity', intensity);

    // Usamos startTransition para marcar el estado como pendiente
    startTransition(async () => {
      const result = await addExerciseEntry(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: '¡Ejercicio registrado exitosamente!' });
        
        // Limpiar el formulario (opcional, pero buena UX)
        setExerciseType('');
        setIntensity('');
        // (El input de duración se puede limpiar reseteando el formulario, o con estado)
        
        // Refrescar la página para que la Server Action 'fetchExerciseData' 
        // en 'page.tsx' obtenga los nuevos datos (incluyendo el historial).
        router.refresh(); 
      } else {
        setMessage({ type: 'error', text: result.message || 'Error desconocido al registrar.' });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Registrar Ejercicio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usamos el atributo 'action' de <form> para la Server Action *}
        <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Tipo de Ejercicio (Controlado) *}
                <div className="space-y-2">
                    <Label htmlFor="exercise-type">Tipo de Ejercicio</Label>
                    <Select value={exerciseType} onValueChange={setExerciseType} name="exerciseType">
                        <SelectTrigger id="exercise-type">
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cardio">Cardio</SelectItem>
                            <SelectItem value="fuerza">Fuerza</SelectItem>
                            <SelectItem value_disabled="yoga">Yoga</SelectItem>
                            <SelectItem value="natacion">Natación</SelectItem>
                            <SelectItem value="ciclismo">Ciclismo</SelectItem>
                            <SelectItem value="correr">Correr</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Duración (No controlado, FormData lo tomará por 'name') *}
                <div className="space-y-2">
                    <Label htmlFor="duration">Duración (minutos)</Label>
                    <Input
                        id="duration"
                        name="duration" // El 'name' debe coincidir con el FormData
                        type="number"
                        placeholder="30"
                        required
                        min="1"
                    />
                </div>

                {/* Intensidad (Controlado) *}
                <div className="space-y-2">
                    <Label htmlFor="intensity">Intensidad</Label>
                    <Select value={intensity} onValueChange={setIntensity} name="intensity">
                        <SelectTrigger id="intensity">
                            <SelectValue placeholder="Seleccionar intensidad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="baja">Baja</SelectItem>
                            <SelectItem value="moderada">Moderada</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Mensaje de estado (éxito o error) *}
            {message && (
                <p className={`text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {message.text}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending || !exerciseType || !intensity}>
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
}*/