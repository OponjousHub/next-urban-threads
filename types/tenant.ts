export type Tenant = {
  id: string;
  name: string;

  email?: string | null;
  slug: string;
  domain?: string | null;

  heroSubtitle?: string | null;
  heroCTA?: string | null;
  logo?: string | null;
  currency: string;
  heroImage?: string | null;
  heroTitle?: string | null;

  storeMode: "SINGLE_VENDOR" | "MULTI_VENDOR";
};
