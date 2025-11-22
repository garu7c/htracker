'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { getTexts } from '@/lib/i18n';
import ExercisesCard from './components/ExercisesCard';
import HydrationCard from './components/HydrationCard';
import SleepCard from './components/SleepCard';
import NutritionCard from './components/NutritionCard';
import ExerciseAreaChart from './components/ExerciseAreaChart';
import OverallRadialChart from './components/OverallRadialChart';
import Calendar from './components/Calendar';
import DayActivities from './components/DayActivities';

export default function StatsPage() {
  const t = getTexts();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          console.error('Failed to get user:', error);
          setUserId(null);
        } else {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error('Error getting user:', err);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            Error: Could not load user. Please log in again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.pages.stats.title}</h1>
        <p className="mt-2 text-gray-600 text-lg">{t.pages.stats.description}</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Main Content (3/4 on xl screens) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Stats Overview Cards - Compact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <ExercisesCard userId={userId} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <HydrationCard userId={userId} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <SleepCard userId={userId} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <NutritionCard userId={userId} />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart - Takes 2/3 space */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Progress</h3>
              <ExerciseAreaChart userId={userId} />
            </div>
            
            {/* Radial Chart - Takes 1/3 space */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
              <OverallRadialChart userId={userId} />
            </div>
          </div>

          {/* Additional Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Weekly Exercise */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Weekly Exercise</h4>
              <p className="text-2xl font-bold text-blue-600">36 min</p>
              <p className="text-sm text-gray-500">max this month</p>
            </div>
            
            {/* Sleep Hours */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Sleep Hours</h4>
              <p className="text-2xl font-bold text-purple-600">00 / 8h</p>
              <p className="text-sm text-gray-500">today</p>
            </div>
            
            {/* Water Intake */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Water Intake</h4>
              <p className="text-2xl font-bold text-cyan-600">0 / 0</p>
              <p className="text-sm text-gray-500">glasses today</p>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar (1/4 on xl screens) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
            <Calendar onDateSelect={setSelectedDate} selectedDate={selectedDate} />
          </div>

          {/* Day Activities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
            <DayActivities userId={userId} selectedDate={selectedDate} />
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exercise Minutes</span>
                <span className="font-semibold text-gray-900">60/30</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Healthy Meals</span>
                <span className="font-semibold text-gray-900">0/3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Water Glasses</span>
                <span className="font-semibold text-gray-900">0/8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sleep Hours</span>
                <span className="font-semibold text-gray-900">0/8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}