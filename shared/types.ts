export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: string;
  features: string[];
  images: string[];
  isVirtual: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
} 