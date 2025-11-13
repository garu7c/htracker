"use client";

import React, { useState } from 'react';
import { saveUserHydrationGoals } from '../actions';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HydrationGoalsForm({ initial }: { initial: number }) {
  const [mlPerDay, setMlPerDay] = useState(String(initial ?? 2000));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.set('ml_per_day', mlPerDay);
    try {
      // @ts-ignore
      await saveUserHydrationGoals(fd);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Configurar Metas de Hidratación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <Label>Objetivo diario (ml)</Label>
            <Select value={mlPerDay} onValueChange={setMlPerDay}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {[1500, 2000, 2500, 3000].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} ml</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full mt-2" onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Meta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
