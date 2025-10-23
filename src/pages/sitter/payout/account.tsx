import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import SitterSidebar from "@/components/layout/SitterSidebar";
import PetSitterNavbar from "@/components/PetSitterNavbar";
import Image from "next/image";
import { CustomSelect } from "@/components/dropdown/CustomSelect";
import { BankSelect } from "@/lib/utils/data-select";
import InputText from "@/components/input/InputText";
import toast, { Toaster } from "react-hot-toast";
import { PetPawLoading } from "@/components/loading/PetPawLoading";
import BookBankUpload, { BookBankState } from "@/components/form/BookBankUpload";
import { uploadToCloudinary } from "@/lib/cloudinary/upload-to-cloudinary";

type GetSitterResponse = {
  user: { id: number; name: string; profile_image: string | null };
  sitter: null | {
    id: number;
    name: string | null;
    bank_account_number: string | null;
    account_name: string | null;
    bank_name: string | null;
    book_bank_image: string | null;
  };
};

export default function PetSitterAccountPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/icons/avatar-placeholder.svg");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bookBankState, setBookBankState] = useState<BookBankState>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
      const { data } = await axios.get<GetSitterResponse>(
        "/api/sitter/get-profile-sitter"
      );
      setUserName(data.user.name || data.sitter?.name || "");
      setAvatarUrl(data.user.profile_image || "/icons/avatar-placeholder.svg");
      setAccountNumber(data.sitter?.bank_account_number || "");
      setAccountName(data.sitter?.account_name || "");
      setBankName(data.sitter?.bank_name || "");
      setBookBankState({
        existingImageUrl: data.sitter?.book_bank_image || "",
      });
    } catch {
      toast.error("Failed to load bank account information.");
    } finally {
      setLoading(false);
    }
    })();
  }, []);

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!accountNumber.trim()) {
      newErrors.bank_account_number = "Please enter your bank account number.";
    } else if (!/^\d{10,14}$/.test(accountNumber.trim())) {
      newErrors.bank_account_number = "Invalid bank account number format.";
    }

    if (!accountName.trim()) {
      newErrors.account_name = "Please enter the account holder name.";
    }

    if (!bankName.trim()) {
      newErrors.bank_name = "Please select a bank.";
    }

    if (!bookBankState.existingImageUrl && !bookBankState.newImageFile) {
      newErrors.book_bank_image = "Please upload your book bank image.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateFields()) {
      return;
    }
    try {
      setIsSaving(true);
      
      let bookBankImageUrl = bookBankState.existingImageUrl;
      
      // Upload new image
      if (bookBankState.newImageFile) {
        try {
          bookBankImageUrl = await uploadToCloudinary(bookBankState.newImageFile, {
            folder: "sitter-book-bank"
          });
        } catch {
          toast.error("Failed to upload book bank image. Please try again.");
          return;
        }
      }
      
      await axios.put("/api/sitter/put-sitter", {
        bank_account_number: accountNumber,
        account_name: accountName,
        bank_name: bankName,
        book_bank_image: bookBankImageUrl,
      });
      toast.success("Bank information updated successfully!");
    } catch {
      toast.error("Failed to update bank information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex container-1200 !px-0 bg-gray-1">
      <SitterSidebar className="min-w-0" />
      <section className="flex-1 min-w-0">
        <PetSitterNavbar avatarUrl={avatarUrl} name={userName} />
        {loading ? (
          <PetPawLoading message="Loading Bank Account" size="lg" />
        ) : (
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className=" flex gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-6 text-2xl cursor-pointer"
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
            <button
              onClick={handleUpdate}
              className="bg-orange-5 text-white px-9 py-3 rounded-full font-semibold hover:bg-orange-6 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Update"}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col items-start mb-6">
            <label className="block font-medium mb-3">Book Bank Image*</label>
            <BookBankUpload
              initialImageUrl={bookBankState.existingImageUrl}
              onChange={setBookBankState}
            />
            {errors.book_bank_image && (
              <p className="text-red text-sm mt-1">{errors.book_bank_image}</p>
            )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InputText
                  placeholder=""
                  label="Bank Account Number*"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  variant={errors.bank_account_number ? "error" : "default"}
                  className="w-full h-12 border border-gray-2 rounded-md px-4 py-3"
                />
                {errors.bank_account_number && (
                  <p className="text-red text-sm mt-1">
                    {errors.bank_account_number}
                  </p>
                )}
              </div>
              <div>
                <InputText
                  placeholder=""
                  label="Account Name*"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  variant={errors.account_name ? "error" : "default"}
                  className="w-full h-12 border border-gray-2 rounded-md px-4 py-3"
                />
                {errors.account_name && (
                  <p className="text-red text-sm mt-1">{errors.account_name}</p>
                )}
              </div>
              <div>
                <CustomSelect
                  placeholder="Select Bank"
                  label="Bank Name*"
                  value={bankName}
                  onChange={setBankName}
                  options={BankSelect}
                  variant="default"
                  triggerSize="w-full !h-12"
                />
                {errors.bank_name && (
                  <p className="text-red text-sm mt-1">{errors.bank_name}</p>
                )}

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
        )}
      </section>
      <Toaster position="top-right" />
    </main>
  );
}
