export interface PRD {
  id: string
  user_id: string
  title: string
  original_idea: string
  generated_prd: string
  category: string | null
  status: 'draft' | 'final' | 'archived'
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export const PRODUCT_CATEGORIES = [
  'Web Application',
  'Mobile App',
  'SaaS Platform',
  'E-commerce',
  'AI/ML Product',
  'Developer Tool',
  'Consumer App',
  'Enterprise Software',
  'API/Service',
  'Other'
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

export type IdeaStatus = "new" | "in_progress" | "ready_for_prd" | "archived";
export type IdeaPriority = "low" | "medium" | "high";

export interface Idea {
  id: string;
  title: string;
  description: string;
  content: string | null;
  category: string;
  status: IdeaStatus;
  priority: IdeaPriority;
  market_size: string;
  competition: string;
  notes: string;
  is_favorite: boolean;
  target_audience?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface IdeaCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface IdeaConversation {
  id: string;
  idea_id: string;
  user_id: string;
  message: string;
  role: 'user' | 'assistant';
  created_at: string;
}
