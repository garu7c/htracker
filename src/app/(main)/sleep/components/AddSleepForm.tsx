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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    console.log('🔍 [CLIENTE] Iniciando submit...');
    console.log('🔍 [CLIENTE] Valores actuales:', { bedtime, wakeup, quality });

    // Validación en el cliente
    if (!bedtime || !wakeup || !quality) {
      const errorMsg = `Campos faltantes - bedtime: ${bedtime}, wakeup: ${wakeup}, quality: ${quality}`;
      console.error('❌ [CLIENTE] Validación fallida:', errorMsg);
      setMessage({ type: 'error', text: 'Por favor completa todos los campos.' });
      return;
    }

    console.log('✅ [CLIENTE] Validación pasada, creando FormData...');

    const formData = new FormData();
    formData.append('bedtime', bedtime);
    formData.append('wakeup', wakeup);
    formData.append('quality', quality);

    // Verificar que FormData tenga los valores
    console.log('🔍 [CLIENTE] FormData contenido:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    startTransition(async () => {
      console.log('🚀 [CLIENTE] Llamando a addSleepEntry...');
      
      try {
        const result = await addSleepEntry(formData);
        console.log('📨 [CLIENTE] Respuesta de addSleepEntry:', result);
        
        if (result.success) {
          console.log('✅ [CLIENTE] Éxito - Registro completado');
          setMessage({ type: 'success', text: '¡Sueño registrado exitosamente!' });
          if (!todaySleep) {
            setBedtime('');
            setWakeup('');
            setQuality('');
          }
          router.refresh();
        } else {
          console.error('❌ [CLIENTE] Error del servidor:', result.message);
          setMessage({ type: 'error', text: result.message || 'Error desconocido al registrar.' });
        }
      } catch (error) {
        console.error('💥 [CLIENTE] Excepción en addSleepEntry:', error);
        setMessage({ type: 'error', text: 'Error de conexión al servidor.' });
      }
    });
  };

  // Log cuando los estados cambian
  React.useEffect(() => {
    console.log('🔄 [CLIENTE] Estado actualizado:', { bedtime, wakeup, quality });
  }, [bedtime, wakeup, quality]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {todaySleep ? 'Actualizar Registro de Sueño' : 'Registrar Sueño'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedtime" className='text-purple-800'>Hora de Dormir</Label>
              <Input
                id="bedtime"
                name="bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => {
                  console.log('⏰ [CLIENTE] Cambio bedtime:', e.target.value);
                  setBedtime(e.target.value);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wakeup" className='text-purple-800'>Hora de Despertar</Label>
              <Input
                id="wakeup"
                name="wakeup"
                type="time"
                value={wakeup}
                onChange={(e) => {
                  console.log('⏰ [CLIENTE] Cambio wakeup:', e.target.value);
                  setWakeup(e.target.value);
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality" className='text-purple-800'>Calidad del Sueño</Label>
              <Select 
                value={quality} 
                onValueChange={(value) => {
                  console.log('⭐ [CLIENTE] Cambio quality:', value);
                  setQuality(value);
                }}
              >
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

          <div className="flex items-center gap-4">
            <Button 
              type="submit" 
              className="w-34 bg-purple-700 hover:bg-purple-800 cursor-pointer" 
              disabled={isPending || !bedtime || !wakeup || !quality}
            >
              {isPending ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  {todaySleep ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {todaySleep ? 'Actualizar Sueño' : 'Registrar Sueño'}
                </>
              )}
            </Button>
            
            {/* Botón de debug temporal */}
            <button
              type="button"
              onClick={() => {
                console.log('🐛 [DEBUG] Estado actual:', { bedtime, wakeup, quality });
                console.log('🐛 [DEBUG] Validación:', {
                  hasBedtime: !!bedtime,
                  hasWakeup: !!wakeup,
                  hasQuality: !!quality,
                  allFields: !!bedtime && !!wakeup && !!quality
                });
              }}
              className="px-3 py-2 text-xs bg-gray-500 text-white rounded"
            >
              Debug Estado
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}