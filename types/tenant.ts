// export type Tenant = {
//   id: string;
//   name: string;
//   email?: string | null;
//   slug: string;
//   domain?: string | null;
//   heroSubtitle: string;
//   heroCTA: string;
//   logo: string;
//   currency: string;
//   heroImage: string;
//   heroTitle: string;
//   storeMode: "SINGLE_VENDOR" | "MULTI_VENDOR";
// };
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
