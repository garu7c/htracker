"use client";

import React, { useState } from 'react';
import { addNutritionEntry } from '../actions';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddMealForm() {
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState('desayuno');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      // @ts-ignore - server action
      await addNutritionEntry(fd);
      form.reset();
      setMealType('desayuno');
      // reload the page to show new entry
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registrar Comida</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meal-type">Tipo de Comida</Label>
              <Select value={mealType} onValueChange={setMealType} name="meal_type">
                <SelectTrigger id="meal-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desayuno">Desayuno</SelectItem>
                  <SelectItem value="almuerzo">Almuerzo</SelectItem>
                  <SelectItem value="cena">Cena</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" placeholder="Ej: Ensalada con pollo" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_healthy" className="h-4 w-4" />
              <span className="text-sm">Saludable</span>
            </label>

            <div className="md:col-span-2 w-40">
              <Button type="submit" className="w-40" disabled={loading}>
                {loading ? 'Registrando...' : 'Agregar Comida'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
