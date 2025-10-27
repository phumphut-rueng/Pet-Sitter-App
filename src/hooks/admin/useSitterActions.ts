import { useState } from "react";
import toast from "react-hot-toast";
import { AdminSitterService } from "@/lib/services/adminSitterService";

export function useSitterActions() {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApproveSitter = async (sitterId: number) => {
    try {
      await AdminSitterService.approveSitter(sitterId);
      toast.success("Pet Sitter approved successfully", {
        duration: 2000,
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
      });

      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error approving sitter:", error);
      toast.error("Failed to approve pet sitter. Please try again.", {
        duration: 3000,
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    }
  };

  const handleRejectSitter = async (sitterId: number) => {
    try {
      if (!rejectReason.trim()) {
        toast.error("Please provide a reason for rejection");
        return;
      }

      await AdminSitterService.rejectSitter(sitterId, rejectReason);
      toast.success("Pet Sitter rejected successfully", {
        duration: 2000,
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
      });

      // Close modal first
      setShowRejectModal(false);
      setRejectReason("");

      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error rejecting sitter:", error);
      toast.error("Failed to reject pet sitter. Please try again.", {
        duration: 3000,
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    }
  };

  return {
    showRejectModal,
    setShowRejectModal,
    rejectReason,
    setRejectReason,
    handleApproveSitter,
    handleRejectSitter,
  };
}
