export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  material: string | null;
  color: string | null;
  heelHeightCm: number | null;
  sizes: number[];
  price: number;
  stock: Record<string, number>;
  preorder: boolean;
  preorderPendingCount?: number;
  preorderNotificationThreshold?: number;
  preorderNotificationSent?: boolean;
  images: string[];
  altText: string | null;
  tags: string[] | null;
  characteristics: Record<string, string> | null;
}

export interface CartItem {
  productId: string;
  size: number;
  quantity: number;
  isPreorder?: boolean;
}
