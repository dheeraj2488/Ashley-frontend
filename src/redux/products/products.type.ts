export interface Product {
    id: string;
    name: string;
    price: number;
  shippingCharge?: number;
  discounted?: boolean;
  discountPercent?: number;
    images: string[];
    description: string;
    sizes: string[];
    colors: string[];
  categoryId?: string;
  categoryName?: string;
  stockQuantity?: number;
  featured?: boolean;
  isActive?: boolean;
  }
  
 export interface ProductsState {
    productsList: Product[];
    loading: boolean;
    error: string | null;
  }