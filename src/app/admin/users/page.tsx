import { getSessionUser } from "@/lib/session";
import { getAllUsers, toAdminUserSummary } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { AdminSearchBox } from "@/components/admin/AdminSearchBox";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const currentUser = await getSessionUser();
  const canEdit = currentUser?.role === "ADMIN";

  const users = (await getAllUsers(q)).map(toAdminUserSummary);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="admin.users.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="admin.users.subtitle" />
        </p>
      </div>

      <AdminSearchBox basePath="/admin/users" initialQuery={q} />

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-start dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.users.email" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.users.name" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.users.role" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.users.specialty" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.users.joined" />
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{u.email}</td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{u.name ?? "—"}</td>
                <td className="px-3 py-2">
                  <UserRoleSelect userId={u.id} role={u.role} canEdit={canEdit} />
                </td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{u.specialty ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-400">
                  <TranslatedText k="admin.users.empty" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
