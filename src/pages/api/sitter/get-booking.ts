import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";

function mapStatusNameToKey(name: string) {
  switch (name.toLowerCase()) {
    case "waiting for confirm":
      return "waitingConfirm";
    case "waiting for service":
      return "waitingService";
    case "in service":
      return "inService";
    case "success":
      return "success";
    case "canceled":
      return "canceled";
    default:
      return "waitingConfirm";
  }
}

function formatListDateRange(start: Date, end: Date) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

  // Booking list: "25 Aug, 7 AM - 10 AM"
  const formatDate = (date: Date) =>
    date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  return `${formatDate(start)}, ${formatTime(start)} - ${formatTime(end)}`;
}

function formatDetailDateRange(start: Date, end: Date) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });

  // Booking detail: "16 Oct 2022 | 7 AM - 10 AM"
  const formatDate = (date: Date) =>
    date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

  return `${formatDate(start)} | ${formatTime(start)} - ${formatTime(end)}`;
}

// คำนวณเวลา duration
function calculateDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  // ถ้านาทีเป็น 30 → แสดง ชั่วโมง + 30 นาที
  if (minutes === 30) {
    return `${hours} hours 30 min`;
  }
  // ถ้านาทีมากกว่า 30 → ปัดเป็นชั่วโมงถัดไป
  if (minutes > 30) {
    hours += 1;
  }
  return `${hours} ${hours > 1 ? "hours" : "hour"}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  console.log("SESSION", session);
  if (!session?.user?.email)
    return res.status(401).json({ message: "Unauthorized" });

  const sitter = await prisma.sitter.findFirst({
    where: { user_sitter_id: Number(session.user.id) },
  });

  if (!sitter) return res.status(404).json({ message: "Sitter not found" });

  if (req.method === "GET") {
    const bookingId = req.query.id ? Number(req.query.id) : null;

    if (bookingId) {
      // Booking Detail
      const b = await prisma.booking.findFirst({
        where: { id: bookingId, pet_sitter_id: sitter.id },
        include: {
          status_booking_booking_status_idTostatus: true,
          booking_pet_detail: {
            include: {
              pet: {
                include: {
                  pet_type: true,
                },
              },
            },
          },
          user: true,
        },
      });

      if (!b) return res.status(404).json({ message: "Booking not found" });

      const pets = b.booking_pet_detail.map((p) => ({
        id: p.pet.id,
        name: p.pet.name,
        species: p.pet.pet_type.pet_type_name,
        img: p.pet.image_url || "/icons/avatar-placeholder.svg",
        breed: p.pet.breed,
        sex: p.pet.sex,
        age: p.pet.age_month.toString(),
        color: p.pet.color,
        about: p.pet.about,
        weight: p.pet.weight_kg.toString(),
      }));

      const detail = {
        id: b.id,
        ownerName: b.name,
        pets: pets.length,
        duration: calculateDuration(
          new Date(b.date_start),
          new Date(b.date_end)
        ),
        bookingDate: formatDetailDateRange(
          new Date(b.date_start),
          new Date(b.date_end)
        ),
        totalPaid: b.amount.toFixed(2),
        paymentMethod: b.payment_type ?? "-",
        transactionDate: b.transaction_date
          ? new Date(b.transaction_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
        transactionId: b.transaction_id ?? "-",
        message: b.additional ?? "-",
        status: mapStatusNameToKey(
          b.status_booking_booking_status_idTostatus?.name ??
            "waiting for confirm"
        ),
        petsDetail: pets,
        ownerEmail: b.email,
        ownerPhone: b.phone,
        ownerIdNumber: b.user?.id_number ?? "-",
        ownerDOB: b.user?.dob
          ? new Date(b.user.dob).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
        avatarUrl: b.user?.profile_image || "/icons/avatar-placeholder.svg",
      };

      return res.status(200).json(detail);
    } else {
      // Booking List
      const bookings = await prisma.booking.findMany({
        where: { pet_sitter_id: sitter.id },
        include: {
          status_booking_booking_status_idTostatus: true,
          booking_pet_detail: true,
        },
        orderBy: { id: "desc" },
      });

      const list = bookings.map((b) => ({
        id: b.id,
        ownerName: b.name,
        pets: b.booking_pet_detail.length,
        duration: calculateDuration(
          new Date(b.date_start),
          new Date(b.date_end)
        ),
        bookedDate: formatListDateRange(
          new Date(b.date_start),
          new Date(b.date_end)
        ),
        status: mapStatusNameToKey(
          b.status_booking_booking_status_idTostatus?.name ??
            "waiting for confirm"
        ),
      }));

      return res.status(200).json(list);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
