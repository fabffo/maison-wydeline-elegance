export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  materials: string[];
  color: string;
  heelHeightCm: number;
  sizes: number[];
  price: number;
  stock: Record<string, number>;
  preorder: boolean;
  images: string[];
  alt: string;
  tags: string[];
}

export interface CartItem {
  productId: string;
  size: number;
  quantity: number;
}
