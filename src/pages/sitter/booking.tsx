import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import SitterSidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, StatusKey } from "@/components/badges/StatusBadge";

type Booking = {
  id: number;
  ownerName: string;
  pets: number;
  duration: string;
  bookedDate: string;
  status: StatusKey;
};

// 🧪 Mock ข้อมูล
const mockBookings: Booking[] = [
  {
    id: 1,
    ownerName: "John Wick",
    pets: 2,
    duration: "3 hours",
    bookedDate: "25 Aug, 7 AM - 10 AM",
    status: "waitingConfirm",
  },
  {
    id: 2,
    ownerName: "Robert Jr.",
    pets: 1,
    duration: "24 hours",
    bookedDate: "12 Aug, 7 AM - 13 Aug, 7 AM",
    status: "waitingConfirm",
  },
  {
    id: 3,
    ownerName: "Maren Press",
    pets: 6,
    duration: "2 hours",
    bookedDate: "2 Aug, 7 AM - 9 AM",
    status: "waitingService",
  },
  {
    id: 4,
    ownerName: "Lincoln Vaccaro",
    pets: 4,
    duration: "3 hours",
    bookedDate: "25 Aug, 7 AM - 10 AM",
    status: "inService",
  },
  {
    id: 5,
    ownerName: "Andaman R",
    pets: 2,
    duration: "3 hours",
    bookedDate: "25 Aug, 7 AM - 10 AM",
    status: "success",
  },
  {
    id: 6,
    ownerName: "Chatchai Haithong",
    pets: 2,
    duration: "3 hours",
    bookedDate: "25 Aug, 7 AM - 10 AM",
    status: "canceled",
  },
];

type GetSitterResponse = {
  user: {
    id: number;
    name: string;
    profile_image: string | null;
  };
  sitter: null | {
    id: number;
    name: string | null;
  };
};

export default function PetSitterBookingPage() {
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/icons/avatar-placeholder.svg");

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredBookings = mockBookings.filter((b) => {
    const matchesSearch = b.ownerName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<GetSitterResponse>(
          "/api/sitter/get-profile-sitter"
        );
        setUserName(data.user.name || data.sitter?.name || "");
        setAvatarUrl(
          data.user.profile_image || "/icons/avatar-placeholder.svg"
        );
      } catch (error) {
        console.error("Failed to load sitter data:", error);
      }
    })();
  }, []);

  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <SitterSidebar className="min-w-0" />
      <section className="flex-1 min-w-0">
        <PetSitterNavbar avatarUrl={avatarUrl} name={userName} />
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-9">
                Booking List
              </h2>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-row items-center justify-between gap-3">
              <div className="relative w-1/2">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-4 pr-10 h-10 rounded-sm border-gray-2 bg-white placeholder:text-gray-6"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width={16}
                  height={16}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.15 13.15z"
                  />
                </svg>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] !h-10 rounded-sm border-gray-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-2">
                  <SelectItem value="All">All status</SelectItem>
                  <SelectItem value="waitingConfirm">
                    Waiting for confirm
                  </SelectItem>
                  <SelectItem value="waitingService">
                    Waiting for service
                  </SelectItem>
                  <SelectItem value="inService">In service</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-1">
            <table className="w-full text-left">
              <thead className="bg-black text-white">
                <tr>
                  <th className="py-3 px-5 text-sm font-medium">
                    Pet Owner Name
                  </th>
                  <th className="py-3 px-5 text-sm ont-medium">Pet(s)</th>
                  <th className="py-3 px-5 text-sm font-medium">Duration</th>
                  <th className="py-3 px-5 text-sm font-medium">Booked Date</th>
                  <th className="py-3 px-5 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t-2 border-gray-1 font-medium text-black cursor-pointer hover:bg-orange-1 transition"
                    onClick={() => router.push(`/sitter/booking/${b.id}`)}
                  >
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-2">
                      {b.status === "waitingConfirm" && (
                        <span className="inline-block w-2 h-2 bg-orange-5 rounded-full" />
                      )}
                      {b.ownerName}
                      </span>
                    </td>
                    <td className="py-4 px-5">{b.pets}</td>
                    <td className="py-4 px-5">{b.duration}</td>
                    <td className="py-4 px-5">{b.bookedDate}</td>
                    <td className="py-4 px-5">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 px-5 text-center">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
