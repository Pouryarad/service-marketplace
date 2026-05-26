export type Role = "client" | "provider" | "admin";

export type ProviderStatus =
  | "draft"
  | "completed"
  | "pending"
  | "approved"
  | "active"
  | "expired"
  | "suspended";

export type SubscriptionStatus = "active" | "expired" | "pending" | "none" | "trialing";

export type Category = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
};

export type Provider = {
  id: string;
  userId?: string;
  slug: string;
  fullName: string;
  businessName?: string | null;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  location: string;
  language: string;
  email: string;
  phone: string;
  bio: string;
  oneLine: string;
  profilePhotoUrl: string;
  portfolioPhotoUrls: string[];
  approved: boolean;
  suspended: boolean;
  status: ProviderStatus;
  subscriptionStatus: SubscriptionStatus;
  featuredRank?: number | null;
  clicksDay: number;
  clicksWeek: number;
  clicksMonth: number;
  videoUrl?: string | null;
  pendingProfilePhotoUrl?: string | null;
  adminGranted?: boolean;
  adminGrantedExpiresAt?: string | null;
  trialEndsAt?: string | null;
  referralCode?: string | null;
  aiTrainedAt?: string | null;
};

export type ContactRequest = {
  id: string;
  providerId?: string;
  providerName?: string;
  clientName: string;
  clientEmail: string;
  phone?: string | null;
  message: string;
  status: "new" | "contacted";
  createdAt: string;
};

export type ProviderRequest = {
  id: string;
  clientName: string;
  clientEmail: string;
  phone?: string | null;
  message: string;
  status: "new" | "contacted";
  created_at: string;
};
