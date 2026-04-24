import type { Category, ContactRequest, Provider } from "./types";

export const categories = [
  {
    id: "1",
    name: "Lawyer",
    slug: "lawyer",
    image_url: "https://images.unsplash.com/photo-1607748851687-ba9a10438621"
    
  },
  {
    id: "2",
    name: "Immigration Consultant",
    slug: "immigration",
    image_url: "https://images.unsplash.com/photo-1521791055366-0d553872125f"
  },
  {
    id: "3",
    name: "Therapist",
    slug: "therapist",
    image_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54"
  },
  {
    id: "4",
    name: "Real Estate Agent",
    slug: "real-estate",
    image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994"
  },
  {
    id: "5",
    name: "Mortgage Broker",
    slug: "mortgage",
    image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c"
  },
  {
    id: "6",
    name: "Accountant",
    slug: "accountant",
    image_url: "https://images.unsplash.com/photo-1554224154-22dec7ec8818"
  },
  {
    id: "7",
    name: "Insurance Broker",
    slug: "insurance",
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf"
  },
  {
    id: "8",
    name: "Car Dealer",
    slug: "car-dealer",
    image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8"
  }
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
