'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addSleepEntry } from '@/app/(main)/sleep/actions';

interface AddSleepFormProps {
  todaySleep?: any;
}

export default function AddSleepForm({ todaySleep }: AddSleepFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [bedtime, setBedtime] = useState(todaySleep?.time_sleep || '');
  const [wakeup, setWakeup] = useState(todaySleep?.time_wake || '');
  const [quality, setQuality] = useState(todaySleep?.quality || '');

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);

    formData.append('bedtime', bedtime);
    formData.append('wakeup', wakeup);
    formData.append('quality', quality);

    startTransition(async () => {
      const result = await addSleepEntry(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: '¡Sueño registrado exitosamente!' });
        if (!todaySleep) {
          setBedtime('');
          setWakeup('');
          setQuality('');
        }
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
          {todaySleep ? 'Actualizar Registro de Sueño' : 'Registrar Sueño'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedtime">Hora de Dormir</Label>
              <Input
                id="bedtime"
                name="bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wakeup">Hora de Despertar</Label>
              <Input
                id="wakeup"
                name="wakeup"
                type="time"
                value={wakeup}
                onChange={(e) => setWakeup(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Calidad del Sueño</Label>
              <Select value={quality} onValueChange={setQuality} name="quality">
                <SelectTrigger id="quality">
                  <SelectValue placeholder="Seleccionar calidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mala">Mala</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="buena">Buena</SelectItem>
                  <SelectItem value="excelente">Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {message && (
            <p className={`text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {message.text}
            </p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isPending || !bedtime || !wakeup || !quality}
          >
            {isPending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                {todaySleep ? 'Actualizando...' : 'Registrando...'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {todaySleep ? 'Actualizar Sueño' : 'Registrar Sueño'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}