import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import SitterSidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { Pagination } from "@/components/pagination/Pagination";

const mockPayouts = [
  {
    date: "25 Aug, 2025",
    from: "John Wick",
    transactionNo: "122312",
    amount: 900.0,
  },
  {
    date: "5 July, 2025",
    from: "Tony",
    transactionNo: "122242",
    amount: 700.0,
  },
  {
    date: "16 Jan, 2025",
    from: "Daisy",
    transactionNo: "122212",
    amount: 1200.0,
  },
  {
    date: "14 Dec, 2024",
    from: "Mai Mai",
    transactionNo: "122202",
    amount: 900.0,
  },
  {
    date: "3 Aug, 2024",
    from: "wawa",
    transactionNo: "122200",
    amount: 200.0,
  },
  {
    date: "29 Feb, 2024",
    from: "nong",
    transactionNo: "122192",
    amount: 300.0,
  },
];

type GetSitterResponse = {
  user: { id: number; name: string; profile_image: string | null };
  sitter: null | { id: number; name: string | null };
};

export default function PetSitterPayoutPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/icons/avatar-placeholder.svg");
  const totalEarning = mockPayouts.reduce((sum, p) => sum + p.amount, 0);

  useEffect(() => {
    (async () => {
      const { data } = await axios.get<GetSitterResponse>(
        "/api/sitter/get-profile-sitter"
      );
      setUserName(data.user.name || data.sitter?.name || "");
      setAvatarUrl(data.user.profile_image || "/icons/avatar-placeholder.svg");
    })();
  }, []);

  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <SitterSidebar className="min-w-0" />
      <section className="flex-1 min-w-0">
        <PetSitterNavbar avatarUrl={avatarUrl} name={userName} />
        <div className="px-6 py-8">
          <h1 className="text-2xl font-semibold mb-6">Payout Option</h1>

          <div className="flex gap-5 mb-6">
            <div className="flex-1 bg-white px-6 py-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/icons/money.svg" alt="earning" className="w-5 h-5" />
                <span className="font-medium text-black">Total Earning</span>
              </div>
              <span className="font-medium">
                {totalEarning.toLocaleString()} THB
              </span>
            </div>

            <button
              onClick={() => router.push("/sitter/payout/account")}
              className="flex-1 bg-white px-6 py-5 rounded-2xl flex items-center justify-between hover:bg-orange-1 transition"
            >
              <div className="flex items-center gap-2">
                <img src="/icons/wallet.svg" alt="bank" className="w-5 h-5" />
                <span className="text-black font-medium">Bank Account</span>
              </div>
              <div className="flex gap-4">
                <span className="text-orange-5 font-medium">SCB *444</span>
                <img
                  src="/icons/arrow-right.svg"
                  alt="bank"
                  className="w-2 h-2"
                />
              </div>
            </button>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 text-sm bg-black text-white px-6 py-3">
              <div>Date</div>
              <div>From</div>
              <div>Transaction No.</div>
              <div className="text-right">Amount</div>
            </div>

            {mockPayouts.map((payout, index) => (
              <div
                key={index}
                className="grid grid-cols-4 font-medium px-6 py-5 border-t-2 border-gray-1"
              >
                <div>{payout.date}</div>
                <div>{payout.from}</div>
                <div>{payout.transactionNo}</div>
                <div className="text-right text-green">
                  {payout.amount.toFixed(2)} THB
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
