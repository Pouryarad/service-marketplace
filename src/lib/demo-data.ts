import type { Category, ContactRequest, Provider } from "./types";

export const categories: Category[] = [
  {
    id: "home-cleaning",
    slug: "home-cleaning",
    name: "Home Cleaning",
    subtitle: "Reliable cleaners for homes, rentals, and offices.",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "plumbing",
    slug: "plumbing",
    name: "Plumbing",
    subtitle: "Leak repairs, installs, inspections, and urgent help.",
    imageUrl:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "beauty",
    slug: "beauty",
    name: "Beauty",
    subtitle: "Stylists, makeup artists, nails, and personal care.",
    imageUrl:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tutoring",
    slug: "tutoring",
    name: "Tutoring",
    subtitle: "Academic support, test prep, and language lessons.",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fitness",
    slug: "fitness",
    name: "Fitness",
    subtitle: "Personal training, yoga, pilates, and wellness coaching.",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "photography",
    slug: "photography",
    name: "Photography",
    subtitle: "Portraits, events, products, and family sessions.",
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "moving",
    slug: "moving",
    name: "Moving",
    subtitle: "Local moves, packing, deliveries, and lifting help.",
    imageUrl:
      "https://images.unsplash.com/photo-1600518464441-9306b00c4b2c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "landscaping",
    slug: "landscaping",
    name: "Landscaping",
    subtitle: "Lawn care, garden design, cleanups, and seasonal work.",
    imageUrl:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80",
  },
];

export const providers: Provider[] = [
  {
    id: "mira-clean-co",
    fullName: "Mira Solano",
    businessName: "Mira Clean Co.",
    categoryId: "home-cleaning",
    categorySlug: "home-cleaning",
    categoryName: "Home Cleaning",
    location: "Vancouver, BC",
    language: "English, Spanish",
    email: "mira@example.com",
    phone: "+1 604 555 0188",
    bio: "Detail-first home cleaning for busy households and short-term rentals. Mira's team uses client notes, checklists, and eco-conscious supplies for repeatable results.",
    oneLine: "Eco-conscious residential and rental cleaning with checklist quality.",
    profilePhotoUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    portfolioPhotoUrls: [
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80",
    ],
    approved: true,
    suspended: false,
    status: "active",
    subscriptionStatus: "active",
    featuredRank: 1,
    clicksDay: 18,
    clicksWeek: 96,
    clicksMonth: 412,
  },
  {
    id: "northline-plumbing",
    fullName: "Owen Hart",
    businessName: "Northline Plumbing",
    categoryId: "plumbing",
    categorySlug: "plumbing",
    categoryName: "Plumbing",
    location: "Burnaby, BC",
    language: "English",
    email: "owen@example.com",
    phone: "+1 604 555 0192",
    bio: "Licensed plumbing for leak repairs, fixture swaps, water heaters, and preventive inspections. Clear quotes, tidy work, and photo notes after each job.",
    oneLine: "Licensed repairs, installs, and inspections with clear quotes.",
    profilePhotoUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
    portfolioPhotoUrls: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80",
    ],
    approved: true,
    suspended: false,
    status: "active",
    subscriptionStatus: "active",
    featuredRank: 2,
    clicksDay: 11,
    clicksWeek: 63,
    clicksMonth: 280,
  },
  {
    id: "studio-luma",
    fullName: "Anika Rao",
    businessName: "Studio Luma",
    categoryId: "photography",
    categorySlug: "photography",
    categoryName: "Photography",
    location: "Richmond, BC",
    language: "English, Hindi",
    email: "anika@example.com",
    phone: "+1 778 555 0120",
    bio: "Warm natural-light photography for families, professionals, and small brands. Sessions include planning help, light retouching, and a private gallery.",
    oneLine: "Natural-light portraits and brand sessions with guided planning.",
    profilePhotoUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
    portfolioPhotoUrls: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
    ],
    approved: true,
    suspended: false,
    status: "active",
    subscriptionStatus: "active",
    featuredRank: null,
    clicksDay: 8,
    clicksWeek: 44,
    clicksMonth: 190,
  },
];

export const requests: ContactRequest[] = [
  {
    id: "req-001",
    providerId: "mira-clean-co",
    providerName: "Mira Clean Co.",
    clientName: "Sam Taylor",
    clientEmail: "sam@example.com",
    phone: "+1 604 555 0100",
    message: "Looking for a biweekly cleaning slot for a two-bedroom apartment.",
    status: "new",
    createdAt: "2026-04-20T18:00:00.000Z",
  },
];
