// MenuVerse types matching the Firebase data structure

export interface Eatery {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  // Additional fields for compatibility with our existing system
  _id: string;
  image?: string;
  address?: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  imageUrl?: string;
  imageHint?: string;
  eateryId: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | Date;
}

export interface Order {
  id: string;
  eateryId: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date | {
    seconds: number;
    nanoseconds: number;
  };
  notes?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
  type: 'new-item' | 'item-update' | 'item-delete' | 'general';
  eateryId: string;
}