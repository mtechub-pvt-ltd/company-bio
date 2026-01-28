// src/helper_functions/regionHelper.js
import { Country } from "country-state-city";

// Map ISO → Region
export const REGION_TO_COUNTRY_ISO = {
  "North America": ["US", "CA", "MX"],
  "South America": ["BR", "AR", "CL", "CO", "PE"],
  Europe: ["FR", "DE", "ES", "IT", "GB", "NL", "SE", "NO", "FI", "PL"],
  Asia: ["CN", "IN", "PK", "JP", "SG", "TH", "ID", "MY", "BD", "PH", "AE", "SA"],
  Africa: ["ZA", "NG", "EG", "KE", "MA", "TZ", "UG", "DZ"],
  Oceania: ["AU", "NZ", "FJ", "PG"],
};

// ✅ Get countries by region name
export function getCountriesByRegion(regionName) {
  const isoList = REGION_TO_COUNTRY_ISO[regionName] || [];
  const all = Country.getAllCountries();
  return all.filter((c) => isoList.includes(c.isoCode));
}
