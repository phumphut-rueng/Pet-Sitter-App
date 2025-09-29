import { useState } from "react";
import { Pagination } from "@/components/pagination/Pagination";
import ProgressBar from "@/components/progress-step/ProgressBar";
import ProgressStep from "@/components/progress-step/ProgressStep";
import BookingConfirmation from "@/components/modal/BookingConfirmation";
import RejectConfirmation from "@/components/modal/RejectConfirmation";
import RatingSelect from "@/components/ratingStar";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import InputText from "@/components/input/InputText";
import InputTextArea from "@/components/input/InputTextArea";
import { PetTypeBadge } from "@/components/badges/PetTypeBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import ImageGallery from "@/components/form/ImageGalleryUpload";
import AvatarUploader from "@/components/form/AvatarUpload";
import { cn } from "@/lib/utils";
import PinSelection from "@/components/PinSelection";
import ChatList from "@/components/chat/ChatList";
import ChatContainer from "@/components/chat/ChatContainer";
import PetTypeCheckBox from "@/components/petTypeCheckBox";
import CashButton from "@/components/buttons/CashButton";
import IconButton from "@/components/buttons/IconButton";
import Sidebar from "@/components/layout/SitterSidebar";
import { PetSitterCard, PetSitterCardLarge, PetSitterCardSmall } from "@/components/cards/PetSitterCard";
import BookingCard from "@/components/cards/BookingCard";
import PetCard from "@/components/cards/PetCard";
import AccountSidebarMini from "@/components/layout/AccountSidebarMini";
import BookingSelect from "@/components/modal/BookingSelect";


