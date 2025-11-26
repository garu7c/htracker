'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Moon, TrendingUp } from 'lucide-react';
import { PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

interface SleepStats {
  current: number;
  goal: number;
  quality: string;
}

export default function SleepCard({ userId }: { userId: string }) {
  const supabase = createClient();
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0];

        const { data: todayData } = await supabase
          .from('sleep_entries')
          .select('total_hours, quality')
          .eq('user_id', userId)
          .eq('sleep_date', today)
          .single();

        const { data: goalData } = await supabase
          .from('sleep_goals')
          .select('target_hours')
          .eq('user_id', userId)
          .single();

        const currentHours = todayData?.total_hours || 0;
        const goalHours = goalData?.target_hours || 8;

        setStats({
          current: currentHours,
          goal: goalHours,
          quality: todayData?.quality || 'N/A',
        });
      } catch (err) {
        console.error('Error loading sleep stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [userId]);

  if (loading) {
    return (
      <Card className="flex flex-col relative overflow-hidden">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2 text-xs text-purple-800">
            <Moon className="h-3 w-3" />
            Sueño
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="flex flex-col relative overflow-hidden">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2 text-xs text-purple-800">
            <Moon className="h-3 w-3" />
            Sueño
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = Math.min(100, Math.round((stats.current / stats.goal) * 100));

  const chartData = [
    { 
      name: 'Total', 
      current: Math.min(stats.current, stats.goal), 
      remaining: Math.max(0, stats.goal - stats.current),
      total: stats.goal 
    },
  ];

  return (
    <Card className="flex flex-col relative overflow-hidden">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2 text-xs text-purple-800">
          <Moon className="h-3 w-3" />
          Sueño
        </CardTitle>
        <CardDescription className="text-xs">
          Horas dormidas: {stats.current}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-1 items-center justify-center pt-0 pb-12">
        <div className="mx-auto aspect-square w-full max-w-[160px]">
          <RadialBarChart
            width={160}
            height={160}
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false} />
            <RadialBar
              dataKey="remaining"
              stackId="a"
              cornerRadius={5}
              fill="#f3e8ff" // purple-100
            />
            <RadialBar
              dataKey="current"
              stackId="a"
              cornerRadius={5}
              fill="#6b21a8" // purple-800
            />
            
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-bold fill-purple-800"
            >
              {progressPercent}%
            </text>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-500"
            >
              Completado
            </text>
          </RadialBarChart>
        </div>
      </CardContent>

      <CardFooter className="absolute bottom-0 left-0 right-0 flex-col gap-1 text-xs pb-3 bg-background">
        <div className="flex items-center gap-1 leading-none font-medium text-xs">
          Meta Diaria <TrendingUp className="h-3 w-3" />
        </div>
        <div className="text-muted-foreground leading-none text-xs">
          {stats.goal} horas
        </div>
      </CardFooter>
    </Card>
  );
}