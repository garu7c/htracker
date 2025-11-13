import texts from '@/texts.json';

type TextsShape = typeof texts;

export function getTexts(preferredLang?: string) {
  // Default to Spanish
  let lang = 'es';

  if (preferredLang && typeof preferredLang === 'string') {
    lang = preferredLang.split('-')[0];
  }

  // @ts-ignore - dynamic index from JSON
  return (texts as TextsShape)[lang] ?? (texts as TextsShape)['en'];
}
