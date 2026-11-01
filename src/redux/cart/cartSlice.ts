import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, CartState } from './cart.type';

const persistedItems = localStorage.getItem('ashley_cart_items');

const initialState: CartState = {
  items: persistedItems ? (JSON.parse(persistedItems) as CartItem[]) : [],
  isOpen: false,
};

const persistCart = (items: CartItem[]) => {
  localStorage.setItem('ashley_cart_items', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((item) => item.productId === action.payload.productId);
      if (existing) {
        existing.quantity = Math.min((existing.stockQuantity ?? Infinity), existing.quantity + action.payload.quantity);
      } else {
        state.items.push(action.payload);
      }
      persistCart(state.items);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((entry) => entry.productId === action.payload.productId);
      if (!item) {
        return;
      }

      item.quantity = Math.max(1, action.payload.quantity);
      if (item.stockQuantity !== undefined) {
        item.quantity = Math.min(item.quantity, item.stockQuantity);
      }
      persistCart(state.items);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      persistCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      persistCart(state.items);
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
  },
});

export const {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;