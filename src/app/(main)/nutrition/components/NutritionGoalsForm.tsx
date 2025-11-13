"use client";

import React, { useState } from 'react';
import { saveUserNutritionGoals } from '../actions';

export default function NutritionGoalsForm({ initial }: { initial: number }) {
  const [meals, setMeals] = useState<number>(initial ?? 3);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set('meals_per_day', String(meals));
    try {
      // @ts-ignore
      await saveUserNutritionGoals(fd);
      setLoading(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <div className="text-sm text-muted-foreground">Comidas saludables por día</div>
        <select value={meals} onChange={(e) => setMeals(Number(e.target.value))} className="input" name="meals_per_day">
          {[3,4,5,6].map(n => (
            <option key={n} value={n}>{n} comidas</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar meta'}</button>
    </form>
  );
}
