export function getFallbackImage(category?: string | null): string {
  if (!category) return '/images/fallbacks/festival-default.png';

  const lowerCat = category.toLowerCase();
  
  if (lowerCat.includes('전통') || lowerCat.includes('문화') || lowerCat.includes('역사') || lowerCat.includes('culture') || lowerCat.includes('history')) {
    return '/images/fallbacks/festival-culture.svg';
  }
  
  if (lowerCat.includes('자연') || lowerCat.includes('생태') || lowerCat.includes('꽃') || lowerCat.includes('계절') || lowerCat.includes('nature') || lowerCat.includes('eco') || lowerCat.includes('flower')) {
    return '/images/fallbacks/festival-nature.svg';
  }
  
  if (lowerCat.includes('야간') || lowerCat.includes('빛') || lowerCat.includes('등불') || lowerCat.includes('night') || lowerCat.includes('light')) {
    return '/images/fallbacks/festival-night.svg';
  }
  
  if (lowerCat.includes('음식') || lowerCat.includes('먹거리') || lowerCat.includes('특산물') || lowerCat.includes('food') || lowerCat.includes('tasty') || lowerCat.includes('local')) {
    return '/images/fallbacks/festival-food.svg';
  }

  return '/images/fallbacks/festival-default.png';
}
