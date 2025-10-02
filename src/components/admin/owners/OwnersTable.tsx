import Image from "next/image"
import { cn } from "@/lib/utils"
import type { OwnerRow } from "@/types/admin/owners"


function StatusDot({ ok = true }: { ok?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        ok ? "bg-green" : "bg-red"
      )}
    />
  )
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
              <td className="px-5 py-8 text-center text-gray-500 body-sm" colSpan={5}>
                No data
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-t last:border-b hover:bg-gray-50">
                {/* Pet Owner */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200">
                      <Image
                        src={
                          r.profile_image ??
                          "/images/avatar-default.png" 
                        }
                        alt={r.name ?? r.email}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="body-sm text-ink/90 truncate">
                        {r.name || "(no name)"}
                      </div>
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
                  <div className="body-sm flex items-center gap-2 text-ink/90">
                    <StatusDot ok />
                    Normal
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}