import { useState } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import ProgressBar from "@/components/progressStep/ProgressBar";
import ProgressStep from "@/components/progressStep/ProgressStep";
import BookingConfirmation from "@/components/modal/BookingConfirmation";
import RejectConfirmation from "@/components/modal/RejectConfirmation";
import RatingSelect from "@/components/ratingStar";
import PrimaryButton from "@/components/buttons/primaryButton";
import InputText from "@/components/input/InputText";
import InputTextArea from "@/components/input/InputTextArea";
import { PetTypeBadge } from "@/components/badges/pettypebadge";
import { StatusBadge } from "@/components/badges/statusbadge";
import ImageGallery from "@/components/form/imagegalleryupload";
import AvatarUploader from "@/components/form/avatarupload";
import { cn } from "@/lib/utils";
import PinSelection from "@/components/PinSelection";
import ChatList from "@/components/Chat/ChatList";
import ChatContainer from "@/components/Chat/ChatContainer";
import PetTypeCheckBox from "@/components/petTypeCheckBox";
import CashButton from "@/components/buttons/cashButton";
import IconButton from "@/components/buttons/iconButton";
import Sidebar from "@/components/layout/SitterSidebar";
import { PetSitterCard, PetSitterCardLarge, PetSitterCardSmall } from "@/components/cards/PetSitterCard";
import BookingCard from "@/components/cards/BookingCard";
import PetCard from "@/components/cards/PetCard";


// Section Wrapper
const Section = ({ title, cols = 2, children }: {
    title: string;
    cols?: number;
    children: React.ReactNode
}) => (
    <div className="space-y-4">
        <h2 className="text-xl font-bold text-center text-orange-5">{title}</h2>
        <div className={cn("grid gap-4", `sm:grid-cols-${cols}`)}>{children}</div>
    </div>
);

// SubSection Card
const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="p-4 border border-orange-5 rounded-lg  shadow-sm">
        <p className="text-sm font-semibold text-gray-6 mb-2">{title}</p>
        <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
);

//sidebar
const SidebarDemo: React.FC = () => {
    return (
      <div className="flex h-[520px] overflow-hidden rounded-xl border border-border">
        <Sidebar
          logoSrc="/icons/sitter-logo-1.svg"  
          onNavigate={(id) => console.log("goto:", id)}
        />
        <main className="flex-1 bg-white" />
      </div>
    );
  };

//card 123 
// assets
const COVER  = "/images/cards/pet-sitter-cover.svg";
const AVATAR = "/images/cards/jane-maison.svg";
const PETIMG = "/images/cards/pet-cat-mr-hem-card.svg";

