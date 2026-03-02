
export interface Poetry {
  id: string | number;
  text: string;
  poet: string;
  type: string;
  source?: string;
  isUserAdded?: boolean;
  isFavorite?: boolean;
  createdAt?: number;
}

export type PoetryType = 'ghazal' | 'shayari' | 'all' | 'favorites';
