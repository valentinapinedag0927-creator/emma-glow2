
export enum ViewState {
  HOME = 'HOME',
  ANALYSIS = 'ANALYSIS',
  INGREDIENTS = 'INGREDIENTS',
  ROUTINE_BUILDER = 'ROUTINE_BUILDER',
  ADVISOR = 'ADVISOR',
  SHOP = 'SHOP',
  EDUCATION = 'EDUCATION',
  SMART_MIRROR = 'SMART_MIRROR',
  REACTION = 'REACTION',
  PRODUCT_HISTORY = 'PRODUCT_HISTORY',
  LOGIN = 'LOGIN'
}

export interface Product {
  id: string;
  nombre: string;
  marca: string;
  imageUrl: string;
  precio: number;
  categoria: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
  history: any[];
  routineHistory: any[];
  trackers: any[];
}

export interface AnalysisResult {
  date: string;
  score: number;
  concerns: string[];
}