// star (ใช้ในรีวิวตัวอย่าง)
const Star = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 fill-current ${className}`}>
    <path d="M12 3.75l2.72 5.51 6.08.88-4.4 4.29 1.04 6.07L12 17.77l-5.44 2.85 1.04-6.07-4.4-4.29 6.08-.88L12 3.75z" />
  </svg>
);

// chip สำหรับแสดง tags
function Chip({ label }: { label: string }) {
  const palette: Record<string, string> = {
    Dog: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    Cat: "bg-pink-50 text-pink-600 ring-pink-200",
    Bird: "bg-sky-50 text-sky-600 ring-sky-200",
    Rabbit: "bg-orange-50 text-orange-600 ring-orange-200",
  };
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium ring-1 ring-inset ${
        palette[label] || "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      {label}
    </span>
  );
}

// mock สำหรับ PetCard grid
const pets = [
  { id: 1, name: "Mr. Ham", selected: false },
  { id: 2, name: "Mr. Ham", selected: true },
  { id: 3, name: "Mr. Ham", disabled: true },
  { id: 4, name: "Mr. Ham" },
];

// grid แสดง PetCard
function PetCardGrid() {
  return (
    <section className="mt-4">
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {pets.map((p) => (
          <PetCard
            key={p.id}
            name={p.name}
            species="Cat"
            img={PETIMG}
            selected={p.selected}
            disabled={p.disabled}
            className="!w-full"
          />
        ))}
      </div>
    </section>
  );
}

// ข้อมูลร่วมสำหรับนามบัตร Sitter
const sitterCommon = {
  title: "Happy House!",
  hostName: "Jame Maison",
  location: "Senanikom, Bangkok",
  coverUrl: COVER,
  avatarUrl: AVATAR,
};

// ข้อมูลร่วมสำหรับ BookingCard
const bookingBase = {
  title: "Happy House!",
  sitterName: "Jame Maison",
  avatarUrl: AVATAR,
  dateTime: "25 Aug, 2023 | 7 AM – 10 AM",
  duration: "3 hours",
  pet: "Mr.Ham, Binguo",
  transactionDate: "Tue, 16 Aug 2023",
};


  

export default function ComponentAll() {
    const [isOpenBooking, setIsOpenBooking] = useState(false);
    const [isOpenReject, setIsOpenReject] = useState(false);

    return (
        <div className="min-h-screen text-white p-6">
            <div className=" mx-auto space-y-10">
                {/* Rating */}
                <Section title="Selection">
                    <SubSection title="Checkbox - Radio [คุณเอป]">
                    <PetTypeCheckBox layout="column"/>
                    </SubSection>
                    <SubSection title="Rating">
                        {/* 
                        value = Rating
                        */}
                        <RatingSelect
                            value={1}
                        />
                        <RatingSelect
                            value={5}
                        />
                    </SubSection>
                    <SubSection title="Pin Selection">
                        <PinSelection/>
                    </SubSection>
                    <SubSection title="Payment Selection [คุณเอป]">
                        <CashButton/>
                    </SubSection>
                </Section>

                {/* Icon */}
                <Section title="Icon">
                    <SubSection title="[เดี๋ยวเอามาใส่]">
                        <></>
                    </SubSection>
                </Section>

                {/* Button */}
                <Section title="Button" cols={1}>
                    <SubSection title="">
                        {/* 
                        วิธีใช้ เลือกสี bg ปุ่มได้เฉพาะใน bgColorMap และ textColor ได้เฉพาะใน textColorMap ถ้าอยากใช้สีอื่นต้อมาเพิ่มในนี้ก่อน
                        //สามารถเพิ่มเขียน override className ได้ เช่น เเก้ความยาวปุ่มด้วย px
                        */}
                        <PrimaryButton
                            text="facebook"
                            srcImage="/icons/fbIcon.svg"
                            bgColor="primary"
                            textColor="white"
                            className="px-16"
                        />
                        <PrimaryButton
                            text="facebook"
                            srcImage="/icons/fbIcon.svg"
                            bgColor="secondary"
                            textColor="orange"
                            className="px-16"
                        />
                        <PrimaryButton
                            text="facebook"
                            srcImage="/icons/fbIcon.svg"
                            bgColor="ghost"
                            textColor="orange"
                            className="px-16"
                        />
                        <PrimaryButton
                            text="facebook"
                            srcImage="/icons/fbIcon.svg"
                            bgColor="gray"
                            textColor="black"
                            className="px-16"
                        />
                        <IconButton icon="/icons/note.svg" />
                    </SubSection>
                </Section>

                {/* Input */}
                <Section title="Input" cols={1}>
                    <SubSection title="Input Field">
                        <InputText
                            label="Normal"
                            placeholder="placeholder"
                            type="text"
                            variant="default"
                        />
                        <InputText
                            label="Success"
                            placeholder="placeholder"
                            type="text"
                            variant="success"
                        />
                        <InputText
                            label="error"
                            placeholder="placeholder"
                            type="text"
                            variant="error"
                        />
                        <InputText
                            label="disabled"
                            placeholder="placeholder"
                            type="text"
                            variant="default"
                            disabled={true}
                        />
                        <InputTextArea
                            label="TextArea"
                            placeholder="placeholder"
                        />
                    </SubSection>
                </Section>

                {/* Upload Image */}
                <Section title="Upload Image">
                    <SubSection title="Upload Image">
                        {/* 
                        currentPage = หน้าที่เลือกอยู่
                        totalPages = หน้าทั้งหมด
                        */}
                        <ImageGallery
                        />
                    </SubSection>
                    <SubSection title="Avatar">
                        {/* 
                        currentPage = หน้าที่เลือกอยู่
                        totalPages = หน้าทั้งหมด
                        */}
                        <AvatarUploader
                        />
                    </SubSection>
                </Section>

                {/* Badge */}
                <Section title="Badge">
                    {/* 
                    status = ชื่อ
                    */}
                    <SubSection title="Booking Status">
                        <StatusBadge
                            status="waitingConfirm"
                        />
                        <StatusBadge
                            status="waitingService"
                        />
                        <StatusBadge
                            status="inService"
                        />
                        <StatusBadge
                            status="success"
                        />
                    </SubSection>

                    <SubSection title="Pet Sitter Status">
                        <StatusBadge
                            status="waitingApprove"
                        />
                        <StatusBadge
                            status="approved"
                        />
                        <StatusBadge
                            status="rejected"
                        />
                    </SubSection>

                    <SubSection title="Pet OwnerStatus">
                        <StatusBadge
                            status="normal"
                        />
                        <StatusBadge
                            status="banned"
                        />
                    </SubSection>

                    <SubSection title="Report Status">
                        <StatusBadge
                            status="newReport"
                        />
                        <StatusBadge
                            status="pending"
                        />
                        <StatusBadge
                            status="resolved"
                        />
                    </SubSection>

                    <SubSection title="Pet Type">
                        {/* 
                        typeKey = ชื่อ
                        */}
                        <PetTypeBadge
                            typeKey="dog"
                        />
                        <PetTypeBadge
                            typeKey="cat"
                        />
                        <PetTypeBadge
                            typeKey="bird"
                        />
                        <PetTypeBadge
                            typeKey="rabbit"
                        />
                    </SubSection>
                </Section>

                {/* Progress */}
                <Section title="Progress">
                    <SubSection title="Progress Bar">
                        {/* 
                        number = เลขในวงกลม
                        label = ตัวหนังสือ
                        status = สีของวงกลม
                        */}
                        <ProgressBar
                            label="Booking"
                            status="active"
                        />
                        <ProgressBar
                            number={2}
                            label="Payment"
                            status="inactive"
                        />
                        <ProgressBar
                            number={3}
                            label="Done"
                            status="done"
                        />
                    </SubSection>

                    <SubSection title="Progress Step">
                        {/* 
                        activeNumner = วงที่กลมที่กำลัง active อยู่
                        */}
                        <ProgressStep
                            activeNumner={2} />
                    </SubSection>
                </Section>

                {/* Card */}
                <Section title="sidebar + card ">
                    <SubSection title="card ยังไม่เสร็จ อีก 2 บางไสตล์">
                    <SidebarDemo />
                    {/* ============ (A) PET CARD DEMO ============ */}
                <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-ink/90">Pet Card</h3>
                 <PetCardGrid />
                </div>

{/* ============ (B) PET SITTER CARD – LARGE ============ */}
                    <div className="space-y-3 rounded-2xl border border-dashed border-purple-300 p-5">
                <h3 className="text-lg font-semibold text-ink/90">Pet Sitter Card – Large</h3>

{/* Large #1 */}
            <div>
    {/* desktop */}
                 <div className="hidden md:block">
                     <PetSitterCardLarge
                          {...sitterCommon}
                             rating={5}
                             tags={["Dog", "Cat", "Rabbit"]}
                             variant="default"
                           />
                 </div>
    {/* mobile → chips */}
                                     <div className="md:hidden">
                                <PetSitterCard
                                    {...sitterCommon}
                                    size="sm"
                                    variant="chips"
                                    rating={5}
                                    tags={["Dog", "Cat", "Rabbit"]}
                                />
                                </div>
                            </div>

  {/* Large #2 (border ส้มบน desktop) */}
                    <div>
                        <div className="hidden md:block">
                        <PetSitterCardLarge
                            {...sitterCommon}
                            rating={5}
                            className="border-orange-200"
                            tags={["Dog", "Cat", "Rabbit"]}
                            variant="default"
                        />
                        </div>
                        <div className="md:hidden">
                        <PetSitterCard
                            {...sitterCommon}
                            size="sm"
                            variant="chips"
                            rating={5}
                            tags={["Dog", "Cat", "Rabbit"]}
                        />
                        </div>
                    </div>

  {/* mini 335×268 ( Variant3, mb) */}
                            <div className="w-[335px]">
                                <PetSitterCard
                                {...sitterCommon}
                                size="sm"
                                variant="default"
                                rating={5}
                                tags={["Dog", "Cat", "Rabbit"]}
                                />
                            </div>
                            </div>

{/* ============ (C) PET SITTER CARD – SMALL ============ */}
                                <div className="space-y-3 rounded-2xl border border-dashed border-purple-300 p-5">
                                <h3 className="text-lg font-semibold text-ink/90">Pet Sitter Card – Small</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <PetSitterCardSmall
                                    {...sitterCommon}
                                    variant="default"
                                    rating={5}
                                    tags={["Dog", "Cat", "Bird", "Rabbit"]}
                                    />
                                    <PetSitterCardSmall
                                    {...sitterCommon}
                                    variant="default"
                                    rating={5}
                                    className="border-orange-200"
                                    tags={["Dog", "Cat", "Bird", "Rabbit"]}
                                    />
                                    <PetSitterCardSmall
                                    {...sitterCommon}
                                    variant="default"
                                    rating={5}
                                    className="border-orange-200"
                                    tags={["Dog", "Cat", "Rabbit"]}
                                    />
                                    <PetSitterCardSmall
                                    {...sitterCommon}
                                    variant="default"
                                    rating={5}
                                    className="border-green-200"
                                    tags={["Dog", "Cat", "Rabbit"]}
                                    />
                                </div>
                                </div>

{/* ============ (D) BOOKING CARD ============ */}
                                            <div className="space-y-3 rounded-2xl border border-dashed border-purple-300 p-5">
                                            <h3 className="text-lg font-semibold text-ink/90">Booking Card</h3>

                                            {/* wide */}
                                            <div className="space-y-4">
                                                <BookingCard
                                                {...bookingBase}
                                                status="waiting"
                                                note="Waiting for Sitter to confirm booking"
                                                layout="wide"
                                                actions={[{ key: "message" }]}
                                                />
                                                <BookingCard
                                                {...bookingBase}
                                                status="in_service"
                                                note="You are already in Sitter card"
                                                layout="wide"
                                                actions={[{ key: "message" }]}
                                                />
                                                <BookingCard
                                                {...bookingBase}
                                                status="success"
                                                successDate="Tue, 25 Oct 2022 | 11:03 AM"
                                                layout="wide"
                                                actions={[{ key: "report" }, { key: "review" }]}
                                                />
                                            </div>

  {/* compact */}
                                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                                <BookingCard
                                                {...bookingBase}
                                                status="waiting"
                                                layout="compact"
                                                actions={[{ key: "message" }]}
                                                />
                                                <BookingCard
                                                {...bookingBase}
                                                status="in_service"
                                                layout="compact"
                                                actions={[{ key: "message" }]}
                                                />
                                                <BookingCard
                                                {...bookingBase}
                                                status="success"
                                                successDate="Tue, 25 Oct 2022 | 11:03 AM"
                                                layout="compact"
                                                actions={[{ key: "report" }, { key: "review" }]}
                                                />
                                            </div>
                                            </div>

                    </SubSection>
                </Section>

                {/* Pagination */}
                <Section title="Pagination">
                    <SubSection title="">
                        {/* 
                        currentPage = หน้าที่เลือกอยู่
                        totalPages = หน้าทั้งหมด
                        */}
                        <Pagination
                            currentPage={5}
                            totalPages={45}
                        />
                    </SubSection>
                </Section>

                {/* Modal */}
                <Section title="Modal">
                    {/* 
                    สร้าง button เอามาไว้กดเรียกใช้ popup เฉยๆ
                    component นี้ต้องใช้กับ useState
                    */}
                    <SubSection title="Confirmation">
                        <button
                            className="bg-orange-5 text-white px-3 py-1 rounded hover:bg-orange-4 text-sm"
                            onClick={() => setIsOpenBooking(true)}
                        >
                            Booking
                        </button>
                        <button
                            className="bg-orange-5 text-white px-3 py-1 rounded hover:bg-orange-4 text-sm"
                            onClick={() => setIsOpenReject(true)}
                        >
                            Reject
                        </button>
                    </SubSection>

                    {/* 
                    open = ค่าที่เอาไว้สั่ง เปิด/ปิด
                    onOpenChange = เอาไว้ใช้กับ X
                    onConfirm = กด Confirm แล้วให้ทำอะไร
                    */}
                    <BookingConfirmation
                        open={isOpenBooking}
                        onOpenChange={setIsOpenBooking}
                        onConfirm={() => console.log("Booking confirmed")}
                    />
                    <RejectConfirmation
                        open={isOpenReject}
                        onOpenChange={setIsOpenReject}
                        onConfirm={() => console.log("Rejected")}
                    />
                </Section>

                {/* Chat */}
                <Section title="Chat">
                    <SubSection title="Chat List and Chat Container">
                        <div className="flex flex-row gap-4">
                            <ChatList/>
                            <ChatContainer/>
                        </div>
                    </SubSection>
                </Section>
            </div>
        </div>
    );
}
