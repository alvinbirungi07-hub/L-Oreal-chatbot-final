export type Category = 'All' | 'Skincare' | 'Haircare' | 'Makeup' | 'Fragrance';

export type LanguageMode = 'en' | 'ar';

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  brand: string;
  brandAr: string;
  category: Exclude<Category, 'All'>;
  categoryAr: string;
  size: string;
  keyActives: string[];
  shortSummary: string;
  shortSummaryAr: string;
  description: string;
  descriptionAr: string;
  howToUse: string;
  howToUseAr: string;
  image: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: GroundingSource[];
  timestamp: number;
}
