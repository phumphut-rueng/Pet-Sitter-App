import Link from "next/link";
import { StatusBadge } from "@/components/badges/StatusBadge";
import type { ReportRow } from "@/types/admin/reports";

type Props = {
  reports: ReportRow[];
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function ReportsTable({ reports }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-2 bg-white">
      <table className="min-w-full">
        <thead>
          <tr className="bg-black text-white">
            <th className="px-5 py-3 text-left text-xs2-medium">User</th>
            <th className="px-5 py-3 text-left text-xs2-medium">Reported Person</th>
            <th className="px-5 py-3 text-left text-xs2-medium">Issue</th>
            <th className="px-5 py-3 text-left text-xs2-medium">Date Submitted</th>
            <th className="px-5 py-3 text-left text-xs2-medium">Status</th>
          </tr>
        </thead>

        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-8 text-center text-xs2-medium text-muted-text"
              >
                No reports found
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr
                key={report.id}
                className="border-t border-gray-2 last:border-b hover:bg-gray-1/50"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="block text-sm2-medium text-ink hover:underline"
                  >
                    {report.reporterName}
                  </Link>
                </td>

                <td className="px-5 py-4">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="block text-sm2-medium text-ink hover:underline"
                  >
                    {report.reportedPersonName || "-"}
                  </Link>
                </td>

                <td className="px-5 py-4">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="block max-w-[300px] truncate text-sm2-medium text-ink hover:underline"
                    title={report.issue}
                  >
                    {report.issue}
                  </Link>
                </td>

                <td className="px-5 py-4">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="block text-sm2-medium text-ink"
                  >
                    {formatDate(report.dateSubmitted)}
                  </Link>
                </td>

                <td className="px-5 py-4">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="block"
                  >
                    <StatusBadge status={report.status} />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}