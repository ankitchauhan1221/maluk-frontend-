'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProductType } from '@/type/ProductType';

// Define CompareItem as ProductType (no extension needed unless adding fields)
type CompareItem = ProductType;

interface CompareState {
  compareArray: CompareItem[];
}

type CompareAction =
  | { type: 'ADD_TO_COMPARE'; payload: ProductType }
  | { type: 'REMOVE_FROM_COMPARE'; payload: string }
  | { type: 'LOAD_COMPARE'; payload: CompareItem[] };

interface CompareContextProps {
  compareState: CompareState;
  addToCompare: (item: ProductType) => void;
  removeFromCompare: (itemId: string) => void;
}

const CompareContext = createContext<CompareContextProps | undefined>(undefined);

const compareReducer = (state: CompareState, action: CompareAction): CompareState => {
  switch (action.type) {
    case 'ADD_TO_COMPARE':
      const newItem: CompareItem = { ...action.payload };
      return {
        ...state,
        compareArray: [...state.compareArray, newItem],
      };
    case 'REMOVE_FROM_COMPARE':
      return {
        ...state,
        compareArray: state.compareArray.filter((item) => item._id !== action.payload), // Use _id instead of id
      };
    case 'LOAD_COMPARE':
      return {
        ...state,
        compareArray: action.payload,
      };
    default:
      return state;
  }
};

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareState, dispatch] = useReducer(compareReducer, { compareArray: [] });

  const addToCompare = (item: ProductType) => {
    dispatch({ type: 'ADD_TO_COMPARE', payload: item });
  };

  const removeFromCompare = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_COMPARE', payload: itemId });
  };

  return (
    <CompareContext.Provider value={{ compareState, addToCompare, removeFromCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};