// Section Wrapper
const Section = ({ title, cols = 1, children }: {
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
const COVER = "/images/cards/pet-sitter-cover.svg";
const AVATAR = "/images/cards/jane-maison.svg";
const PETIMG = "/images/cards/pet-cat-mr-hem-card.svg";




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
    <div className="space-y-10">
      {/* ---------- ชุดที่ 1: ไซส์ใหญ่ 207×240 (4×2 ใบ) ---------- */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Pet Cards — Large (207×240)</h2>

        {/* grid 4 คอลัมน์ × 2 แถว, gap = 16px */}
        <div className="grid grid-cols-4 gap-4 min-w-0">
          {pets.map((p) => (
            <div key={`lg-${p.id}`} className="min-w-0 flex justify-center">
              <PetCard
                name={p.name}
                species="Cat"
                img={PETIMG}
                selected={p.selected}
                disabled={p.disabled}
                width={207}
                height={240}
                avatarSize={104} // แนะนำสำหรับใบ 207×240
              />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- ชุดที่ 2: ไซส์ย่อ 180×209 (4×2 ใบ) ---------- */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Pet Cards — Compact (180×209)</h2>

        {/* grid 4 คอลัมน์ × 2 แถว, gap = 16px */}
        <div className="grid grid-cols-4 gap-4 min-w-0">
          {pets.map((p) => (
            <div key={`sm-${p.id}`} className="min-w-0 flex justify-center">
              <PetCard
                name={p.name}
                species="Cat"
                img={PETIMG}
                selected={p.selected}
                disabled={p.disabled}
                width={180}
                height={209}
                avatarSize={96} // แนะนำสำหรับใบ 180×209
              />
            </div>
          ))}
        </div>
      </section>
    </div>
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
  sitterName: "Jane Maison",
  avatarUrl: "/images/cards/jane-maison.svg",
  transactionDate: "Tue, 16 Aug 2023",
  dateTime: "25 Aug, 2023  |  7 AM – 10 AM",
  duration: "3 hours",
  pet: "Mr.Ham, Bingsu",
};
const on = (k: string) => () => console.log(k);
//===================================================================

export default function ComponentAll() {
  //ใช้สำหรับ modal
  const [isOpenBooking, setIsOpenBooking] = useState(false);
  const [isOpenReject, setIsOpenReject] = useState(false);
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [isOpenBookingSelect, setIsOpenBookingSelect] = useState(false);

  return (
    <div className="min-h-screen text-white p-6">
      <div className=" mx-auto space-y-10">
        {/* Rating */}
        <Section title="Selection">
          <SubSection title="Checkbox - Radio [คุณเอป]">
            <PetTypeCheckBox layout="column" />
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
            <PinSelection />
          </SubSection>
          <SubSection title="Payment Selection [คุณเอป]">
            <CashButton />
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

        {/* ========================== CARD SYSTEM ========================== */}
        {/*
  notekaa:
  - ใช้ {...sitterCommon}  มีข้อมูล: title, hostName, location, coverUrl, avatarUrl
  - ใช้ {...bookingBase}  มีข้อมูล: title, sitterName, avatarUrl, transactionDate, dateTime, duration, pet
  - สีกรอบส้ม: Large=border-orange-5 (#FF7037), Small=border-orange-6 (#E44A0C)
  - Responsive: Desktop="hidden md:block", Mobile="md:hidden"
*/}

        <Section title="การ์ด + Sidebar">
          <SubSection title="card เกือบเสร็จ ขาดนิดเดียว 😅">

            {/* ===================== SIDEBAR ===================== */}
            {/* : <SidebarDemo /> */}
            <SidebarDemo />
            <AccountSidebarMini />

            {/* ===================== PET CARDS ===================== */}
            {/* 
      วิธีใช้ PetCard:
      <PetCard 
        name="ชื่อสัตว์เลี้ยง"
        species="Dog|Cat|Bird|Rabbit"
        img="url รูปภาพ"
        selected={true|false}
        disabled={true|false}
        onClick={() => {}}
      />
    */}
            <div className="w-full space-y-6">
              <h3 className="text-lg font-semibold text-ink/90">Pet Cards</h3>
              <PetCardGrid />
            </div>

            {/* ===================== LARGE PET SITTER CARDS ===================== */}
            {/* 
      วิธีใช้ PetSitterCardLarge:
      
      แบบรูปซ้าย (default):
      <PetSitterCardLarge 
        {...sitterCommon}
        rating={1-5}
        tags={["Dog", "Cat", "etc"]}
        className="เพิ่ม style ได้"
      />
      
      แบบรูปบน (cover):
      <PetSitterCardLarge 
        {...sitterCommon}
        lgLayout="cover"
        rating={1-5}
        tags={["Dog", "Cat", "etc"]}
        className="min-h-[268px]"
      />
      
    */}
            <div className="space-y-3 rounded-2xl border border-dashed border-purple-300 p-5">
              <h3 className="text-lg font-semibold text-ink/90">Pet Sitter – Large</h3>

              {/* Desktop: รูปซ้าย (ปกติ + มีกรอบส้ม) */}
              <div className="hidden md:block w-[848px] mx-auto space-y-4">
                <PetSitterCardLarge {...sitterCommon} rating={5} className="min-h-[216px] cursor-pointer" tags={["Dog", "Cat", "Rabbit"]} />
                <PetSitterCardLarge {...sitterCommon} rating={5} className="min-h-[216px] cursor-pointer border-[1px] border-orange-5" tags={["Dog", "Cat", "Rabbit"]} />
              </div>

              {/* Desktop: รูปบน (cover layout) ขนาด 335×268 */}
              <div className="hidden md:block w-[335px] mx-auto">
                <PetSitterCardLarge {...sitterCommon} lgLayout="cover" rating={5} className="cursor-pointer min-h-[268px]" tags={["Dog", "Cat", "Rabbit"]} />
              </div>

              {/* Mobile: ใช้ chips variant แทน */}
              <div className="md:hidden">
                <PetSitterCard {...sitterCommon} size="sm" variant="chips" rating={5} tags={["Dog", "Cat", "Rabbit"]} />
              </div>
            </div>

            {/* ===================== SMALL PET SITTER CARDS ===================== */}
            <div className="w-full max-w-[848px] mx-auto space-y-3 rounded-2xl border border-dashed border-purple-300 p-5">
              <h3 className="text-lg font-semibold text-ink/90">Pet Sitter – Small</h3>
              <div className="w-full flex justify-center">
                <div className="grid gap-8 justify-items-center grid-cols-1 md:[grid-template-columns:471px_330px]">
                  <PetSitterCardSmall {...sitterCommon} rating={5} smPreset="wide" tags={["Dog", "Cat", "Bird", "Rabbit"]} />
                  <PetSitterCardSmall {...sitterCommon} rating={5} smPreset="compact" tags={["Dog", "Cat", "Bird", "Rabbit"]} />
                  <PetSitterCardSmall {...sitterCommon} rating={5} smPreset="wide" className="border-[1px] border-orange-6" tags={["Dog", "Cat", "Bird", "Rabbit"]} />
                  <PetSitterCardSmall {...sitterCommon} rating={5} smPreset="compact" className="border-[1px] border-orange-6" tags={["Dog", "Cat", "Bird", "Rabbit"]} />
                </div>
              </div>
            </div>
            {/* =========================================================
          BOOKING CARDS (Desktop 4 + Mobile 4)
      ========================================================= */}
            <div className="mx-auto space-y-3 rounded-2xl border border-dashed border-purple-300 p-5">
              <h3 className="text-lg font-semibold text-ink/90">Booking Cards</h3>
              <p className="text-gray-500 text-sm -mt-1">
              </p>

              {/* ---------- Desktop (WIDE) : 4 แบบ ---------- */}
              <div className="space-y-4">
                <BookingCard
                  {...bookingBase}
                  status="waiting"
                  layout="wide"
                  note="Waiting Pet Sitter for confirm booking"
                  actions={[
                    { key: "message", label: "Send Message", onClick: on("message") },
                    { key: "change", label: "Change", onClick: on("change") },
                    { key: "call", label: "Call", onClick: on("call") },
                  ]}
                />


                <BookingCard
                  {...bookingBase}
                  status="in_service"
                  layout="wide"
                  note="Your pet is already in Pet Sitter care!"
                  actions={[
                    { key: "message", onClick: on("message") },
                    { key: "call", onClick: on("call") },
                  ]}
                />

                <BookingCard
                  {...bookingBase}
                  status="success"
                  layout="wide"
                  successDate="Tue, 25 Oct 2022  |  11:03 AM"
                  actions={[
                    { key: "report", label: "Report", onClick: on("report") },
                    { key: "review", label: "Review", onClick: on("review") },
                    { key: "call", onClick: on("call") },
                  ]}
                />

                <BookingCard
                  {...bookingBase}
                  status="success"
                  layout="wide"
                  successDate="Tue, 25 Oct 2022  |  11:03 AM"
                  actions={[
                    { key: "report", label: "Report", onClick: on("report") },
                    { key: "review", label: "Your Review", onClick: on("review") },
                    { key: "call", onClick: on("call") },
                  ]}
                />
              </div>

              {/* ---------- Mobile (COMPACT) : 4 แบบ ---------- */}
              {/* TIP: ตั้งกรอบ 375px เพื่อให้การ์ด mobile ตรงตาม Figma */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="w-[375px]">
                  <BookingCard
                    {...bookingBase}
                    layout="compact"
                    status="waiting"
                    note="Waiting Pet Sitter for confirm booking"
                    actions={[
                      { key: "message", label: "Send Message", onClick: on("message") },
                      { key: "change", label: "Change", onClick: on("change") },
                      { key: "call", label: "Call", onClick: on("call") },
                    ]}
                  />
                </div>

                <div className="w-[375px]">
                  <BookingCard
                    {...bookingBase}
                    layout="compact"
                    status="in_service"
                    note="Your pet is already in Pet Sitter care!"
                    actions={[
                      { key: "message", onClick: on("message") },
                      { key: "call", onClick: on("call") },
                    ]}
                  />
                </div>

                <div className="w-[375px]">
                  <BookingCard
                    {...bookingBase}
                    layout="compact"
                    status="success"
                    successDate="Tue, 25 Oct 2022  |  11:03 AM"
                    actions={[
                      { key: "report", label: "Report", onClick: on("report") },
                      { key: "review", label: "Review", onClick: on("review") },
                      { key: "call", onClick: on("call") },
                    ]}
                  />
                </div>



                <div className="w-[375px]">
                  <BookingCard
                    {...bookingBase}
                    layout="compact"
                    status="success"
                    successDate="Tue, 25 Oct 2022  |  11:03 AM"
                    actions={[
                      { key: "report", label: "Report", onClick: on("report") },
                      { key: "review", label: "Your Review", onClick: on("review") },
                      { key: "call", onClick: on("call") },
                    ]}
                  />
                </div>
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
            <PrimaryButton
              text="Booking Click!!"
              bgColor="primary"
              textColor="white"
              onClick={() => setIsOpenBooking(true)}
            />
            <PrimaryButton
              text="Reject Click!!"
              bgColor="primary"
              textColor="white"
              onClick={() => setIsOpenBooking(true)}
            />
            <PrimaryButton
              text="Popup Click!!"
              bgColor="secondary"
              textColor="orange"
              onClick={() => setIsOpenPopup(true)}
            />
            <PrimaryButton
              text="Booking Select  Click!!"
              bgColor="primary"
              textColor="white"
              onClick={() => setIsOpenBookingSelect(true)}
            />
          </SubSection>

          {/* 
          title
          description  
          textButton = ข้อความใน button ที่ confirm
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
          <BookingConfirmation
            title="title"
            description="description"
            textButton="textButton"
            open={isOpenPopup}
            onOpenChange={setIsOpenPopup}
            onConfirm={() => console.log("Popup confirmed")}
          />
          <BookingSelect
            open={isOpenBookingSelect}
            onOpenChange={setIsOpenBookingSelect}
            onConfirm={() => console.log("Booking Select")}
          />
        </Section>

        {/* Chat */}
        <Section title="Chat">
          <SubSection title="Chat List and Chat Container">
            <div className="flex flex-row gap-4">
              <ChatList />
              <ChatContainer />
            </div>
          </SubSection>
        </Section>
      </div>
    </div>

  );
}
