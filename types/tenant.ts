export type Tenant = {
  id: string;
  name: string;
  email?: string | null;
  slug: string;
  domain?: string | null;
  heroSubtitle: string;
  heroCTA: string;
  logo: string;
  currency: string;
  heroImage: string;
  heroTitle: string;
};
