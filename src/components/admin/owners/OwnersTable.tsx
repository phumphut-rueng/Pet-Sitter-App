import Link from "next/link";
import { cn } from "@/lib/utils/utils";
import type { OwnerRow } from "@/types/admin/owners";
import CloudAvatar from "./CloudAvatar";

function StatusDot({ ok = true }: { ok?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full align-middle",
        ok ? "bg-success" : "bg-error" 
      )}
      aria-hidden="true"
    />
  );
}

export default function OwnersTable({ rows }: { rows: OwnerRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <table className="min-w-full">
        <thead>
          <tr className="bg-[var(--color-ink)]/90 text-[var(--color-white)]">
            <th className="px-5 py-3 text-xs2-medium text-justify">Pet Owner</th>
            <th className="px-5 py-3 text-xs2-medium text-justify">Phone</th>
            <th className="px-5 py-3 text-xs2-medium text-justify">Email</th>
            <th className="px-5 py-3 text-xs2-medium text-justify">Pet(s)</th>
            <th className="px-5 py-3 text-xs2-medium text-justify">Status</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-8 text-center text-xs2-medium text-[var(--muted-text)]"
              >
                No data
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const isActive = r.status === "normal"; 
              return (
                <tr
                  key={r.id}
                  className="border-t border-[var(--color-border)] last:border-b hover:bg-[var(--color-muted)]/20"
                >
                  {/* Owner */}
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
                          <div className="text-sm2-medium text-justify text-ink truncate">
                            {r.name || "(no name)"}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4 text-sm2-medium text-justify text-ink">
                    {r.phone ?? "-"}
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-sm2-medium text-justify text-ink">
                    {r.email}
                  </td>

                  {/* Pet(s) */}
                  <td className="px-5 py-4 text-sm2-medium text-justify text-ink">
                    {r.pet_count ?? 0}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <div
                      className="text-sm2-medium text-justify flex items-center gap-2 text-ink"
                      title={isActive ? "Normal" : "Banned"}
                    >
                      <StatusDot ok={isActive} />
                      {isActive ? "Normal" : "Banned"}
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