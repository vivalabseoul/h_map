import { CATEGORIES, CategoryMeta, Workshop } from '@/types';

/**
 * Generates a color based on a string hash.
 * This ensures that a custom category always gets the same color.
 */
function getHashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to a 6-digit hex color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    // ensure contrast by keeping it relatively light/bright
    const adjusted = Math.min(255, Math.max(100, value));
    color += ('00' + adjusted.toString(16)).slice(-2);
  }
  return color;
}

/**
 * Extracts unique categories from a list of workshops,
 * and merges them with the base CATEGORIES.
 */
export function getDynamicCategories(workshops: Workshop[]): CategoryMeta[] {
  const dynamicCategories: CategoryMeta[] = [...CATEGORIES];
  const existingKeys = new Set(CATEGORIES.map((c) => c.key));

  if (!workshops) return dynamicCategories;

  workshops.forEach((workshop) => {
    if (workshop.category && !existingKeys.has(workshop.category)) {
      existingKeys.add(workshop.category);
      dynamicCategories.push({
        key: workshop.category,
        emoji: '✨', // Default emoji for custom categories
        color: getHashColor(workshop.category), // Consistent color based on name
      });
    }
  });

  return dynamicCategories;
}
