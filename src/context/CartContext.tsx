'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProductType } from '@/type/ProductType';

interface CartItem extends ProductType {
  sku: string;
  thumbnails: string[];
  quantityPurchase: number;
  salePrice: number;
  id: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartState {
  cartArray: CartItem[];
}

// Include quantityPurchase in the payload type as optional
type CartAction =
  | {
      type: 'ADD_TO_CART';
      payload: ProductType & Partial<Pick<CartItem, 'quantity' | 'selectedSize' | 'selectedColor' | 'quantityPurchase'>>;
    }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART'; payload: { itemId: string; quantity: number; selectedSize: string; selectedColor: string } }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextProps {
  cartState: CartState;
  addToCart: (
    item: ProductType & Partial<Pick<CartItem, 'quantity' | 'selectedSize' | 'selectedColor' | 'quantityPurchase'>>
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateCart: (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const newItem: CartItem = {
        ...action.payload,
        quantity: action.payload.quantity ?? 1,
        selectedSize: action.payload.selectedSize ?? '',
        selectedColor: action.payload.selectedColor ?? '',
        sku: action.payload.sku ?? 'N/A',
        thumbnails: action.payload.thumbnails ?? [],
        quantityPurchase: action.payload.quantityPurchase ?? 0, // Now valid due to updated payload type
        salePrice: action.payload.salePrice ?? action.payload.price,
        id: action.payload._id ?? 'unknown-id',
      };
      return {
        ...state,
        cartArray: [...state.cartArray, newItem],
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartArray: state.cartArray.filter((item) => item.id !== action.payload),
      };
    case 'UPDATE_CART':
      return {
        ...state,
        cartArray: state.cartArray.map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                quantity: action.payload.quantity,
                selectedSize: action.payload.selectedSize,
                selectedColor: action.payload.selectedColor,
              }
            : item
        ),
      };
    case 'LOAD_CART':
      return {
        ...state,
        cartArray: action.payload,
      };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, { cartArray: [] });

  const addToCart = (
    item: ProductType & Partial<Pick<CartItem, 'quantity' | 'selectedSize' | 'selectedColor' | 'quantityPurchase'>>
  ) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const updateCart = (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => {
    dispatch({ type: 'UPDATE_CART', payload: { itemId, quantity, selectedSize, selectedColor } });
  };

  return (
    <CartContext.Provider value={{ cartState, addToCart, removeFromCart, updateCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};