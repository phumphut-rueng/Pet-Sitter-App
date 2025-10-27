import { PetPawLoadingSmall } from "@/components/loading/PetPawLoadingSmall";
import { Pagination } from "@/components/pagination/Pagination";
import { PaginationInfo } from "@/components/pagination/PaginationInfo";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";

interface HistoryRecord {
  id: number;
  statusName: string;
  adminName?: string;
  adminNote?: string;
  changedAt: string;
}

interface SitterHistoryProps {
  historyData: HistoryRecord[];
  loadingHistory: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalRecords: number;
  itemsPerPage: number;
  getStatusKey: (status: string) => StatusKey;
}

export default function SitterHistory({
  historyData,
  loadingHistory,
  totalPages,
  currentPage,
  onPageChange,
  totalRecords,
  itemsPerPage,
  getStatusKey,
}: SitterHistoryProps) {
  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-ink mb-6">Approval History</h3>

      {loadingHistory ? (
        <div className="flex justify-center py-8">
          <PetPawLoadingSmall message="Loading History" />
        </div>
      ) : historyData.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-medium text-muted-text uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-medium text-muted-text uppercase tracking-wider">
                    Approved By
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-medium text-muted-text uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-medium text-muted-text uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {historyData.map((record, index) => (
                  <tr
                    key={record.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-muted"}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <StatusBadge status={getStatusKey(record.statusName)} />
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-ink">
                      {record.adminName || "System"}
                    </td>
                    <td className="px-8 py-6 text-sm text-ink">
                      <div className="max-w-lg">
                        <p className="text-sm text-muted-text break-words leading-relaxed">
                          {record.adminNote || "No note provided"}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-muted-text">
                      {new Date(record.changedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-border">
              <PaginationInfo
                currentCount={historyData.length}
                totalCount={totalRecords}
                currentPage={currentPage}
                totalPages={totalPages}
                limit={itemsPerPage}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onClick={onPageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-text mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-ink mb-2">No History Found</h3>
          <p className="text-xl text-muted-text">
            No approval history available for this pet sitter.
          </p>
        </div>
      )}
    </div>
  );
}
