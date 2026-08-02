import { getSessionUser } from "@/lib/session";
import { getFacilityCities, searchFacilities, toHealthFacilitySummary } from "@/lib/healthMap";
import { getCountryFromCookies } from "@/country/getCountryServer";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { FacilitySearch } from "@/components/healthMap/FacilitySearch";

export default async function HealthMapPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const country = await getCountryFromCookies();
  const [facilities, cityRows] = await Promise.all([searchFacilities(country, {}), getFacilityCities(country)]);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="healthMap.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="healthMap.subtitle" />
        </p>
      </div>

      <FacilitySearch
        initialFacilities={facilities.map(toHealthFacilitySummary)}
        initialCities={cityRows.map((row) => row.city)}
      />
    </div>
  );
}
