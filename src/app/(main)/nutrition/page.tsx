import { getTexts } from '@/lib/i18n';

export default function NutritionPage() {
  const t = getTexts();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-600">{t.pages.nutrition.title}</h1>
      <p className="mt-2 text-gray-700">{t.pages.nutrition.description}</p>
    </div>
  );
}