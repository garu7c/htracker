import texts from '@/texts.json';

type TextsShape = typeof texts;

export function getTexts(preferredLang?: string) {
  // Default to Spanish for server-rendered pages unless a preferredLang is provided
  let lang = 'es';

  if (preferredLang && typeof preferredLang === 'string') {
    lang = preferredLang.split('-')[0];
  } else if (typeof navigator !== 'undefined') {
    lang = (navigator.language || 'es').split('-')[0];
  }

  // @ts-ignore - dynamic index from JSON
  return (texts as TextsShape)[lang] ?? (texts as TextsShape)['en'];
}
