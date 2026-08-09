import { Country, State } from "country-state-city";

export const normalizeCountryCode = (country: string) => {
  if (!country) return "";

  // Already an ISO country code
  if (country.length === 2) {
    return country.toUpperCase();
  }

  // Convert stored country name → ISO code
  const match = Country.getAllCountries().find(
    (item) => item.name.toLowerCase() === country.trim().toLowerCase(),
  );

  return match?.isoCode ?? country;
};
