"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addNutritionEntry } from '../actions';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus} from 'lucide-react';

export default function AddMealForm() {
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState('desayuno');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      // @ts-ignore - server action
      const res = await addNutritionEntry(fd);
      if (res && res.success) {
        setMessage({ type: 'success', text: 'Comida registrada.' });
        form.reset();
        setMealType('desayuno');
        startTransition(() => {
          router.refresh();
        });
      } else {
        setMessage({ type: 'error', text: res?.message || 'Error registrando comida.' });
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error registrando comida.' });
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
          <Plus className='h-5 w-5'/>Registrar Comida
          </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-type" className='text-green-800'>Tipo de Comida</Label>
              <Select value={mealType} onValueChange={setMealType} name="meal_type">
                <SelectTrigger id="meal-type">
                  <SelectValue placeholder="Seleccionar tipo" className='text-green-700'/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desayuno"className='text-green-700'>Desayuno</SelectItem>
                  <SelectItem value="almuerzo"className='text-green-700'>Almuerzo</SelectItem>
                  <SelectItem value="cena"className='text-green-700'>Cena</SelectItem>
                  <SelectItem value="snack"className='text-green-700'>Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description"className='text-green-800'>Descripción</Label>
              <Input id="description" name="description" placeholder="Ej: Ensalada con pollo" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_healthy" className="h-4 w-4 accent-green-800"/>
              <span className="text-sm">Saludable</span>
            </label>

            <div className="md:col-span-2 w-40">
              <Button type="submit" className="w-40 bg-green-700 hover:bg-green-800 cursor-pointer gap-2" disabled={loading}>
                <Plus className="h-4 w-4"/>
                {loading ? 'Registrando...' : 'Agregar Comida'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
