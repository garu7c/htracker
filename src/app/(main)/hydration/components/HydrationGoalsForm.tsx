"use client";

import React, { useState } from 'react';
import { saveUserHydrationGoals } from '../actions';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Target } from 'lucide-react';

export default function HydrationGoalsForm({ initial }: { initial: number }) {
  const [cupsPerDay, setCupsPerDay] = useState(String(initial ?? 8));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setMessage(null);
    setLoading(true);
    
    const formData = new FormData();
    formData.append('cups_per_day', cupsPerDay);
    
    try {
      const result = await saveUserHydrationGoals(formData);
      
      if (result && result.success) {
        setMessage({
          type: 'success',
          text: '¡Meta de hidratación actualizada correctamente! 💧'
        });
        
        // Refresh después de un breve delay
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: result?.message || 'Error al guardar la meta'
        });
      }
    } catch (error) {
      console.error('Error al guardar meta:', error);
      setMessage({
        type: 'error',
        text: 'Error de conexión con el servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700">
          <Target className="h-5 w-5" /> Configurar Meta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Vasos por día</Label>
            <Select value={cupsPerDay} onValueChange={setCupsPerDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar meta" />
              </SelectTrigger>
              <SelectContent>
                {[4, 6, 8, 10, 12].map(n => (
                  <SelectItem key={n} value={String(n)}>
                    {n} vasos ({n * 250} ml)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Recomendación: 8 vasos (2L) para adultos
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              'Guardar Meta'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}