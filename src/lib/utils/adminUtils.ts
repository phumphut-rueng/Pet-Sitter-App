import type { StatusKey } from "@/components/badges/StatusBadge";

export function getStatusKey(status: string): StatusKey {
  switch (status) {
    case "Waiting for approve":
      return "waitingApprove";
    case "Approved":
      return "approved";
    case "Rejected":
      return "rejected";
    default:
      return "waitingApprove";
  }
}
