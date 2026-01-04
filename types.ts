import { LucideIcon } from 'lucide-react';

export interface Treatment {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  isPopular?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  image?: string;
}

export interface BeforeAfterImage {
  id: number;
  before: string;
  after: string;
  label: string;
}

export interface InstagramPost {
  id: number;
  image: string;
  likes: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  longDescription?: string;
  ingredients?: string[];
  usage?: string;
  benefits?: string[];
  costPrice?: number;
  stock?: number;
  media?: { type: 'image' | 'video'; url: string }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    identification: string; // Cédula/NIT
    address: string;
    apartment?: string; // Optional
    department?: string;
    city: string;
    postalCode?: string; // Optional
    notes?: string;
  };
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'approved' | 'declined' | 'voided';
  transactionId?: string;
  createdAt: any; // Firebase Timestamp
}

export interface Payment {
  id: string; // Wompi Transaction ID
  orderId: string; // Reference to Order
  userId: string;
  amountInCents: number;
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  paymentMethod: string; // CARD, NEQUI, PSE, etc.
  reference: string;
  createdAt: any; // Firebase Timestamp
  customerEmail: string;
}

export interface Address {
  id: string;
  name: string; // e.g., "Casa", "Oficina"
  recipientName: string;
  phone: string;
  address: string;
  department: string;
  city: string;
  notes?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string;
  addresses?: Address[];
  role?: 'admin' | 'customer';
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null; // null for top-level categories
  level: number; // 0 for root, 1 for sub, 2 for sub-sub
  createdAt?: any;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'customer';
  message: string;
  createdAt: any; // Firebase Timestamp
}
