export interface CartItem {
  productId: string;
  name: string;
  price: number;
  shippingCharge?: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  stockQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}