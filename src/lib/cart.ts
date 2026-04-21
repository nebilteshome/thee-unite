/**
 * Shared cart store for the application.
 * In a real app, this would use a state management library or context.
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

// Creating a global-ish store for the demo
let cartItems: CartItem[] = [];
let listeners: (() => void)[] = [];
let isCartOpen = false;

export const cartStore = {
  get items() { return cartItems; },
  get isOpen() { return isCartOpen; },
  
  setIsOpen(open: boolean) {
    isCartOpen = open;
    this.notify();
  },

  addItem(item: CartItem) {
    const existingIndex = cartItems.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += 1;
    } else {
      cartItems = [...cartItems, item];
    }
    this.notify();
    this.setIsOpen(true);
  },

  removeItem(id: string) {
    cartItems = cartItems.filter(i => i.id !== id);
    this.notify();
  },

  updateQuantity(id: string, delta: number) {
    cartItems = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    this.notify();
  },

  clearCart() {
    cartItems = [];
    this.notify();
  },

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  notify() {
    listeners.forEach(l => l());
  }
};
