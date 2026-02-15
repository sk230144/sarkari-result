import { getAdminUsers } from "@/lib/actions/users";
import { Badge } from "@/components/ui/badge";
import { Crown, Users } from "lucide-react";
import { format } from "date-fns";
import { UserActions } from "@/components/admin/user-actions";
import { UserSearch } from "@/components/admin/user-search";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const search = params.search || "";
  const { users, count } = await getAdminUsers(page, search);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Manage Users
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {count} registered users
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <UserSearch defaultValue={search} />
      </div>

      {users.length === 0 ? (
        <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-12 text-center">
          <div className="icon-3d h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7 text-blue-400" />
          </div>
          <p className="text-slate-600 font-bold text-lg">
            {search ? "No users found" : "No users yet"}
          </p>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            {search
              ? "Try a different search term"
              : "Users will appear here when they sign up"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="card-3d bg-white rounded-xl border border-slate-200/60 p-4 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold ${
                      user.is_premium
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {(user.full_name || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-extrabold text-slate-800 truncate">
                        {user.full_name || "No name"}
                      </p>
                      {user.is_premium && (
                        <Badge className="text-[10px] bg-violet-100 text-violet-700 border-0 font-bold gap-1">
                          <Crown className="h-2.5 w-2.5" />
                          Premium
                          {user.premium_plan
                            ? ` · ${user.premium_plan}`
                            : ""}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {user.email}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Joined{" "}
                      {format(new Date(user.created_at), "dd MMM yyyy")}
                      {user.is_premium && user.premium_expires_at && (
                        <>
                          {" "}
                          · Expires{" "}
                          {format(
                            new Date(user.premium_expires_at),
                            "dd MMM yyyy"
                          )}
                        </>
                      )}
                      {user.is_premium &&
                        !user.premium_expires_at &&
                        user.premium_plan === "lifetime" && (
                          <> · Lifetime</>
                        )}
                    </p>
                  </div>
                </div>
                <UserActions user={user} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {count > 20 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from(
            { length: Math.ceil(count / 20) },
            (_, i) => i + 1
          ).map((p) => (
            <a
              key={p}
              href={`/admin/users?page=${p}${search ? `&search=${search}` : ""}`}
              className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-blue-50 border border-slate-200"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
