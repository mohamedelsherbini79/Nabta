import { getAnalyticsSummary } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { StatCard } from "@/components/admin/StatCard";
import { WeeklySignupsChart } from "@/components/admin/WeeklySignupsChart";

export default async function AdminAnalyticsPage() {
  const summary = await getAnalyticsSummary();
  const totalUsers = Object.values(summary.usersByRole).reduce((sum, n) => sum + n, 0);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="admin.analytics.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="admin.analytics.subtitle" />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard labelKey="admin.analytics.totalUsers" value={totalUsers} />
        <StatCard labelKey="admin.analytics.patients" value={summary.usersByRole.PATIENT} />
        <StatCard labelKey="admin.analytics.doctors" value={summary.usersByRole.DOCTOR} />
        <StatCard labelKey="admin.analytics.admins" value={summary.usersByRole.ADMIN} />
        <StatCard labelKey="admin.analytics.patientProfiles" value={summary.patientProfileCount} />
        <StatCard labelKey="admin.analytics.consultationsBooked" value={summary.consultationsByStatus.BOOKED} />
        <StatCard labelKey="admin.analytics.consultationsCompleted" value={summary.consultationsByStatus.COMPLETED} />
        <StatCard labelKey="admin.analytics.pharmacyOrders" value={summary.pharmacyOrderCount} />
        <StatCard labelKey="admin.analytics.pharmacyRevenue" value={summary.pharmacyRevenue.toFixed(0)} />
        <StatCard labelKey="admin.analytics.communityPosts" value={summary.communityPostCount} />
        <StatCard labelKey="admin.analytics.communityComments" value={summary.communityCommentCount} />
        <StatCard labelKey="admin.analytics.loyaltyPointsIssued" value={summary.loyaltyPointsIssued} />
      </div>

      <WeeklySignupsChart data={summary.weeklySignups} />
    </div>
  );
}
