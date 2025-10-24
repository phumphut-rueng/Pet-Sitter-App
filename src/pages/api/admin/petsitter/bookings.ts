import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

// Map status name from DB to Admin StatusBadge key
function mapStatusNameToBadgeKey(name: string) {
  switch (name.toLowerCase()) {
    case "waiting for confirm":
      return "waitingConfirm" as const;
    case "waiting for service":
      return "waitingService" as const;
    case "in service":
      return "inService" as const;
    case "success":
      return "success" as const;
    case "canceled":
      return "canceled" as const;
    default:
      return "waitingConfirm" as const;
  }
}

// Map status name from DB to BookingDetailDialog key
function mapStatusNameToDialogKey(name: string) {
  switch (name.toLowerCase()) {
    case "waiting for confirm":
      return "waiting" as const;
    case "waiting for service":
      return "waiting_for_service" as const;
    case "in service":
      return "in_service" as const;
    case "success":
      return "success" as const;
    case "canceled":
      return "canceled" as const;
    default:
      return "waiting" as const;
  }
}

function formatListDateRange(start: Date, end: Date) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Bangkok",
    });

  const formatDate = (date: Date) =>
    date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Bangkok",
    });

  return `${formatDate(start)}, ${formatTime(start)} - ${formatTime(end)}`;
}

function formatDetailDateRange(start: Date, end: Date) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Bangkok",
    });

  const formatDate = (date: Date) =>
    date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Bangkok",
    });

  return `${formatDate(start)} | ${formatTime(start)} - ${formatTime(end)}`;
}

function calculateDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 30) {
    return `${hours} hours 30 min`;
  }
  if (minutes > 30) {
    hours += 1;
  }
  return `${hours} ${hours > 1 ? "hours" : "hour"}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const { sitterId, id, page, limit } = req.query as {
      sitterId?: string;
      id?: string;
      page?: string;
      limit?: string;
    };
    if (!sitterId || isNaN(Number(sitterId))) {
      return res.status(400).json({ message: "Missing or invalid sitterId" });
    }

    const sid = Number(sitterId);

    // Detail mode
    if (id) {
      const bid = Number(id);
      if (isNaN(bid)) {
        return res.status(400).json({ message: "Invalid booking id" });
      }

      const b = await prisma.booking.findFirst({
        where: { id: bid, pet_sitter_id: sid },
        include: {
          status_booking_booking_status_idTostatus: true,
          booking_pet_detail: {
            include: {
              pet: { include: { pet_type: true } },
            },
          },
          booking: true,
        },
      });

      if (!b) return res.status(404).json({ message: "Booking not found" });

      const pets = b.booking_pet_detail.map((p) => ({
        id: p.pet.id,
        name: p.pet.name,
        species: p.pet.pet_type.pet_type_name,
        img: p.pet.image_url || "/icons/avatar-placeholder.svg",
      }));

      const detail = {
        id: b.id,
        ownerName: b.name,
        pets: pets.length,
        petsDetail: pets,
        duration: calculateDuration(new Date(b.date_start), new Date(b.date_end)),
        bookingDate: formatDetailDateRange(new Date(b.date_start), new Date(b.date_end)),
        totalPaid: Number(b.amount ?? 0),
        transactionNo: b.transaction_id ?? "-",
        transactionDate: b.transaction_date,
        status: mapStatusNameToDialogKey(
          b.status_booking_booking_status_idTostatus?.name ?? "waiting for confirm"
        ),
        message: b.additional ?? "-",
        ownerEmail: b.email,
        ownerPhone: b.phone,
        ownerIdNumber: b.booking?.id_number ?? "-",
        ownerDOB: b.booking?.dob
          ? new Date(b.booking.dob).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          : "-",
        avatarUrl: b.booking?.profile_image || "/icons/avatar-placeholder.svg",
      };

      return res.status(200).json(detail);
    }

    // List mode
    const pageNum = parseInt(page || "1", 10);
    const limitNum = parseInt(limit || "10", 10);
    const skip = (pageNum - 1) * limitNum;

    const totalRecords = await prisma.booking.count({
      where: { pet_sitter_id: sid },
    });

    const bookings = await prisma.booking.findMany({
      where: { pet_sitter_id: sid },
      skip,
      take: limitNum,
      include: {
        status_booking_booking_status_idTostatus: true,
        booking_pet_detail: true,
      },
      orderBy: { id: "desc" },
    });

    const list = bookings.map((b) => ({
      id: b.id,
      ownerName: b.name,
      petCount: b.booking_pet_detail.length,
      duration: calculateDuration(new Date(b.date_start), new Date(b.date_end)),
      bookedDate: formatListDateRange(new Date(b.date_start), new Date(b.date_end)),
      status: mapStatusNameToBadgeKey(
        b.status_booking_booking_status_idTostatus?.name ?? "waiting for confirm"
      ),
    }));

    const totalPages = Math.ceil(totalRecords / limitNum);

    return res.status(200).json({
      data: list,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        totalRecords,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching sitter bookings (admin):", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
