"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { saveUserNutritionGoals } from '../actions';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function NutritionGoalsForm({ initial }: { initial: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [meals, setMeals] = useState<number>(initial ?? 3);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setMessage(null);
    const fd = new FormData();
    fd.set('meals_per_day', String(meals));

    startTransition(async () => {
      // @ts-ignore server action
      const res = await saveUserNutritionGoals(fd);
      if (res && res.success) {
        setMessage({ type: 'success', text: res.message || 'Meta guardada.' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: res?.message || 'Error al guardar meta.' });
      }
    });
  };

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">Establecer Meta Diaria</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Comidas saludables por día</Label>
            <Select value={String(meals)} onValueChange={(v) => setMeals(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cantidad" />
              </SelectTrigger>
              <SelectContent>
                {[3,4,5,6].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} comidas</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Define cuántas comidas saludables deseas por día.</p>
          </div>

          {message && (
            <p className={`text-sm p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>

        <Button onClick={handleSave} disabled={isPending} className="w-full mt-auto bg-green-600 hover:bg-green-700">
          {isPending ? 'Guardando...' : 'Guardar meta'}
        </Button>
      </CardContent>
    </Card>
  );
}
