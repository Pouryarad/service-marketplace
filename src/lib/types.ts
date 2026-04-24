export type Role = "client" | "provider" | "admin";

export type ProviderStatus =
  | "draft"
  | "completed"
  | "pending"
  | "approved"
  | "active"
  | "expired"
  | "suspended";

export type SubscriptionStatus = "active" | "expired" | "pending" | "none";

export type Category = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
};

export type Provider = {
  id: string;
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
};

export type ContactRequest = {
  id: string;
  providerId: string;
  providerName: string;
  clientName: string;
  clientEmail: string;
  phone?: string | null;
  message: string;
  status: "new" | "contacted";
  createdAt: string;
};
