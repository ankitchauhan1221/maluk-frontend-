// src/type/ProductType.ts
export interface ProductType {
  id: string;
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number;
  category: {
    _id: string;
    name: string;
    status?: string;
    productCount?: number;
    subcategoryCount?: number;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  thumbnails: string[];
  gallery: string[];
  sku: string;
  stock: number;
  specifications: string;
  reviews?: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  type?: string;
  gender?: string;
  new?: boolean;
  sale?: boolean;
  rate?: number;
  originPrice?: number;
  brand?: string;
  sold?: number;
  slug?: string;
  createdAt?: string | Date; // Ensure this is present
  updatedAt?: string | Date; // Ensure this is present
}