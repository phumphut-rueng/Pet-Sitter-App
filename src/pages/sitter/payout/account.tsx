import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import SitterSidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomSelect } from "@/components/dropdown/CustomSelect";
import { BankSelect } from "@/lib/utils/data-select";
import InputText from "@/components/input/InputText";

const mockBankAccount = {
  accountNumber: "11333-45-543-444",
  accountName: "Jane Maison",
  bankName: "SCB",
};

type GetSitterResponse = {
  user: { id: number; name: string; profile_image: string | null };
  sitter: null | { id: number; name: string | null };
};

export default function PetSitterAccountPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/icons/avatar-placeholder.svg");
  const [bankName, setBankName] = useState(mockBankAccount.bankName);

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
          <div className="flex items-center justify-between mb-6">
            <div className=" flex gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-6 text-2xl"
              >
                <Image
                  src="/icons/arrow-left.svg"
                  alt="arrow-left"
                  width={12}
                  height={12}
                  className="w-3 h-3"
                />
              </button>
              <h1 className="text-2xl font-semibold">Payout Option</h1>
            </div>
            <button className="bg-orange-5 text-white px-9 py-3 rounded-full font-semibold hover:bg-orange-6">
              Update
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <label className="block font-medium mb-3">Book Bank Image*</label>
            <div className="w-50 h-60 bg-gray-2 mb-10"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">
                  Bank Account Number*
                </label>
                <input
                  type="text"
                  defaultValue={mockBankAccount.accountNumber}
                  className="w-full border border-gray-2 rounded-md px-4 py-3"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Account Name*</label>
                <input
                  type="text"
                  defaultValue={mockBankAccount.accountName}
                  className="w-full border border-gray-2 rounded-md px-4 py-3"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Bank Name*</label>
                <CustomSelect
                  value={bankName}
                  onChange={setBankName}
                  options={BankSelect}
                  placeholder="Select bank"
                  variant="default"
                  triggerSize="w-full !h-12"
                />

                {/* <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger className="w-full border-gray-2 !h-12 px-4 bg-white focus:invisible">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-2 cursor-pointer">
                    <SelectItem
                      value="SCB"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      SCB
                    </SelectItem>
                    <SelectItem
                      value="KBank"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      KBank
                    </SelectItem>
                    <SelectItem
                      value="BBL"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      BBL
                    </SelectItem>
                    <SelectItem
                      value="KTB"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      KTB
                    </SelectItem>
                    <SelectItem
                      value="TTB"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      TTB
                    </SelectItem>
                    <SelectItem
                      value="GSB"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      GSB
                    </SelectItem>
                    <SelectItem
                      value="BAY"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      BAY
                    </SelectItem>
                    <SelectItem
                      value="KKP"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      KKP
                    </SelectItem>
                    <SelectItem
                      value="CIMBT"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      CIMBT
                    </SelectItem>
                    <SelectItem
                      value="TISCO"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      TISCO
                    </SelectItem>
                    <SelectItem
                      value="UOBT"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      UOBT
                    </SelectItem>
                    <SelectItem
                      value="LHFG"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      LHFG
                    </SelectItem>
                    <SelectItem
                      value="ICBCT"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      ICBCT
                    </SelectItem>
                    <SelectItem
                      value="ISBT"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      ISBT
                    </SelectItem>
                    <SelectItem
                      value="Thai Credit Bank"
                      className="cursor-pointer hover:bg-gray-1"
                    >
                      Thai Credit Bank
                    </SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
