import React from "react";


export type StatusKey =
  // Booking
  | "waitingConfirm"
  | "waitingService"
  | "inService"
  | "success"
  | "canceled"
  // Pet Sitter
  | "pendingSubmission"
  | "waitingApprove"
  | "approved"
  | "rejected"
  // Report
  | "newReport"
  | "pending"
  | "resolved"
  // Pet Owner
  | "normal"
  | "banned";

const LABEL: Record<StatusKey, string> = {
  waitingConfirm: "Waiting for confirm",
  waitingService: "Waiting for service",
  inService: "In service",
  success: "Success",
  canceled: "Canceled",
  pendingSubmission: "Pending submission",
  waitingApprove: "Waiting for approve",
  approved: "Approved",
  rejected: "Rejected",
  newReport: "New Report",
  pending: "Pending",
  resolved: "Resolved",
  normal: "Normal",
  banned: "Banned",
};

const TONE: Record<StatusKey, string> = {
  waitingConfirm: "text-pink",
  waitingService: "text-yellow",
  inService: "text-blue",
  success: "text-green",
  canceled: "text-red",

  pendingSubmission: "text-gray-6",
  waitingApprove: "text-pink",
  approved: "text-green",
  rejected: "text-red",

  newReport: "text-pink",
  pending: "text-blue",
  resolved: "text-green",

  normal: "text-green",
  banned: "text-red",
};

type Props = { status: StatusKey; className?: string };

export function StatusBadge({ status, className = "" }: Props) {
  const tone = TONE[status];
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 font-medium ${tone} ${className}`}
    >
      <span className="w-[6px] h-[6px] rounded-full bg-current" />
      {LABEL[status]}
    </span>
  );
}