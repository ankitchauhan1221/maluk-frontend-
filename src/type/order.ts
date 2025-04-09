// types/order.ts
export interface Address {
    name: string;
    lastname: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
  }
  
  export interface Product {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    thumbnail: string;
  }
  
  export interface Order {
    orderId: string;
    products: Product[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: Address;
    billingAddress: Address;
    shippingCost: number;
    couponCode?: string;
    discountAmount: number;
    transactionId?: string;
    trackingNumber?: string;
    status: string;
    paymentStatus: string;
  }


  // @/type/WishlistItem.ts
export interface WishlistItem {
  id: string;             // Unique identifier (assuming `id` not `_id` based on your latest code)
  category: string;       // Product category
  type: string;           // Product type
  name: string;           // Product name
  gender: string;         // Gender target
  new: boolean;           // Is it a new product?
  sale: boolean;          // Is it on sale?
  rate: number;           // Product rating
  price: number;          // Current price
  originPrice: number;    // Original price before discount
  brand: string;          // Brand name
  sold: number;           // Number of items sold
  quantity: number;       // Stock quantity
  quantityPurchase: number; // Quantity added to wishlist or purchased
  sizes: string[];        // Available sizes
  variation: any[];       // Product variations (adjust type as needed)
  thumbImage: string[];   // Thumbnail images
  images: string[];       // Full-size images
  description: string;    // Product description
  action: string;         // Action type (e.g., "add", "remove")
  slug: string;           // URL-friendly slug
}