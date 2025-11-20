"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addHydrationEntry } from '../actions';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Droplets } from 'lucide-react';

export default function AddHydrationForm() {
  const [loading, setLoading] = useState(false);
  const [cups, setCups] = useState('1');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    
    const formData = new FormData();
    formData.append('cups', cups);

    console.log('🔄 [CLIENT] Enviando formulario con vasos:', cups);

    try {
      const result = await addHydrationEntry(formData);
      console.log('📨 [CLIENT] Respuesta completa:', result);

      if (result && result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message || '¡Vasos registrados correctamente! 💧' 
        });
        setCups('1');
        
        // Refresh después de un breve delay
        setTimeout(() => {
          router.refresh();
        }, 500);
        
      } else {
        setMessage({ 
          type: 'error', 
          text: result?.message || 'Error al registrar los vasos' 
        });
      }
    } catch (error) {
      console.error('❌ [CLIENT] Error en catch:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error de conexión con el servidor' 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-lg border border-gray-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700">
          <Droplets className="h-5 w-5" /> Registrar Hidratación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="cups" className="text-sm font-medium">Cantidad de Vasos</Label>
            <Select value={cups} onValueChange={setCups} name="cups">
              <SelectTrigger id="cups" className="w-full">
                <SelectValue placeholder="Seleccionar vasos" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 8].map(n => (
                  <SelectItem key={n} value={String(n)}>
                    {n} vaso{n > 1 ? 's' : ''} ({n * 250} ml)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Se asume que 1 vaso ≈ 250 ml
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

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white w-40"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </>
              ) : (
                'Agregar Vasos'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}