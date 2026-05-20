export type Tenant = {
  id: string;
  name: string;
  email: string;
  slug: string;
  domain?: string | null;
  heroSubtitle: string;
  heroCTA: string;
  logo: string;
  currency: string;
  heroImage: string;
  heroTitle: string;
};
