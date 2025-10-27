"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SitterSidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import { Pagination } from "@/components/pagination/Pagination";
import Image from "next/image";

type PayoutItem = {
  date: string;
  from: string;
  transactionNo: string;
  amount: number;
};

type GetSitterResponse = {
  user: {
    id: number;
    name: string;
    profile_image: string | null;
  };
  sitter: null | {
    id: number;
    name: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
  };
};

export default function PetSitterPayoutPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/icons/avatar-placeholder.svg");
  const [bankDisplay, setBankDisplay] = useState("-");
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  //ข้อมูลโปรไฟล์
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
        const bank = data.sitter?.bank_name || "";
        const account = data.sitter?.bank_account_number || "";
        const last3 = account ? account.slice(-3) : "";
        setBankDisplay(bank && account ? `${bank} *${last3}` : "-");
      } catch (error) {
        console.error("Failed to load sitter profile:", error);
      }
    })();
  }, []);

  // ข้อมูล Payout
  useEffect(() => {
    (async () => {
      try {
        setLoadingPayouts(true);
        const { data } = await axios.get<PayoutItem[]>("/api/sitter/get-booking?payout=true");
        const formatted = data.map((b) => ({
          date: b.date,
          from: b.from,
          transactionNo: b.transactionNo,
          amount: parseFloat(b.amount.toString()),
        }));
        setPayouts(formatted);
      } catch (error) {
        console.error("Failed to load payouts:", error);
      } finally {
        setLoadingPayouts(false);
      }
    })();
  }, []);

  const totalEarning = payouts.reduce((sum, p) => sum + p.amount, 0);
  const totalPages = Math.ceil(payouts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPayouts = payouts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <SitterSidebar className="min-w-0" />
      <section className="flex-1 min-w-0">
        <PetSitterNavbar avatarUrl={avatarUrl} name={userName} />
        {
          loadingPayouts
            ? <PetPawLoading
              message="Loading Payout Option"
              size="lg"
            />
            : <>
              <div className="px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-9">Payout List</h2>
                </div>

                {/* total + Bank */}
                <div className="flex flex-col md:flex-row gap-5 mb-8">
                  <div className="flex-1 bg-white px-6 py-5 rounded-2xl flex items-center justify-between border border-gray-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/icons/money.svg"
                        alt="earning"
                        width={12}
                        height={12}
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-gray-8">Total Earning</span>
                    </div>
                    <span className="font-semibold text-gray-9">
                      {totalEarning.toLocaleString()} THB
                    </span>
                  </div>

                  <button
                    onClick={() => router.push("/sitter/payout/account")}
                    className="flex-1 bg-white px-6 py-5 rounded-2xl flex items-center justify-between hover:bg-orange-1 border border-gray-2 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src="/icons/wallet.svg"
                        alt="bank"
                        width={12}
                        height={12}
                        className="w-5 h-5"
                      />
                      <span className="text-gray-9 font-medium">Bank Account</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-orange-5 font-semibold">
                        {bankDisplay}
                      </span>
                      <Image
                        src="/icons/arrow-right.svg"
                        alt="arrow"
                        width={12}
                        height={12}
                        className="w-2 h-2"
                      />
                    </div>
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-1">
                  <table className="w-full text-left rounded-2xl overflow-hidden">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="py-3 px-5 text-sm font-medium">Date</th>
                        <th className="py-3 px-5 text-sm font-medium">From</th>
                        <th className="py-3 px-5 text-sm font-medium">
                          Transaction No.
                        </th>
                        <th className="py-3 px-5 text-sm font-medium text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {
                        // loadingPayouts ? (
                        //   <tr>
                        //     <td colSpan={4} className="py-10 text-center">
                        //       <PetPawLoading
                        //         message="Loading payouts..."
                        //         size="lg"
                        //         baseStyleCustum="flex items-center justify-center w-full h-full"
                        //       />
                        //     </td>
                        //   </tr>
                        // ) : 
                        currentPayouts.length > 0 ? (
                          currentPayouts.map((payout, index) => (
                            <tr
                              key={index}
                              className="border-t-2 border-gray-1 font-medium text-gray-9"
                            >
                              <td className="py-4 px-5">{payout.date}</td>
                              <td className="py-4 px-5">{payout.from}</td>
                              <td className="py-4 px-5">{payout.transactionNo}</td>
                              <td className="py-4 px-5 text-right text-green">
                                {payout.amount.toFixed(2)} THB
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-6">
                              No payout history found
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="flex items-center justify-center mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onClick={(page) => setCurrentPage(page)}
                    />
                  </div>
                </div>
              </div>
            </>
        }
      </section>
    </main>
  );
}
