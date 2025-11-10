import { getTexts } from '@/lib/i18n';

export default function StatsPage() {
  const t = getTexts();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-600">{t.pages.stats.title}</h1>
      <p className="mt-2 text-gray-700">{t.pages.stats.description}</p>
    </div>
  );
}