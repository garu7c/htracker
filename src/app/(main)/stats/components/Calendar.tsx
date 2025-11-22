'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export default function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDays, setActiveDays] = useState<Set<number>>(new Set());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    onDateSelect(dateStr);
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isSelectedDate = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === selectedDate;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const canSelectDate = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return date.getTime() <= today.getTime();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Calendario</CardTitle>
        <CardDescription className="text-xs">Selecciona un día para ver las actividades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Navegación de meses */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="font-semibold text-gray-900 text-xs">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isSelected = isSelectedDate(day);
              const isTodayDate = isToday(day);
              const canSelect = canSelectDate(day);

              return (
                <button
                  key={index}
                  onClick={() => day && handleDateClick(day)}
                  disabled={!canSelect && day !== null}
                  className={`
                    aspect-square rounded text-xs font-medium transition-colors
                    ${day === null ? 'invisible' : ''}
                    ${isSelected ? 'bg-blue-600 text-white' : ''}
                    ${isTodayDate && !isSelected ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : ''}
                    ${!isTodayDate && !isSelected && day ? 'hover:bg-gray-100 text-gray-700' : ''}
                    ${!canSelect && day ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${canSelect ? 'cursor-pointer' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
