
export const formatDate = (iso: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  
  export const formatBookingDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const dateStr = s.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const startTime = s.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const endTime = e.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr} | ${startTime} - ${endTime}`;
  };
  
  export const calcDuration = (start: string, end: string) => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    if (hours > 0 && minutes > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} min`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${minutes} min`;
    }
  };
  
  export type MappedStatus =
    | "canceled"
    | "success"
    | "in_service"
    | "waiting"
    | "waiting_for_service";
  
  export const mapStatus = (
    bookingStatus: string,
    paymentStatus?: string
  ): MappedStatus => {
    const booking = bookingStatus?.trim().toLowerCase() || "";
    const payment = paymentStatus?.trim().toLowerCase() || "";
  
    if (booking.includes("cancel")) return "canceled";
    if (booking.includes("success")) return "success";
    if (booking.includes("in service")) return "in_service";
  
    if (booking.includes("waiting for confirm") && payment !== "successful") {
      return "waiting";
    }
    if (booking.includes("waiting for service")) return "waiting_for_service";
    if (booking.includes("waiting for confirm") && payment === "successful") {
      return "waiting_for_service";
    }
    return "waiting";
  };
  