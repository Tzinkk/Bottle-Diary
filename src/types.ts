import { Timestamp } from 'firebase/firestore';

export type WineType = 'Red' | 'White' | 'Natural Red' | 'Natural White' | 'Natural Orange' | 'Orange' | 'Rose' | 'Pet Nat' | 'Sparkling Wine' | 'Sato' | 'Sake';

export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Timestamp;
}

export interface Bottle {
  id?: string;
  name: string;
  winery: string;
  type?: WineType;
  vintage?: string | number;
  region?: string;
  country?: string;
  rating?: number;
  tastingNotes?: string;
  price?: number;
  quantity?: number;
  grapes?: string;
  note?: string;
  imageUrl?: string;
  purchaseDate?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
