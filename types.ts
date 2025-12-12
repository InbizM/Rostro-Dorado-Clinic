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