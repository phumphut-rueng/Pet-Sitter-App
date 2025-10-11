import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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

type GetSitterResponse = {
  user: { id: number; name: string; profile_image: string | null };
  sitter: null | { id: number; name: string | null };
};

export default function PetSitterBookingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/icons/avatar-placeholder.svg");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const { data: session, status } = useSession();

  useEffect(() => {
    (async () => {
      const { data } = await axios.get<GetSitterResponse>("/api/sitter/get-profile-sitter");
      setUserName(data.user.name || data.sitter?.name || "");
      setAvatarUrl(data.user.profile_image || "/icons/avatar-placeholder.svg");
    })();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      (async () => {
        const { data } = await axios.get("/api/sitter/booking/booking-list");
        setBookings(data);
      })();
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <SitterSidebar className="min-w-0" />
      <section className="flex-1 min-w-0">
        <PetSitterNavbar avatarUrl={avatarUrl} name={userName} />

        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-9">Booking List</h2>

            {/* Search + Filter */}
            <div className="flex flex-row items-center justify-between gap-3">
              <div className="relative w-1/2">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-4 pr-10 h-10 rounded-sm border-gray-2 bg-white placeholder:text-gray-6"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] !h-10 rounded-sm border-gray-2 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-2">
                  <SelectItem value="All">All status</SelectItem>
                  <SelectItem value="waitingConfirm">Waiting for confirm</SelectItem>
                  <SelectItem value="waitingService">Waiting for service</SelectItem>
                  <SelectItem value="inService">In service</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-1">
            <table className="w-full text-left">
              <thead className="bg-black text-white">
                <tr>
                  <th className="py-3 px-5 text-sm font-medium">Pet Owner Name</th>
                  <th className="py-3 px-4 text-sm font-medium">Pet(s)</th>
                  <th className="py-3 px-5 text-sm font-medium">Duration</th>
                  <th className="py-3 px-5 text-sm font-medium">Booked Date</th>
                  <th className="py-3 px-7 text-sm font-medium">Status</th>
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
