import { prisma } from "@/lib/prisma";
import type { CountryCode } from "@/country/country";
import type { HealthFacilitySearchInput } from "@/lib/validation";
import type { HealthFacilitySummary } from "@/types";

interface HealthFacilityRow {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
}

export function searchFacilities(country: CountryCode, filters: HealthFacilitySearchInput) {
  return prisma.healthFacility.findMany({
    where: {
      country,
      ...(filters.city ? { city: { equals: filters.city, mode: "insensitive" } } : {}),
      ...(filters.type ? { type: filters.type } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export function getFacilityCities(country: CountryCode) {
  return prisma.healthFacility.findMany({
    where: { country },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
}

export function toHealthFacilitySummary(facility: HealthFacilityRow): HealthFacilitySummary {
  return {
    id: facility.id,
    name: facility.name,
    type: facility.type as HealthFacilitySummary["type"],
    city: facility.city,
    address: facility.address,
    phone: facility.phone,
    lat: facility.lat,
    lng: facility.lng,
  };
}
