export type Role = "CLIENT" | "ADMIN" | "SUPERADMIN";
export type ProductCondition = "NEUF" | "OCCASION";
export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "FAILED";
export type PaymentProvider = "ORANGE_MONEY" | "MTN_MOMO";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type User = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  icon: string | null;
  description: string | null;
};

export type Product = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string;
  descriptionEn: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  condition: ProductCondition;
  brand: string | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  reviews?: Review[];
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: User;
};

export type Address = {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  landmark: string | null;
  isDefault: boolean;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type Payment = {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  phoneNumber: string;
  amount: number;
  transactionRef: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
  payment: Payment | null;
};
