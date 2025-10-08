import Link from "next/link";
import { cn } from "@/lib/utils/utils";
import type { OwnerRow } from "@/types/admin/owners";
import CloudAvatar from "./CloudAvatar";

function StatusDot({ ok = true }: { ok?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full align-middle",
        ok ? "bg-green" : "bg-red"
      )}
      aria-hidden="true"
    />
  );
}

export default function OwnersTable({ rows }: { rows: OwnerRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="min-w-full">
        <thead>
          <tr className="bg-ink/[0.92] text-white text-left">
            <th className="px-5 py-3 caption font-medium">Pet Owner</th>
            <th className="px-5 py-3 caption font-medium">Phone</th>
            <th className="px-5 py-3 caption font-medium">Email</th>
            <th className="px-5 py-3 caption font-medium">Pet(s)</th>
            <th className="px-5 py-3 caption font-medium">Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-gray-500 body-sm">
                No data
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const isActive = r.status === "ACTIVE";
              return (
                <tr key={r.id} className="border-t last:border-b hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <CloudAvatar
                        publicId={r.profile_image_public_id ?? undefined}
                        legacyUrl={r.profile_image ?? undefined}
                        alt={r.name || r.email}
                        size={40}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/owner/${r.id}`}
                          className="block max-w-[220px] truncate hover:underline"
                        >
                          <div className="body-sm text-ink/90 truncate">
                            {r.name || "(no name)"}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4 body-sm text-ink/80">{r.phone ?? "-"}</td>

                  {/* Email */}
                  <td className="px-5 py-4 body-sm text-ink/80">{r.email}</td>

                  {/* Pet(s) */}
                  <td className="px-5 py-4 body-sm text-ink/80">{r.pet_count ?? 0}</td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <div
                      className="body-sm flex items-center gap-2 text-ink/90"
                      title={isActive ? "Active" : "Suspended"}
                    >
                      <StatusDot ok={isActive} />
                      {isActive ? "Active" : "Suspended"}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}